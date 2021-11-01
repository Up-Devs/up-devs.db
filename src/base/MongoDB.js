const Base = require("./MongoBase");
const Schema = require("../manager/Schema");
const Error = require("../Error");
const fs = require("fs");
const Util = require("../util/Util");
const DBData = require('../manager/DBData');

const { DatabaseLatency, MathOperator } = require('../util/Constants');
const Constants = require('../util/Constants');

const MongooseDocument = require('mongoose').Document;
const Events = require('../manager/Events');

/**
 * Stores values in a Mongo database.
 */
class MongoDB extends Base {
    /**
     * Mongo database options.
     * @typedef {Object} MongoDBOptions
     * @param {boolean} consoleEvents - Should the events that emitted should be logged in the console?
     */

    /**
     * Creates a Mongo database.
     * @param {string} [mongoURL=none] - The Mongo url for this database.
     * @param {string} [name=none] - The Mongo model name for this database.
     * @param {MongoDBOptions} [options={}] - Mongo database options.
     * @example
     * const { MongoDB } = require('up-devs.db');
     * const db = new MongoDB('mongodb://localhost/up-devs.db', 'up-devs')
     */
    constructor(mongoURL, name, options) {
        super(mongoURL || null);

        /**
         * The model for this database.
         * @type {MongooseDocument}
         */
        this.schema = Schema(this.connection, name);

        /**
         * This database's name.
         * @type {string}
         * @readonly
         */
        this.name = this.schema.modelName;

        /**
         * This database's options.
         * @type {MongoDBOptions}
         */
        this.options = options ? options : null;

       /**
        * This database's uptime duration in miliseconds.
        * @type {number}
        */
        this.uptime = this.readyAt ? Date.now() - this.readyAt.getTime() : 0;
    }

    /**
     * Sets a data to this database.
     * @param {string} key - The key for this value.
     * @param {any} value - The value that will be set.
     * @returns {Promise<any>}
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
    async set(key, value) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");
        const parsed = Util.parseKey(key);
        const raw = await this.schema.findOne({
            ID: parsed.key
        });
        if (!raw) {
            const data = new this.schema({
                ID: parsed.key,
                data: parsed.target ? Util.setData(key, {}, value) : value
            });
            await data.save()
                .catch(e => new Events(Constants.Events.ERROR, e, this));
            return data.data;
        } else {
            raw.data = parsed.target ? Util.setData(key, Object.assign({}, raw.data), value) : value;
            await raw.save()
                .catch(e => new Events(Constants.Events.ERROR, e, this));
            return raw.data;
        }
    }

    /**
    * Deletes a data from this database.
    * @param {string} key - The key for this value.
    * @returns {Promise<boolean>}
    * @example
    * //Deletes gamerProfile data
    * db.delete("gamerProfile")
    *
    * //Deletes gamerProfile data (with player specified)
    * const player = 'Ben'
    * db.delete(`gamerProfile.${player}`)
    */
    async delete(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        const parsed = Util.parseKey(key);
        const raw = await this.schema.findOne({ ID: parsed.key });
        if (!raw) return false;
        if (parsed.target) {
            const data = Util.unsetData(key, Object.assign({}, raw.data));
            if (data === raw.data) return false;
            raw.data = data;
            raw.save().catch(e => new Events(Constants.Events.ERROR, e, this));
            return true;
        } else {
            await this.schema.findOneAndDelete({ ID: parsed.key })
                .catch(e => new Events(Constants.Events.ERROR, e, this));
            return true;
        }
    }

    /**
    * Checks if a value with this key exists.
    * @param {string} key - The key for this value.
    * @returns {Promise<boolean>}
    * @example
    * //Checks if exists
    * db.exists("ourLives")
    */
    async exists(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        const parsed = Util.parseKey(key);

        const get = await this.schema.findOne({ ID: parsed.key })
            .catch(e => new Events(Constants.Events.ERROR, e, this));
        if (!get) return null;
        let item;
        if (parsed.target) item = Util.getData(key, Object.assign({}, get.data));
        else item = get.data;
        return item !== undefined;
    }

    /**
    * Checks if this database has this key.
    * @param {string} key - The key for this value.
    * @returns {Promise<boolean>}
    * @example
    * //Checks if this database has this key
    * db.has("goodVibes")
    */
    async has(key) {
        return await this.exists(key);
    }

    /**
    * Gets a data that was set to this database before.
    * @param {string} key - The key for this value.
    * @returns {Promise<any>}
    * @example
    * //Get the 'playedBefore' value
    * db.get("playedBefore")
    *
    * //Get the 'playedBefore' value (with a user specified)
    * const user = 'Up Devs'
    * db.get(`playedBefore.${user}`)
    */
    async get(key) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        const parsed = Util.parseKey(key);

