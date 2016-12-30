
class MindyEvent {
    constructor(data) {
        this.where = null;
        this.username = null;
        this.message = null;
        this.words = null;
        this.bot = null;
        if (typeof(data) !== 'undefined') {
            if (data.where != 'minecraft' && data.where != 'twitch') {
                throw 'Invalid where value';
            }
            this.where = data.where;
            this.username = data.username;
            this.message = data.message;
            this.words = data.words;
            this.bot = (typeof(data['bot']) !== 'undefined') ? data.bot : null;
        }
    }
    Chat(message) {
        if (this.bot === null)
            throw 'Bot must contain value before chat message can be delivered.';
        if (this.where != 'minecraft' && this.where != 'twitch')
            throw 'Invalid where value';
        if (this.where == 'minecraft') {
            this.bot.mChat(message);
        }
        else if (this.where == 'twitch') {
            this.bot.tChat(message);
        }
    }
}

module.exports = MindyEvent;
