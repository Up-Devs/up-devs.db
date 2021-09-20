const lodash = require("lodash");
const Error = require("../Error");

const { MongoKey } = require('./Constants');

/**
* Up-Devs.DB's utilities. **Every method of this class is a `static` method.**
*/
class Util {

    /**
     * Checks if this key is valid.
     * @param {any} key - The key to check.
     * @returns {boolean}
     */
    static isKey(key) {
        if (!key || key === "") throw new Error("A key was not provided.", "KeyError");
        return typeof key === "string";
    }

    /**
     * Checks if this data is valid.
     * @param {any} data - The data to check.
     * @returns {boolean}
     */
    static isValue(data) {
        if (typeof data === "undefined") throw new Error("Data cannot be undefined", "ValueError");
        if (data === Infinity || data === -Infinity) throw new Error("Data cannot be Infinity", "ValueError")
        return true;
    }

    /**
     * Returns the target and the key from this key.
     * @param {string} key - The key to parse.
     * @returns {MongoKey}
     * @example
     * //Parsing this key.
     * Util.parseKey("hello.world");
     */
    static parseKey(key) {
        if (!Util.isKey(key)) return { key: undefined, target: undefined };
        if (key.includes(".")) {
            let spl = key.split(".");
            let parsed = spl.shift();
            let target = spl.join(".");
            return { key: parsed, target };
        }
        return { key, target: undefined };
    }

    /**
     * Sorts this data.
     * @param {string} key - The key for sorting.
     * @param {Array} data - The datas for sorting.
     * @param {Object} options - Sorting options.
     * @example
     * //Sorting datas.
     * Util.sort("youtube_", { ... }, { sort: ".data" });
     * @returns {any[]}
     */
    static sort(key, data, options) {
        if (!key || !data || !Array.isArray(data)) return [];
        let arb = data.filter(i => i.ID.startsWith(key));
        if (options && options.sort && typeof options.sort === 'string') {
            if (options.sort.startsWith('.')) options.sort = options.sort.slice(1);
            options.sort = options.sort.split('.');
            arb = lodash.sortBy(arb, options.sort).reverse();
        }
        return arb;
    }

    /**
     * Sets a data to Lodash.
     * @param {string} key - The key for this value.
     * @param {any} data - The data that will be set.
     * @param {any} value - The value that will be set.
     * @returns {any}
     * @example
     * //Sets a data to Lodash
     * Util.setData("hello.world", { ... }, ["nodejs"]);
     */
    static setData(key, data, value) {
        let parsed = this.parseKey(key);
        if (typeof data === "object" && parsed.target) {
            return lodash.set(data, parsed.target, value);
        } else if (parsed.target) throw new Error("Cannot target non-object.", "TargetError");
        return data;
    }

    /**
     * Unsets this data.
     * @param {string} key - The key for this value.
     * @param {any} data - The data to unset
     * @returns {any}
     * @example
     * //Unsets this data
     * Util.unsetData("user.items", {...});
     */
    static unsetData(key, data) {
        let parsed = this.parseKey(key);
        let item = data;
        if (typeof data === "object" && parsed.target) {
        lodash.unset(item, parsed.target);
        } else if (parsed.target) {
        throw new Error("Cannot target non-object.", "TargetError");
        }
        return item;
    }

    /**
     * Returns the data saved with this key.
     * @param {string} key - The key for this value.
     * @returns {any}
     * @example
     * //Returns this data
     * Util.getData("countries", { ... });
     */
    static getData(key) {
        let parsed = this.parseKey(key);
        let data

        if (parsed.target) data = lodash.get(data, parsed.target);
        return data;
    }
}

module.exports = Util;
