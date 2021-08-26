const JsonDB = require("../base/JsonDB");

/**
* Represents a database data.
*/
class DBData {

    /**
     * Represents a database data.
     * @param {JsonDB} database - The database that includes this data.
     * @param {string} key - This data's key that was set with.
     */
    constructor(database, key) {
     
    /**
     * This data's key that was set with.
     * @type {string}
     */
     this.key = key

    /**
     * This data's value.
     * @type {*}
     */
     this.value = database.get(key)
    }
}

module.exports = DBData