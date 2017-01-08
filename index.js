var mindyBot = require('./src/client');
var moment = require('moment');

mindyBot.run();

mindyBot.on('!info', function(mindyEvent) {
    var account = (mindyEvent.words.length >= 2) ?
                  this.accountRepo.read(mindyEvent.words[1]) :
                  this.accountRepo.read(mindyEvent.username);
    if (account == null) {
        mindyEvent.Chat('Unknown user.');
    } else {
        mindyEvent.Chat(
            account.username + ' has ' + account.points + ' points, ' +
            account.joins + ' visits, ' +
            'and was last seen ' + moment(account.lastSeen).fromNow()
        );
    }
});

mindyBot.on('!help', function(mindyEvent) {
    var keys = Object.keys(this.commands.events);
    var command = (mindyEvent.words.length == 1) ? mindyEvent.words[0] : '!' + mindyEvent.words[1];
    // General help request.
    if (command == '!help') {
        mindyEvent.Chat('Type \'!help {command}\' to learn more about each command.');
        var info = 'Commands: ';
        for (var i=0; i < keys.length; i++) {
            info = info + this.commands.events[keys[i]].command + ", ";
        }
        info = info.substring(0, info.length - 2);
        mindyEvent.Chat(info);
    // Help for a specific data driven command.
    } else {
        if (keys.indexOf(command) > -1) {
            var info = command + ': '
                     + this.commands.events[command].help 
                     + ' (cost: ' + this.commands.events[command].cost + ')';
            mindyEvent.Chat(info);
        } else {
            mindyEvent.Chat('Unknown command: \'' + command + '\'')
        }
    }
});

/**
 * A command (json configured) was issued in the chat.
 */
mindyBot.on('_commandEvent', function(mindyEvent, tEvent) {
    var account = this.accountRepo.read(mindyEvent.username);
    if (account != null || mindyEvent.where == 'minecraft') {
        if (mindyEvent.where == 'minecraft' || (account.points >= tEvent.cost)) {
            if (account !== null && typeof(account['points']) !== 'undefined') {
                account.points = account.points - 1;
                this.accountRepo.update(mindyEvent.username, account);
                mindyEvent.Chat(mindyEvent.username + ' has ' + account.points + ' points left.');
            }
            for (var i=0; i < tEvent.responses.length; i++) {
                mindyEvent.bot.emit('_commandResponse', mindyEvent, tEvent.responses[i]);
            }
        } else {
            mindyEvent.Chat(mindyEvent.username + ', you don\'t have enough points for that!');
        }
    } else {
        mindyEvent.Chat('Cant retrieve account details for ' + mindyEvent.username + '. Who are you??');
    }
});

/**
 * Process a single response to a command (json configured) chat event.
 *
 * Multiple responses may be issued to a single chat event.
 */
mindyBot.on('_commandResponse', function(mindyEvent, response) {
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
