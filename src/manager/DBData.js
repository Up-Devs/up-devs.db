const JsonDB = require("../base/JsonDB");
const MongoDB = require("../base/MongoDB");

/**
* Represents a database data.
*/
class DBData {

    /**
     * Represents a database data.
     * @param {JsonDB|MongoDB} database - The database that includes this data.
     * @param {string} key - This data's key that was set with.
     */
    constructor(database, key) {
     
    /**
     * This data's ID that was set with.
     * @type {string}
     */
     this.ID = key

    /**
     * This data's data.
     * @type {any}
     */
     this.data = database.get(key)
    }
}

module.exports = DBData