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
        twitch.action(twitch.opts.channels[0], '[' + username + '] ' + msg);
    }
});
minecraft.on('login', function() {
    console.log('Connected to minecraft... ');
});
/*
minecraft.on('packet', function(packet) {
    console.log(packet);
});
*/
minecraft.on('error', function(error) {
    console.log("Error: " + error);
});
minecraft.on('disconnect', function(packet) {
    console.log('Minecraft login failed! ' + JSON.parse(packet.reason).text);
});
minecraft.on('end', function() {
    console.log('Disconnected from minecraft.');
    twitch.action(twitch.opts.channels[0], "Oh no! I've been disconnected from minecraft!");
});

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
    } else if (message == 'slime') {
        minecraft.write('chat', { message: '/execute @a ~2 ~3 ~2 /summon minecraft:slime ~2 ~3 ~2 {Size:0,CustomName:"' + user.username + ' Slime",CustomNameVisible:1,Glowing:1}' });
        minecraft.write('chat', { message: user.username + " has summoned slimes!" });
    } else if (message == 'blind') {
        minecraft.write('chat', { message: '/effect @a blindness' });
        minecraft.write('chat', { message: 'The god ' + user.username + ' has cursed you for your many sins!' });
    } else if (message == 'nausea') {
        minecraft.write('chat', { message: '/effect @a Nausea' });
    } else if (message == 'particle hugeexplosion') {
        minecraft.write('chat', { message: '/execute @a ~ ~ ~ /particle hugeexplosion ~ ~ ~ 0 0 0 0' });
    } else if (message == 'help') {
        twitch.action(twitch.opts.channels[0], "'rain' - make weather rainy.");
        twitch.action(twitch.opts.channels[0], "'clear' - make weather clear.");
        twitch.action(twitch.opts.channels[0], "'slime' - summon attack slimes.");
        twitch.action(twitch.opts.channels[0], "'blind' - strike players blind.");
        twitch.action(twitch.opts.channels[0], "'nausea' - make players sick.");
    } else {
        minecraft.write('chat', { message: '[' + user.username + '] ' + message });
    }
});
twitch.on("join", function (channel, username, self) {
    minecraft.write('chat', { message: username + ' has joined twitch' });
});
twitch.on("part", function (channel, username, self) {
    minecraft.write('chat', { message: username + ' has left twitch' });
});

