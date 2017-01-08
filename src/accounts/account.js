
class Account {
    constructor(data) {
        this.username = null;
        this.joins = null;
        this.points = null;
        this.lastSeen = null;
        if (typeof(data) !== 'undefined') {
            this.username = (typeof(data['username'] != 'undefined')) ? data.username: null;
            this.joins = (typeof(data['joins'] != 'undefined')) ? data.joins : null;
            this.points = (typeof(data['points'] != 'undefined')) ? data.points : null;
            this.lastSeen = (typeof(data['lastSeen'] != 'undefined')) ? data.lastSeen : null;
        }
    }
}

module.exports = Account;
