var eventEmitter = require('events');
var twitchEvents = require('./twitch-events');
var MindyEvent = require('./mindy-event');
var flatfile = require('flat-file-db');

class MindyBot extends eventEmitter {
    constructor() {
        super();
        var mb = this;
        mb.minecraft = require('../config/minecraft');
        mb.twitch = require('../config/twitch');
        mb.db = flatfile('./db/data.db');
        process.on('SIGINT', function() {
            console.log("Caught interrupt signal");
            mb.db.close();
            mb.db.on('close', function() {
                process.exit();
            })
        });        
    }
    mChat(message) {
        this.minecraft.write('chat', { message: message });
    }
    tChat(message) {
        this.twitch.action(this.twitch.opts.channels[0], message);
    }
    run() {
        var mb = this;
        this.minecraft.on('login', function() {
            console.log('Connected to minecraft...');
        });
        this.minecraft.on('disconnect', function(packet) {
            console.log('Minecraft login failed! ' + JSON.parse(packet.reason).text);
        });
        this.minecraft.on('end', function() {
            console.log('Disconnected from minecraft.');
            mb.tChat("Oh no! I've been disconnected from minecraft!");
        });
        this.minecraft.on('chat', function(packet) {
            var jsonMsg = JSON.parse(packet.message);
            if (jsonMsg.translate == 'chat.type.announcement' || 
                jsonMsg.translate == 'chat.type.text')
            {
                var username = jsonMsg.with[0].text;
                var msg = jsonMsg.with[1];
                var words = msg.split(' ');
                if (username === mb.minecraft.username)
                    return;
                // Execute a code driven handled event.
                if (mb.listenerCount(words[0]) > 0) {
                    mb.emit(
                        words[0], 
                        new MindyEvent({ 
                            "message": msg, 
                            "words": words, 
                            "where": 'minecraft', 
                            "username": username,
                            "bot": mb
                        })
                    );
                // Execute a data driven handled event.
                } else if (typeof(twitchEvents.events[words[0]]) !== 'undefined') {
                    mb.emit(
                        'dataDrivenEvent',
                        new MindyEvent({
                            "message": msg,
                            "words": words,
                            "where": 'minecraft',
                            "username": username,
                            "bot": mb
                        }),
                        twitchEvents.events[words[0]]
                    );
                // Relay regular chat message from minecraft to twitch.
                } else {
                    mb.tChat('[' + username + '] ' + msg);
                }
            }
        });
        this.twitch.on('connected', function(address, port) {
            mb.tChat('Hello! I\'m a bot. Type \'help\' for information.');
        });
        this.twitch.on('join', function(channel, username, self) {
            var account = {
                "joins": 1,
                "points": 5,
                "lastSeen": null
            };
            if (mb.db.has(username)) {
                var record;
                try {
                    record = JSON.parse(mb.db.get(username));
                    account = record;
                    account.joins = account.joins + 1;
                    account.points = account.points + 1;
                    mb.mChat(username + ' has earned 1 point:  Joining chat.');
                } catch(e) {
                    mb.mChat('Corrupted ' + username + ' database record is being reset!');
                    console.log(record);
                }
            } else {
                mb.mChat(username + ' earned 5 points. Joining chat for the first time!');
            }
            mb.db.put(username, JSON.stringify(account));
            var info = username + ' joined chat, was last seen ' 
                + ((account.lastSeen === null) ? '<never>' : account.lastSeen) + ' and been here '
                + account.joins + ' times.';
            mb.mChat(info);
        });
        this.twitch.on('part', function(channel, username, self) {
            mb.mChat(username + ' left chat.');
            var account = JSON.parse(mb.db.get(username));
            account.lastSeen = Date.now();
            mb.db.put(username, JSON.stringify(account));
        });
        this.twitch.on('chat', function(channel, user, message, self) {
            var words = message.split(' ');
            // Execute a code driven handled event.
            if (mb.listenerCount(words[0]) > 0) {
                mb.emit(
                    words[0], 
                    new MindyEvent({ 
                        "message": message, 
                        "words": words, 
                        "where": 'twitch', 
                        "username": user.username,
                        "bot": mb
                    })
                );
            // Execute a data driven handled event.
            } else if (typeof(twitchEvents.events[words[0]]) !== 'undefined') {
                mb.emit(
                    'dataDrivenEvent',
                    new MindyEvent({
                        "message": message,
                        "words": words,
                        "where": 'twitch',
                        "username": user.username,
                        "bot": mb
                    }),
                    twitchEvents.events[words[0]]
                );
            // Relay regular chat message from twitch to minecraft.
            } else {
                mb.mChat('[' + user.username + '] ' + message);
            }
        });
    }
    /**
     * Retrieve user information from the database, or null if not found.
     */
    getUser(userName) {
        var account = null;
        try {
            account = JSON.parse(this.db.get(userName));
        } catch(e) {
            //
        }
        return account;
    }
}

var mindyBot = new MindyBot();

mindyBot.on('help', function(mindyEvent) {
    var mb = this;
    var keys = Object.keys(twitchEvents.events);
    // General help request.
    if (mindyEvent.message == 'help') {
        mindyEvent.Chat('Type \'help {command}\' to learn more about each command.');
        var commands = 'Commands: ';
        for (var i=0; i < keys.length; i++) {
            commands = commands + keys[i] + ", ";
        }
        commands = commands.substring(0, commands.length - 1);
        mindyEvent.Chat(commands);
    // Help for a specific data driven command.
    } else {
        if (keys.indexOf(mindyEvent.words[1]) > -1) {
            var info = twitchEvents.events[mindyEvent.words[1]].help 
                     + ' (cost: ' + twitchEvents.events[mindyEvent.words[1]].cost + ')';
            mindyEvent.Chat(info);
        } else {
            mindyEvent.Chat('Unknown command: \'' + mindyEvent.words[1] + '\'')
        }
    }
});

mindyBot.on('dataDrivenEvent', function(mindyEvent, tEvent) {
    var account = this.getUser(mindyEvent.username);
    if (account != null || mindyEvent.where == 'minecraft') {
        if (mindyEvent.where == 'minecraft' || (account.points >= tEvent.cost)) {
            if (typeof(account.points) !== 'undefined') {
                account.points = account.points - 1;
                mindyEvent.bot.db.put(mindyEvent.username, JSON.stringify(account));
                mindyEvent.Chat(mindyEvent.username + ' has ' + account.points + ' points left.');
            }
            for (var i=0; i < tEvent.responses.length; i++) {
                mindyEvent.bot.emit('dataDrivenResponse', mindyEvent, tEvent.responses[i]);
            }
        } else {
            mindyEvent.Chat(mindyEvent.username + ', you don\'t have enough points for that!');
        }
    } else {
        mindyEvent.Chat('Cant retrieve account details for ' + mindyEvent.username + '. Who are you??');
    }
});

/**
 * Process a single response to a data driven (json configured) chat event.
 *
 * Multiple responses may be issued to a single chat event.
 */
mindyBot.on('dataDrivenResponse', function(mindyEvent, response) {
    var mb = this;
    setTimeout(function() {
        if (typeof(response['say']) != 'undefined') {
            var index = Math.floor(Math.random() * response.say.text.length);
            var msg = response.say.text[index];
            msg = msg.replace('$0', mindyEvent.username);
            if (response.say.where == 'minecraft') {
                mb.mChat(msg);
            } else if (response.say.where == 'twitch') {
                mb.tChat(msg);
            } else {
                console.log('Unknown say location.');
            }
        } else {
            console.log('Unknown data driven execute verb.');
        }
    }, response.delay);
});

module.exports = mindyBot;
