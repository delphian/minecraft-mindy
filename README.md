# Minecraft Mindy

Mindy is a Minecraft client bot providing integration with twitch. Mindy 
allows twitch viewers to alter the environment and perform limited commands 
in minecraft (such as making it rain, or casting lighting bolts).

### Requirements

* Node.js (>7.1.0) and npm (3.10.9). https://nodejs.org/en/download/
* A dedicated minecraft and twitch account for the bot to use.
* A minecraft server with access to configure ops.json

### Installation

```
git clone https://github.com/delphian/minecraft-mindy.git
cd minecraft-mindy
npm install
cp ./config/twitch-sample.js ./config/twitch.js
cp ./config/minecraft-sample.js ./config/minecraft.js
```

### Configuration

* Edit ops.json in the Minecraft server and add the minecraft bot account with level 2.
* Customize Mindy's config/twitch.js and config/minecraft.js files.
* Execute `node mindy.js` or `./run.sh` if you have screen installed.

### License

[MIT License](../master/LICENSE.md)
