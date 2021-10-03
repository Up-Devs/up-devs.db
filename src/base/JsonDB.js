const Error = require('../Error')
const path = require('path')
const { unlinkSync, existsSync, readFileSync, mkdirSync, writeFileSync } = require("fs");
const lodash = require("lodash");
const DBData = require('../manager/DBData');
const { MathOperator } = require('../util/Constants')

const EventEmitter = require('events');
const Events = require('../manager/Events');

/**
 * Stores values in a json file.
 */
class JsonDB extends EventEmitter {

/**
 * Json database options.
 * @typedef {Object} JsonDBOptions
 * @param {boolean} consoleEvents - Should the events that emitted should be logged in the console?
 */

/**
 * Creates a Json database.
 * @param {string} dbName - The file name for this database.
 * @param {JsonDBOptions} [options={}] - Json database options.
 * @example
 * const { JsonDB } = require('up-devs.db');
 * const db = new JsonDB('up-db');
 */
constructor(dbName, options) {
    super()

    let bP = process.cwd();

    let dataBaseName

    //Setting up dbFile.
    if (dbName.startsWith(bP)) dataBaseName = dbName.replace(bP, "");
    if (dbName.startsWith(`.${path.sep}`)) dataBaseName = dbName.slice(1);
    if (!dbName.startsWith(path.sep)) dataBaseName = path.sep + dbName;
    if (!dbName.endsWith(".json")) dataBaseName += ".json";

    bP = `${bP}${dataBaseName}`;

    const dirNames = dataBaseName.split(path.sep).slice(1);

    const length = dirNames.length;

    if (length > 1) {
        dirNames.pop();

        const firstResolvedDir = path.resolve(dirNames[0]);

        if (!existsSync(firstResolvedDir)) {
            mkdirSync(firstResolvedDir);
        }

        dirNames.splice(0, 1);

        let targetDirPath = firstResolvedDir;

        for (const dirName of dirNames) {
            const currentPath = `${targetDirPath}${path.sep}${dirName}`;

            if (!existsSync(currentPath)) {
                mkdirSync(currentPath);
            }

            targetDirPath = `${targetDirPath}${path.sep}${dirName}`;
        }
    }

    /**
     * This data-base's location path.
     * @type {string}
     * @private
     */
    this.path = bP;

    if (!existsSync(bP)) {
        writeFileSync(bP, "{}");
    }

    /**
     * This databases's name.
     * @type {string}
     */
    this.name = dbName.replace('.json')

    /**
     * This data-base's key size.
     * @type {number}
     */
    this.size = 0;

    /**
     * This database's options.
     * @type {JsonDBOptions}
     */
     this.options = options ? options : null
}

/**
 * Sets a data to this database.
 * @param {string} key - The key for this value.
 * @param {any} value - The value that will be set.
 * @returns {DBData}
 * @example 
 * //Setting a string
 * db.set("foo", "bar");
 * 
 * //Setting an object
 * db.set("info", {
 * name: "Josh",
 * age: 16
 * })
 */
set(key, value) {
    if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
    if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

    const JsonData = this.toJSON();
    lodash.set(JsonData, key, value);

    this.size++;

    return new DBData(this, key)
}

/**
 * Gets a data that was set to this database before.
 * @param {string} key - The key for this value.
 * @returns {DBData}
 * @example 
 * //Get the 'playedBefore' value
 * db.get("playedBefore")
 * 
 * //Get the 'playedBefore' value (with a user specified)
 * const user = 'Up Devs'
 * db.get(`playedBefore.${user}`)
 */
get(key) {
    if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");

    const JsonData = this.toJSON();
    const data = lodash.get(JsonData, key);

    if (!data || data === undefined || data === null) throw new Error(`A value that was set with ${key} not found.`, 'ReferenceError')
    return data;
}

/**
 * Fetches a data that was set to this database before.
 * @param {string} key - The key for this value.
 * @returns {any} Value that was set with this key.
 * @example 
 * //Fetch the 'weapon' value
 * db.fetch("weapon")
 * 
 * //Fetch the 'weapon' value (with a weapon specified)
 * const weapon = 'rifle'
 * db.fetch(`weapon.${weapon}`)
 */
fetch(key) {
    return this.get(key);
}

/**
 * Checks if a value with this key exists.
 * @param {string} key - The key for this value.
 * @returns {boolean}
 * @example 
 * //Checks if exists
 * db.exists("ourLives")
 */
exists(key) {
    return this.toJSON().hasOwnProperty(key);
}

/**
 * Checks if this database has this key.
 * @param {string} key - The key for this value.
 * @returns {boolean}
 * @example 
 * //Checks if this database has this key
 * db.has("goodVibes")
 */
has(key) {
    return this.exists(key);
}

/**
 * Returns all the database data in an array
 * @param {number} [limit='all'] - Limit for the database data that will be returned
 * @returns {DBData[]}
 * @example
 * //Returnes all database data
 * db.all()
 * 
 * //Returnes 8 of the database data
 * db.all(8)
 */
all(limit) {
    if (typeof limit !== 'number') throw new Error(`Expected string for limit, received ${typeof limit}`);

    const JsonData = JSON.parse(readFileSync(this.path, "utf-8"));

    const Array = [];

    for (const key in JsonData) {
        Array.push(DBData(this, key))
    }

    return limit && limit > 0 ? Array.splice(0, limit) : Array;
}

/**
 * Fetches all the database data in an array
 * @param {number} [limit='all'] - Limit for the database data that will be returned
 * @returns {Promise<DBData[]>}
 * @example
 * //Returnes all database data
 * db.fetchAll().then(data => {
 * 
 * //...
 * 
 * })
 * 
 * //Fetches 8 of the database data
 * db.fetchAll(8).then(data => {
 * 
 * //...
 * 
 * })
 */
fetchAll(limit) {
    return this.all(limit);
}

/**
 * Returnes a JSON file that includes every single key in this database.
 * @param {number} [limit='all'] - Limit for the database data that will be returned
 * @returns {Object}
 * @example
 * //Returnes all database data in a JSON file
 * db.toJSON()
 * 
 * //Returnes 8 of the database data in a JSON file
 * db.toJSON(8)
 */
toJSON(limit) {

    const json = {};
    
    if (limit && typeof limit === 'number') { 
        this.all(limit).forEach(element => {
        json[element.key] = element.value
        })
    } else {
        this.all().forEach(element => {
        json[element.key] = element.value
        })
    }
    return json;
}

/**
 * Deletes a data from this database.
 * @param {string} key - The key for this value.
 * @returns {JsonDB}
 * @example 
 * //Deletes gamerProfile data
 * db.delete("gamerProfile")
 * 
 * //Deletes gamerProfile data (with player specified)
 * const player = 'Ben'
 * db.delete(`gamerProfile.${player}`)
 */
delete(key) {
    if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");

    const JsonData = this.toJSON();

    this.size--;
    lodash.unset(JsonData, key);

    return this;
}

/**
 * Deletes every single data from this database.
 * @param {string} key - The key for this value.
 * @returns {void}
 * @example 
 * //Deletes every single data
 * db.deleteAll()
 */
deleteAll() {
    new Events(Constants.Events.DEBUG, `Deleting every single data from ${this.name}`, this)
    writeFileSync(this.path, "{}");
    this.size = 0;
}

/**
 * Returns the type of this data.
 * @param {string} key - The key for this value.
 * @returns {any}
 * @example
 * //Get the type of humans data
 * db.type('humans')
 */
type(key) {
    const data = this.get(key);

    if (Array.isArray(data)) return "array";
    return typeof data;
}

/**
 * Pushes a value to this data.
 * @param {string} key - The key for this value to push.
 * @param {any} value - The value to push.
 * @returns {DBData}
 * @example
 * //Pushes a string to the members data
 * db.push("members", "Arthur");
 * 
 * //Pushes a number to the members data
 * db.push("members", 102);
 * 
 * //Pushes an object to the members data
 * db.push("members", {
 * name: "Arthur"
 * memberCount: 102
 * });
 */
push(key, value) {
    if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
    if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

    const JsonData = this.toJSON();
    const data = lodash.get(JsonData, key);

    if (!data) { 
        this.set(key, [value]);
        return new DBData(this, key);
    }

    if (Array.isArray(data)) {
        data.push(value);
        this.set(key, data);
        return new DBData(this, key);
    } else {
        this.set(key, [value]);
        return new DBData(this, key);
    }
}

/**
 * Pulls an item from this array typed data.
 * @param {string} key - The key for this value to pull from.
 * @param {any} value - The value to pull.
 * @param {boolean} multiple - Pull multiple items?
 * @returns {DBData}
 * @example
 * //Pulls a string from the members data
 * db.pull("members", "Arthur");
 * 
 * //Pulls a number from the members data
 * db.pull("members", 102);
 * 
 * //Pulls an object from the members data
 * db.pull("members", {
 * name: "Arthur"
 * memberCount: 102
 * });
 */
pull(key, value, multiple = false) {
    if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
    if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

    let data = this.get(key);
    if (!data) throw new Error(`A data with this key was not found`);
    if (!Array.isArray(data)) throw new Error(`Expected array for data, received ${typeof data}`);

    let pullFunction = (element, Number, Array) => Boolean

    if (value) pullFunction = pullFunction.bind(value);
    const length = data.length;

    if (multiple) {
        const newArray = [];

        for (let i = 0; i < length; i++) {
            if (!pullFunction(data[i], i, data)) {
                newArray.push(data[i]);
            }
        }
        this.set(key, newArray);
    } else {
        const index = data.findIndex(pullFunction);
        data.splice(index, 1);
    }

    this.set(key, data);
    return data;
}

/**
 * Returnes all the values in an array
 * @returns {any[]}
 * @example
 * //Returnes all the values in an array
 * db.valueArray();
 */
valueArray() {
    const all = this.all();
    return all.map((element) => element.value);
}

/**
 * Returnes all the keys in an array
 * @returns {string[]}
 * @example
 * //Returnes all the keys in an array
 * db.keyArray();
 */
keyArray() {
    const all = this.all();
    return all.map((element) => element.key);
}

/**
 * Can't solves your math problems, but can calculate/add/remove numbers from this value.
 * @param {string} key - The key for this value.
 * @param {Constants.MathOperator} operator - One of the math operator for the calculation.
 * @param {number|string} value - The value for the math calculation.
 * @returns {any}
 * @example
 * //Adds 238 to the pencil value
 * db.math("pencil", "+", 238)
 * 
 * //Subtracts 1 from the issues value
 * db.substr("issues", "-", 1)
 */
math(key, operator, value) {
    if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");

    if (!operator) throw new Error('Math operator was not provided');
    if (typeof operator !== 'string') throw new Error(`Expected string for operator, received ${typeof operator}`);

    if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

    if (typeof value !== 'string') value = Number(value)

    let data = this.get(key);
    if (!data) {
        return this.set(key, value);
    }

    data = Number(data);

    switch (operator) {
        //  +  \\
        case "add":
        case "+":
            data += value;
            break;
        
        //  -  \\
        case "sub":
        case "substr":
        case "subtract":
        case "-":
            data -= value;
            break;

        //  *  \\
        case "multiply":
        case "mul":
        case "*":
            data *= value;
            break;

        //  /  \\
        case "divide":
        case "div":
        case "/":
            data /= value;
            break;

        //  %  \\
        case "mod":
        case "%":
            data %= value;
            break;

        default:
            throw new Error("Invalid math operator specified");
    }

    this.set(key, data);

    return DBData(this, key)
}

/**
 * Adds a value to this value.
 * @param {string} key - The key for this value.
 * @param {number|string} value - The value that will be added.
 * @returns {any}
 * @example
 * //Adds 238 to the pencil value
 * db.add("pencil", 238)
 */
add(key, value) {
    return this.math(key, "+", value);
}

/**
 * Subtracts value from this value.
 * @param {string} key - The key for this value.
 * @param {number|string} value - The value that will be subtracted.
 * @returns {any}
 * @example
 * //Subtracts 1 from the issues value
 * db.subtract("issues", 1)
 */
subtract(key, value) {
    return this.math(key, "-", value);
}

/**
 * Searches for a key in this database includes this.
 * @param {string} keywords - The key (or keywords) to search.
 * @returns {DBData[]}
 * @example 
 * //Searches for: updev.db
 * db.includes("updev.db")
 */
includes(keywords) {
    if (!keywords || keywords === "") throw new Error("Keywords was not provided")
    if (typeof keywords !== "string") throw new Error(`Expected string for keywords, received ${typeof keywords}`)

    return this.filter((element) => element.key.includes(keywords));
}

/**
 * Searches for a key in this database starts with this.
 * @param {string} keywords - The key (or keywords) to search.
 * @returns {DBData[]}
 * @example
 * //Searches for: updev.db
 * db.startsWith("up")
 */
startsWith(keywords) {
    if (!keywords || keywords === "") throw new Error("Keywords was not provided")
    if (typeof keywords !== "string") throw new Error(`Expected string for keywords, received ${typeof keywords}`)

    return this.filter((element) => element.key.startsWith(keywords));
}

/**
 * Filters this database.
 * @param {Function} filter - The filter function for this filter.
 * @returns {Array|DBData[]}
 * @example
 * //Filters with a function.
 * db.filter((element) => element.key.includes(key));
 */
filter(filter) {
    if (!filter || filter === "") throw new Error("Filter function was not provided")

    return this.all().filter(filter);
}

/**
 * Sorts this database.
 * @param {Function} sort - The sorting function for this sorting.
 * @returns {DBData[]}
 * @example
 * //Sorts with a function.
 * db.sort((a, b) => b.value < a.value);
 */
sort(sort) {
    if (!sort || sort === "") throw new Error("Sorting function was not provided")

    return this.all().sort(sort);
}

/**
 * Throw a atom bomb into this database and destroy it.
 * @returns {void}
 */
destroy() {
    new Events(Constants.Events.DEBUG, `Destroying ${this.name}`, this)
    unlinkSync(this.path);
}

/**
* This method exports **JsonDB** data to **Quick.db**
* @param {any} QuickDB Quick.db database (class)
* @returns {void}
* @example 
* //Exports to Quick.db
* db.exportToQuickDB(QuickDB)
*/
exportToQuickDB(QuickDB) {
    if (!QuickDB) throw new Error("Quick.db database (class) was not provided");

    const data = this.all();
    data.forEach(element => {
        QuickDB.set(element.key, element.value);
    });

    new Events(Constants.Events.JSON_DB, `Exported data from ${this.name} to Quick.db`, this)
}

/**
 * Eval this database and do whatever you want. You can use `this` keyword.
 * @param {string} code - The code to eval
 * @returns {any}
 * @example
 * //Consoles every single data
 * db._eval("console.log(this.all())")
 */
_eval(code) {
    if (!code || code === "") throw new Error("Code was not provided")
    if (typeof code !== "string") throw new Error(`Expected string for code, received ${typeof code}`)

    new Events(Constants.Events.DEBUG, `Evaling \`${code}\` in ${this.name}`, this)

    return eval(code);
}
}

module.exports = JsonDB
