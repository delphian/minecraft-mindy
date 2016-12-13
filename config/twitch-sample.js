// Copy to twitch.js and customize.

var tmi = require('tmi.js');

var twitch = new tmi.client({
  options: {
    debug: true
  },
  connection: {
    cluster: "aws",
    reconnect: true
  },
  identity: {
    // Twitch username.
    username: "",
    // Twitch OAuth: https://twitchapps.com/tmi/
    password: ""
  },
  // Channel bot should join (your twitch name)
  channels: ["MindyTheMinion"]
});
twitch.connect();

module.exports = twitch;

