var eventEmitter = require('events');
var MindyEvent = require('./mindy-event');
var AccountRepo = require('./accounts/account-repository');
var Account = require('./accounts/account');
var flatfile = require('flat-file-db');

class MindyBot extends eventEmitter {
    constructor() {
        super();
        var mb = this;
        this.minecraft = require('../config/minecraft');
        this.twitch = require('../config/twitch');
        this.db = flatfile('./db/data.db');
        // Account (users) CRUD repository.
        this.accountRepo = new AccountRepo(this.db);
        // Data driven (json configured) chat commands.
        this.commands = require('./commands');
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
                } else if (typeof(mb.commands.events[words[0]]) !== 'undefined') {
                    mb.emit(
                        '_commandEvent',
                        new MindyEvent({
                            "message": msg,
                            "words": words,
                            "where": 'minecraft',
                            "username": username,
                            "bot": mb
                        }),
                        mb.commands.events[words[0]]
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
            var account = new Account({ joins: 1, points: 5 });
            if (mb.accountRepo.exists(username)) {
                try {
                    account = mb.accountRepo.read(username);
                    account.joins = account.joins + 1;
                    account.points = account.points + 1;
                    mb.mChat(username + ' earned 1 point:  Joining chat.');
                } catch(e) {
                    mb.mChat('Corrupted ' + username + ' database record is being reset!');
                }
            } else {
                mb.mChat(username + ' earned 5 points: Joining chat for the first time!');
            }
            mb.accountRepo.update(username, account);
        });
        this.twitch.on('part', function(channel, username, self) {
            mb.mChat(username + ' left chat.');
            var account = mb.accountRepo.read(username);
            account.lastSeen = Date.now();
            mb.accountRepo.update(username, account);
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
            } else if (typeof(mb.commands.events[words[0]]) !== 'undefined') {
                mb.emit(
                    '_commandEvent',
                    new MindyEvent({
                        "message": message,
                        "words": words,
                        "where": 'twitch',
                        "username": user.username,
                        "bot": mb
                    }),
                    mb.commands.events[words[0]]
                );
            // Relay regular chat message from twitch to minecraft.
            } else {
                mb.mChat('[' + user.username + '] ' + message);
            }
        });
    }
}

var mindyBot = new MindyBot();

module.exports = mindyBot;