        const get = await this.schema.findOne({ ID: parsed.key })
            .catch(e => new Events(Constants.Events.ERROR, e, this));
        if (!get) return null;
        let item;
        if (parsed.target) item = Util.getData(key, Object.assign({}, get.data));
        else item = get.data;
        return item !== undefined ? item : null;
    }

    /**
    * Fetches a data that was set to this database before.
    * @param {string} key - The key for this value.
    * @returns {Promise<any>} Value that was set with this key.
    * @example
    * //Fetch the 'weapon' value
    * db.fetch("weapon")
    *
    * //Fetch the 'weapon' value (with a weapon specified)
    * const weapon = 'rifle'
    * db.fetch(`weapon.${weapon}`)
    */
    async fetch(key) {
        return this.get(key);
    }

    /**
     * Returns all the database data in an array
     * @param {number} [limit='all'] - Limit for the database data that will be returned.
     * @returns {Promise<DBData[]>}
     * @example
     * //Returnes all database data
     * db.all()
     *
     * //Returnes 8 of the database data
     * db.all(8)
     */
    async all(limit = 0) {
        if (typeof limit !== "number" || limit < 1) limit = 0;
        let data = await this.schema.find().catch(e => { throw new Error(e.name); });
        if (limit) data = data.slice(0, limit);

        return data.map(m => new DBData(m.ID, m.data));
    }

    /**
     * Fetches all the database data in an array
     * @param {number} [limit='all'] - Limit for the database data that will be returned.
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
    async fetchAll(limit) {
        return await this.all(limit);
    }

    /**
     * Deletes every single data from this database.
     * @param {string} key - The key for this value.
     * @returns {Promise<boolean>}
     * @example
     * //Deletes every single data
     * db.deleteAll()
     */
    async deleteAll() {
        new Events(Constants.Events.DEBUG, "Deleting every single data from this database.", this);
        await this.schema.deleteMany().catch(e => {});
        new Events(Constants.Events.DEBUG, "Deleting every single data is completed!", this);
        return true;
    }


    /**
     * Can't solves your math problems, but can calculate/add/remove numbers from this value.
     * @param {string} key - The key for this value.
     * @param {MathOperator} operator - One of the math operator for the calculation.
     * @param {number|string} value - The value for the math calculation.
     * @returns {Promise<any>}
     * @example
     * //Adds 238 to the pencil value
     * db.math("pencil", "+", 238)
     *
     * //Subtracts 1 from the issues value
     * db.substr("issues", "-", 1)
     */
    async math(key, operator, value) {
        if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
        if (!operator) throw new Error("No operator provided!");
        if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

        const data = await this.get(key);

        switch (operator) {
            case "add":
            case "+":
                if (!data) {
                    return await this.set(key, value);
                } else {
                    if (typeof data !== "number") throw new Error(`Expected existing data to be a number, received ${typeof data}!`);
                    return await this.set(key, data + value);
                }

            case "subtract":
            case "sub":
            case "-":
                if (!data) {
                    return await this.set(key, 0 - value);
                } else {
                    if (typeof data !== "number") throw new Error(`Expected existing data to be a number, received ${typeof data}!`);
                    return await this.set(key, data - value);
                }

            case "multiply":
            case "mul":
            case "*":
                if (!data) {
                    return await this.set(key, 0 * value);
                } else {
                    if (typeof data !== "number") throw new Error(`Expected existing data to be a number, received ${typeof data}!`);
                    return await this.set(key, data * value);
                }

            case "divide":
            case "div":
            case "/":
                if (!data) {
                    return await this.set(key, 0 / value);
                } else {
                    if (typeof data !== "number") throw new Error(`Expected existing data to be a number, received ${typeof data}!`);
                    return await this.set(key, data / value);
                }

            case "mod":
            case "%":
                if (!data) {
                    return await this.set(key, 0 % value);
                } else {
                    if (typeof data !== "number") throw new Error(`Expected existing data to be a number, received ${typeof data}!`);
                    return this.set(key, data % value);
                }

            default:
                throw new Error("Unknown operator");
        }
    }

    /**
     * Adds a value to this value.
     * @param {string} key - The key for this value.
     * @param {number|string} value - The value that will be added.
     * @returns {Promise<any>}
     * @example
     * //Adds 238 to the pencil value
     * db.add("pencil", 238)
     */
    async add(key, value) {
        return await this.math(key, "+", value);
    }

    /**
     * Subtracts value from this value.
     * @param {string} key - The key for this value.
     * @param {number|string} value - The value that will be subtracted.
     * @returns {Promise<any>}
     * @example
     * //Subtracts 1 from the issues value
     * db.substr("issues", 1)
    */
    async subtract(key, value) {
        return await this.math(key, "-", value);
    }

    /**
     * Exports the data to json file
     * @param {string} fileName File name.
     * @param {string} path File path
     * @returns {Promise<string>}
     * @example db.export("database.json", "./").then(path => {
     *     console.log(`File exported to ${path}`);
     * });
     */
    export(fileName = "database", path = "./") {
        return new Promise((resolve, reject) => {
            new Events(Constants.Events.DEBUG, `Exporting database datas to ${path || ""}${fileName}`, this);
            this.all().then(data => {
                const strData = JSON.stringify(data);
                if (fileName) {
                    fs.writeFileSync(`${path || ""}${fileName}`, strData);
                    new Events(Constants.Events.DEBUG, `Export to ${path || ""}${fileName} is completed!`, this);
                    return resolve(`${path || ""}${fileName}`);
                }
                return resolve(strData);
            }).catch(reject);
        });
    }

    /**
     * Imports datas from other sources to this database.
     *
     * <warn>You should set `useUnique` to `true` in order to avoid duplicate documents.</warn>
     * @param {Array} data - The data array to be imported.
     * @param {object} options - MongoDB importing options.
     * @param {boolean} [options.validate=false] - Choice for importing the valid documents only.
     * @param {boolean} [options.unique=false] - Choice for importing unique datas.
     * @returns {Promise<boolean>}
     * @example
     * //Imports from Quick.db to MongoDB
     * const data = QuickDB.all();
     * db.import(data);
     */
    import(data = [], options = { unique: false, validate: false }) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(data)) return reject(new Error(`Data type must be Array, received ${typeof data}!`, "DataTypeError"));
            if (data.length < 1) return resolve(false);
            if (!options.unique) {
                this.schema.insertMany(data, { ordered: !options.validate }, error => {
                    if (error) return reject(new Error(`${error}`, "DataImportError"));
                    return resolve(true);
                });
            } else {
                data.forEach((x, i) => {
                    if (!options.validate && (!x.ID || !x.data)) return;
                    else if (!!options.validate && (!x.ID || !x.data)) return reject(new Error(`Data is missing ${!x.ID ? "ID" : "data"} path!`, "DataImportError"));
                    setTimeout(() => {
                        this.set(x.ID, x.data);
                    }, 150 * (i + 1));
                });
                return resolve(true);
            }
        });
    }

    /**
     * Disconnects this database.
     * @returns {void}
     * @example
     * //Disconnecting...
     * db.disconnect();
     */
    disconnect() {
        new Events(Constants, "Database disconnecting...", this);
        return this._destroyDatabase();
    }

    /**
     * Creates a database connection for this database.
     * @param {string} url - The Mongo url for this database.
     * @returns {void}
     */
    connect(url) {
        return this._create(url);
    }

    /**
     * This database's read latency.
     * @ignore
     * @private
     * @returns {Promise<number>}
     */
    async _read() {
        const start = Date.now();
        await this.get("LQ==");
        return Date.now() - start;
    }

    /**
     * This database's write latency.
     * @ignore
     * @private
     * @returns {Promise<number>}
     */
    async _write() {
        const start = Date.now();
        await this.set("LQ==", Buffer.from(start.toString()).toString("base64"));
        return Date.now() - start;
    }

    /**
     * Fetches read and write latency of this database in miliseconds.
     * @returns {Promise<Constants.DatabaseLatency>}
     * @example
     * const ping = await db.fetchLatency();
     * console.log("Read: ", ping.read);
     * console.log("Write: ", ping.write);
     * console.log("Average: ", ping.average);
     */
    async fetchLatency() {
        const read = await this._read();
        const write = await this._write();
        const average = (read + write) / 2;
        this.delete("LQ==").catch(e => {});
        return { read, write, average };
    }

    /**
     * Fetches read and write latency of this database in miliseconds.
     * @returns {Promise<Constants.DatabaseLatency>}
     * @example
     * const ping = await db.fetchLatency();
     * console.log("Read: ", ping.read);
     * console.log("Write: ", ping.write);
     * console.log("Average: ", ping.average);
     */
    async ping() {
        return await this.fetchLatency();
    }

    /**
     * Searches for a key in this database starts with this.
     * @param {string} keywords - The key (or keywords) to search.
     * @param {Object} options - Filtering options.
     * @returns {Promise<Constants.MongoData[]>}
     * @example
     * //Searches for: updev.db
     * db.startsWith("up")
     */
    async startsWith(key, options) {
        if (!key || typeof key !== "string") throw new Error(`Expected key to be a string, received ${typeof key}`);
        const all = await this.all(options && options.limit);
        return Util.sort(key, all, options);
    }


    /**
     * Returns the type of this data.
     * @param {string} key - The key for this value.
     * @returns {Promise<string|number|bigint|boolean|symbol|void|Object|Function|Array>}
     * @example
     * //Get the type of humans data
     * db.type('humans')
     */
    async type(key) {
        if (!Util.isKey(key)) throw new Error("Invalid Key!", "KeyError");
        const fetched = await this.get(key);
        if (Array.isArray(fetched)) return "array";
        return typeof fetched;
    }

    /**
     * Returnes all the keys in an array
     * @returns {Promise<string[]>}
     * @example
     * //Returnes all the keys in an array
     * db.keyArray();
     */
    async keyArray() {
        const data = await this.all();
        return data.map(m => m.ID);
    }

    /**
     * Returnes all the values in an array
     * @returns {Promise<any[]>}
     * @example
     * //Returnes all the values in an array
     * db.valueArray();
     */
    async valueArray() {
        const data = await this.all();
        return data.map(m => m.data);
    }

    /**
     * Pushes a value to this data.
     * @param {string} key - The key for this value to push.
     * @param {any} value - The value to push.
     * @returns {Promise<any>}
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
    async push(key, value) {
        const data = await this.get(key);
        if (data == null) {
            if (!Array.isArray(value)) return await this.set(key, [value]);
            return await this.set(key, value);
        }
        if (!Array.isArray(data)) throw new Error(`Expected target type to be Array, received ${typeof data}!`);
        if (Array.isArray(value)) return await this.set(key, data.concat(value));
        data.push(value);
        return await this.set(key, data);
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
    async pull(key, value, multiple = false) {
        const data = await this.get(key);
        if (data === null) return false;
        if (!Array.isArray(data)) throw new Error(`Expected target type to be Array, received ${typeof data}!`);

        let pullFunction = (element, index, array) => Boolean;

        if (value) pullFunction = pullFunction.bind(value);
        const length = data.length;

        if (multiple) {
            const newArray = [];

            for (let i = 0; i < length; i++) {
                if (!pullFunction(data[i], i, data)) {
                    newArray.push(data[i]);
                }
            }
            await this.set(key, newArray);
        } else {
            const index = data.findIndex(pullFunction);
            data.splice(index, 1);
        }

        await this.set(key, data);
        return new DBData(key, data);
    }

    /**
     * Returns the entry count of this database.
     * @returns {Promise<number>}
     * @example
     * //Returns the enrty count
     * const entries = await db.entries();
     * console.log(`Entries: ${entries}`);
     */
    async entries() {
        return await this.schema.estimatedDocumentCount();
    }

    /**
     * Returns random entry from the database
     * @param {number} n Number entries to return
     * @returns {Promise<any[]>}
     * @example const random = await db.random();
     * console.log(random);
     */
    async random(n = 1) {
        if (typeof n !== "number" || n < 1) n = 1;
        const data = await this.all();
        if (n > data.length) throw new Error("Random value length may not exceed total length.", "RangeError");
        const shuffled = data.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    /**
     * Creates a new model (which is the same as this database).
     * @param {string} name - The new model name.
     * @returns {MongoDB}
     */
    createModel(name) {
        if (!name || typeof name !== "string") throw new Error("Invalid model name");
        const newModel = new MongoDB(this.dbURL, name, this.options);
        return newModel;
    }

    /**
     * This method exports **MongoDB** data to **Quick.db**
     * @param {any} QuickDB Quick.db database (class)
     * @returns {Promise<any[]>}
     * @example
     * //Exports to Quick.db
     * db.exportToQuickDB(QuickDB)
     */
    async exportToQuickDB(quickdb) {
        if (!quickdb) throw new Error("Quick.db class was not provided!");
        const data = await this.all();
        data.forEach(item => {
            quickdb.set(item.ID, item.data);
        });
        return quickdb.all();
    }

    /**
     * Updates this current model (database) and uses a new one.
     * @param {string} name - The new model name to use.
     * @returns {MongooseDocument}
     */
    updateModel(name) {
        this.schema = Schema(name);
        return this.schema;
    }

    /**
     * String representation of the database.
     * @returns {string}
     * @example
     * //Expected: 'Up-Devs.DB< ... >'
     * console.log(db.toString());
     */
    toString() {
        return `Up-Devs.DB<{${this.schema.modelName}}>`;
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
        return eval(code);
    }
}

module.exports = MongoDB;
