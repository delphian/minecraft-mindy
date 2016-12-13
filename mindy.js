var mc = require('minecraft-protocol');
var tmi = require('tmi.js');
var minecraft = require('./config/minecraft');
var twitch = require('./config/twitch');

/**
 * Minecraft
 */
minecraft.on('chat', function(packet) {
    var jsonMsg = JSON.parse(packet.message);
    if (jsonMsg.translate == 'chat.type.announcement' || jsonMsg.translate == 'chat.type.text') {
        var username = jsonMsg.with[0].text;
        var msg = jsonMsg.with[1];
        if (username === minecraft.username) 
            return;
        twitch.action(twitch.opts.channels[0], username + ': ' + msg);
    }
});
minecraft.on('login', function(first, second) {
    console.log('Connected... ' + JSON.stringify(first, null, 4));
});
/*
minecraft.on('packet', function(packet) {
    console.log(packet);
});
*/

/**
 * Twitch
 */
twitch.on("connected", function(address, port) {
    twitch.action(twitch.opts.channels[0], "Hello! I'm a bot! Type 'help' to interact with minecraft.");
});
twitch.on('chat', function(channel, user, message, self) {
    if (message == 'rain') {
        minecraft.write('chat', { message: '/weather rain 30' });
    } else if (message == 'clear') {
        minecraft.write('chat', { message: '/weather clear' });
    } else if (message == 'help') {
        twitch.action(twitch.opts.channels[0], "'rain' - make weather rainy.");
        twitch.action(twitch.opts.channels[0], "'clear' - make weather clear.");
    } else {
        minecraft.write('chat', { message: user.username + ': ' + message });
    }
});
twitch.on("join", function (channel, username, self) {
    minecraft.write('chat', { message: username + ' has joined twitch' });
    twitch.action(twitch.opts.channels[0], "Hello " + username + ". I'm a bot! Type 'help' to interact with minecraft.");
});
twitch.on("part", function (channel, username, self) {
    minecraft.write('chat', { message: username + ' has left twitch' });
});

