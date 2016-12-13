// Copy to minecraft.js and customize.

var mc = require('minecraft-protocol');

var minecraft = mc.createClient({
  host: "yourserver.com",
  port: 25565,
  // Email and password registered at mojang.
  username: "",
  password: "",
  version: "1.11",
  // 60 second timeout.
  checkTimeoutInterval: 60 * 1000
});

module.exports = minecraft;

