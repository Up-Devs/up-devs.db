const { EventEmitter } = require("events");
const mongoose = require("mongoose");
const Error = require("../Error");

const MongooseConnection = require('mongoose').Connection;

const Events = require('../manager/Events');
const Constants = require('../util/Constants');

class MongoBase extends EventEmitter {

    /**
     * Creates a Mongo database.
     * 
     * Used by {@link MongoDB} class. **Don't use it yourself!**
     * @param {string} mongoURL The Mongo url for this base.
     * @param {Object} connectionOptions The mongoose options for this base.
     * @example
     * const { MongoBase } = require('up-devs.db');
     * const db = new MongoBase('mongodb://localhost/up-devs.db', 'up-devs')
     */
    constructor(mongoURL, connectionOptions={}) {
        super();
        if (!mongoURL || !mongoURL.startsWith("mongodb")) throw new Error("No mongodb url was provided!");
        if (typeof mongoURL !== "string") throw new Error(`Expected a string for mongoURL, received ${typeof mongoURL}`);
        if (connectionOptions && typeof connectionOptions !== "object") throw new Error(`Expected Object for connectionOptions, received ${typeof connectionOptions}`);

        Object.defineProperty(this, "dbURL", {
            value: mongoURL
        });

        /**
         * Mongoose connection options
         * @type {ConnectionOptions}
         */
        this.options = connectionOptions;

        /**
         * Returns mongodb connection
         * @type {MongooseConnection}
         */
        this.connection = this._create();

        this.connection.on("error", (e) => {
            new Events("error", e, this);
        });
        this.connection.on("open", () => {
            /**
             * Timestamp when database became ready
             * @type {Date}
             */
            this.readyAt = new Date();
            new Events("ready", "The database is ready to work!", this);
        });
    }

    /**
     * Creates a MongoDB connection for this base.
     * @returns {MongooseConnection}
     * @ignore
     */
    _create(url) {
        new Events("debug", "Creating database connection...", this);

        if (url && typeof url === "string") this.dbURL = url;
        if (!this.dbURL || typeof this.dbURL !== "string") throw new Error("Database url was not provided!", "MongoError");

        delete this.options["useUnique"];

        return mongoose.createConnection(this.dbURL, {
            ...this.options,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
    }

    /**
     * Destroys this database.
     * @ignore
     * @returns {void}
     */
    _destroyDatabase() {
        this.connection.close(true);
        this.readyAt = undefined;
        this.dbURL = null;
        new Events("debug", "Database disconnected.", this);
    }
    
    /**
     * Returns this database's Mongo url.
     * @type {string}
     */
    get url() {
        return this.dbURL;
    }

    /**
     * Returns this database's connection state.
     * @type {MongoConnectionState}
     */
    get state() {
        if (!this.connection || typeof this.connection.readyState !== "number") return "DISCONNECTED";
        switch(this.connection.readyState) {
            case 0:
                return "DISCONNECTED";
            case 1:
                return "CONNECTED";
            case 2:
                return "CONNECTING";
            case 3:
                return "DISCONNECTING";
        }
    }
}

module.exports = MongoBase;
