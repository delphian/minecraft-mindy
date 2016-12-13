# Minecraft Mindy

Minecraft bot providing integration with twitch. Allows twitch viewers to alter the environment and perform limited commands in minecraft.

### Requirements

* Node.js
* A dedicated minecraft and twitch account for the bot to use.
* A minecraft server with access to configure ops.json

### Installation

`
git clone https://github.com/delphian/minecraft-mindy.git
cd minecraft-mindy
npm install
cd config
cp twitch-sample.js twitch.js
cp minecraft-sample.js minecraft.js
`

### Configuration

* Edit ops.json in the Minecraft server and add the minecraft bot account with level 2.
* Customize Mindy's config/twitch.js and config/minecraft.js files.
* Execute `node mindy.js` or `./run.sh` if you have screen installed.

