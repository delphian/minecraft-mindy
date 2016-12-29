var eventEmitter = require('events');
var twitchEvents = require('./twitch-events');
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
                if (username === mb.minecraft.username)
                    return;
                mb.tChat('[' + username + '] ' + msg);
            }
        });
        this.twitch.on('connected', function(address, port) {
            mb.tChat('Hello! I\'m a bot. Type \'help\' for information.');
        });
        this.twitch.on('join', function(channel, username, self) {
            var account = {
                "joins": 1,
                "points": 0,
                "lastSeen": null
            };
            if (mb.db.has(username)) {
                var record;
                try {
                    record = JSON.parse(mb.db.get(username));
                    account = record;
                    account.joins = account.joins + 1;
                } catch(e) {
                    mb.mChat('Corrupted ' + username + ' database record is being reset!');
                    console.log(record);
                }
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
            var keys = Object.keys(twitchEvents.events);
            // General help request.
            if (message == 'help') {
                mb.tChat('Type \'help {command}\' to learn more about each command.');
                var commands = 'Commands: ';
                for (var i=0; i < keys.length; i++) {
                    commands = commands + keys[i] + ", ";
                }
                commands = commands.substring(0, commands.length - 1);
                mb.tChat(commands);
            }
            // Help for a specific command.
            else if (words[0] == 'help') {
                if (keys.indexOf(words[1]) > -1) {
                    mb.tChat(twitchEvents.events[words[1]].help);
                } else {
                    mb.tChat('Unknown command: \'' + words[1] + '\'')
                }
            }
            // Execute a command.
            else if (keys.indexOf(message) > -1) {
                var tEvent = twitchEvents.events[message];
                for (var i=0; i < tEvent.responses.length; i++) {
                    mb.respond(user, message, message, tEvent.responses[i]);
                }
            // Relay regular chat message from twitch to minecraft.
            } else {
                mb.mChat('[' + user.username + '] ' + message);
            }
        });
    }
    /**
     * Process a single response to a twitch chat event.
     *
     * Multiple responses may be issued to a single twitch chat event.
     */
    respond(user, message, command, response) {
        var mb = this;
        setTimeout(function() {
            if (typeof(response['say']) != 'undefined') {
                var index = Math.floor(Math.random() * response.say.text.length);
                var msg = response.say.text[index];
                msg = msg.replace('$0', user.username);
                if (response.say.where == 'minecraft') {
                    mb.mChat(msg);
                } else if (response.say.where == 'twitch') {
                    mb.tChat(msg);
                } else {
                    console.log('Unknown say location.');
                }
            } else {
                console.log('Unknown execute verb.');
            }
        }, response.delay);
    }
}

module.exports = new MindyBot();

