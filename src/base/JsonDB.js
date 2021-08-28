const Error = require('../errors/Error')
const path = require('path')
const { unlinkSync, existsSync, readFileSync, mkdirSync, writeFileSync } = require("fs");
const lodash = require("lodash");
const DBData = require('../managers/DBData');
const Client = require('./Client')
const Constants = require('../util/Constants')

/**
 * Stores values in a json file.
 */
class JsonDB {

/**
 * JsonDB options.
 * @param {dbName} dbName - The file name for this database.
 */
constructor(dbName) {

    const bP = process.cwd();

    //Setting up dbFile.
    if (dbName.startsWith(bP)) dbName = dbName.replace(bP, "");
    if (dbName.startsWith(`.${path.sep}`)) dbName = dbName.slice(1);
    if (!dbName.startsWith(path.sep)) dbName = path.sep + dbName;
    if (!dbName.endsWith(".json")) dbName += ".json";

    bP = `${bP}${dbName}`;

    const dirNames = dbName.split(path.sep).slice(1);

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
     * This database's control client.
     * @type {Client}
     */
    this.client = new Client()
}

/**
 * Sets a data to this database.
 * @param {string} key - The key for this value.
 * @param {*} value - The value that will be set.
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
    if (!key || key === "") throw new Error('Database key was not provided');
    if (typeof key !== 'string') throw new Error(`Expected string for key, received ${typeof key}`);

    if (!value) throw new Error('Value was not provided');
    if (value === undefined || value === null) throw new Error(`Expected any for value, received undefined/null`);

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
    if (!key || key === "") throw new Error('Database key was not provided');
    if (typeof key !== 'string') throw new Error(`Expected string for key, received ${typeof key}`);

    const JsonData = this.toJSON();
    const data = lodash.get(JsonData, key);

    if (!data || data === undefined || data === null) throw new Error(`A value that was set with ${key} not found.`, 'ReferenceError')
    return data;
}

/**
 * Fetches a data that was set to this database before.
 * @param {string} key - The key for this value.
 * @returns {*} Value that was set with this key.
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
 * @returns {Promise<Array<DBData>>}
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
    return new Promise((resolve, reject) => { resolve(this.all(limit)) });
}

/**
 * Returnes a JSON file that includes every single key in this database.
 * @param {number} [limit='all'] - Limit for the database data that will be returned
 * @returns {Object<DBData>}
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
    if (!key || key === "") throw new Error('Database key was not provided');
    if (typeof key !== 'string') throw new Error(`Expected string for key, received ${typeof key}`);

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
    this.client.emit(Constants.Events.JSON_DB, `Deleting every single data from ${this.name}`, this)
    writeFileSync(this.path, "{}");
    this.size = 0;
}

/**
 * Returns the type of this data.
 * @param {string} key - The key for this value.
 * @returns {*}
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
 * @param {*} value - The value to push.
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
    if (!key || key === "") throw new Error('Database key was not provided');
    if (typeof key !== 'string') throw new Error(`Expected string for key, received ${typeof key}`);

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
 *
 * @param {string} key - The key for this value to pull from.
 * @param {*} value - The value to pull.
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
pull(key, value) {
    if (!key || key === "") throw new Error('Database key was not provided');
    if (typeof key !== 'string') throw new Error(`Expected string for key, received ${typeof key}`);

    if (!value) throw new Error('Value was not provided');
    if (value === undefined || value === null) throw new Error(`Expected any for value, received undefined/null`);

    const oldArray = this.get(key);
    if (!oldArray) throw new Error(`A data with this key was not found`);
    if (!Array.isArray(oldArray)) throw new Error(`Expected array for data, received ${typeof key}`);

    const index = oldArray.findIndex(value);
    let newArray = oldArray.splice(index, 1);

    this.set(key, newArray);
    return new DBData(this, key);
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
 * @param {MathOperator} operator - One of the math operator for the calculation.
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
    if (!key || key === "") throw new Error('Database key was not provided');
    if (typeof key !== 'string') throw new Error(`Expected string for key, received ${typeof key}`);

    if (!operator) throw new Error('Math operator was not provided');
    if (typeof operator !== 'string') throw new Error(`Expected string for operator, received ${typeof operator}`);

    if (!value) throw new Error('Value was not provided');
    if (typeof value !== 'string' && typeof value !== 'number') throw new Error(`Expected string or number for value, received ${typeof value}`);

    if (typeof value !== 'string') value = Number(value)

    const data = this.get(key);
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
 * db.math("pencil", 238)
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
 * db.substr("issues", 1)
 */
substr(key, value) {
    return this.math(key, "-", value);
}

/**
 * Searches for a key in this database includes this.
 * @param {string} keywords - The key (or keywords) to search.
 * @returns {Array<DBData>}
 * @example 
 * //Searches for: updev.db
 * db.includes("updev.db")
 */
includes(keywords) {
    return this.filter((element) => element.key.includes(keywords));
}

/**
 * Searches for a key in this database starts with this.
 * @param {string} keywords - The key (or keywords) to search.
 * @returns {Array<DBData>}
 * @example
 * //Searches for: updev.db
 * db.startsWith("up")
 */
startsWith(keywords) {
    return this.filter((element) => element.key.startsWith(keywords));
}

/**
 * Filters this database.
 * @param {*} filter
 * @returns {Array|DBData[]}
 * @example
 * //Filters with a function.
 * db.filter((element) => element.key.includes(key));
 */
filter(filter) {
    return this.all().filter(filter);
}

/**
 * Sorts this database.
 * @param {*} sort
 * @returns {DBData[]}
 * @example
 * //Sorts with a function.
 * db.sort((a, b) => b.value < a.value);
 */
sort(sort) {
    return this.all().sort(sort);
}

/**
 * Throw a atom bomb into this database and destroy it.
 * @returns {void}
 */
destroy() {
    this.client.emit(Constants.Events.JSON_DB, `Destroying ${this.name}`, this)
    unlinkSync(this.path);
}

/**
 *
 * @param {*} find
 * @returns {number}
 */
findAndDelete(find) {
    let count = 0;

    const all = this.all();

    for (const element of all) {
        if (find(element, this)) {
            this.delete(element.key);
            count++;
        }
    }

    return count;
}

/**
* This method exports **JsonDB** data to **Quick.db**
* @param {*} QuickDB Quick.db database (class)
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

    this.client.emit(Constants.Events.JSON_DB, `Exported data from ${this.name} to Quick.db`, this)
}

/**
 * Eval this database and do whatever you want. You can use `this` keyword.
 * @param {string} code - The code to eval
 * @returns {*}
 * @example
 * //Consoles every single data
 * db._eval("console.log(this.all())")
 */
_eval(code) {
    this.client.emit(Constants.Events.JSON_DB, `Evaling \`${code}\` in ${this.name}`, this)
    return eval(code);
}
}

module.exports = JsonDB
