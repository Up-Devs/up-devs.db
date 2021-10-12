/**
* Represents a database data.
*/
class DBData {

    /**
     * Represents a database data.
     * @param {string} key - This data's key that was set with.
     * @param {any} data - This data that was set with this key.
     */
    constructor(key, data) {
     
    /**
     * This data's ID that was set with.
     * @type {string}
     */
     this.ID = key;

    /**
     * This data's data.
     * @type {any}
     */
     this.data = data;

    }
}

module.exports = DBData;
