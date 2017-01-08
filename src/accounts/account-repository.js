var Account = require('./account');

/**
 * Abstract CRUD operations for user accounts against the database.
 */
class AccountRepository {
    /**
     * @param object db 
     *  An opened flat-file-db database.
     */
    constructor(db) {
        this.db = db;
    }
    /**
     * Determine if a user has an account record.
     *
     * @param string username
     *  The username to check.
     *
     * @returns bool
     */
    exists(username) {
        return (this.db.has(username)) ? true : false;
    }
    /**
     * Load a user account record.
     *
     * @param string username
     *  The key to load user account of.
     *
     * @returns Account on success, null on record not found.
     */
    read(username) {
        var account = null;
        if (this.exists(username)) {
            account = new Account(JSON.parse(this.db.get(username)));
	    account.username = username;
        }
        return account;
    }
    /**
     * Update or Create a user account record.
     *
     * @param string username
     *  The key to save object against.
     * @param Account account
     *  Account object to save.
     */
    update(username, account) {
        account.username = username;
        this.db.put(username, JSON.stringify(account));
    }
}

module.exports = AccountRepository;
