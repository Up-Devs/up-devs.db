const Colorful = require('../structures/Colorful');
const Error = require('../Error');

const JsonDB = require("../base/JsonDB");
const MongoDB = require("../base/MongoDB");

/**
 * Emits an event for Up-Devs.DB
 */
class Events {
 
    /**
     * Emits an event with this constructor.
     * @param {string} eventType - The event type for this event.
     * @param {string} message - The message that was emitted.
     * @param {JsonDB|MongoDB} database - The database that this was emitted.
     * @returns {void}
     */
    constructor(eventType, message, database) {

        if (!eventType || eventType === "") throw new Error("An event type was not provided.");
        if (typeof eventType !== "string") throw new Error(`Expected event type to be a string, received ${typeof eventType}`);
    
        if (!message || message === "") throw new Error("A message was not provided.");
        if (typeof message !== "string") throw new Error(`Expected message to be a string, received ${typeof message}`);
    
        if (!database) throw new Error("A database was not provided.");
        if (!database instanceof JsonDB && !database instanceof MongoDB) throw new Error(`Expected database to be a JsonDB or MongoDB, received ${typeof database}`);

        database.emit(eventType, message, database);
        
        if (database.options && database.options.consoleEvents && database.options.consoleEvents === true) {
        if (eventType === "error") {
         new Colorful(`&ylw[Up-Devs.DB]&end &redError: ${message}&end, at &grn${database.name}&end`)
        } else if (eventType === "debug") {
         new Colorful(`&ylw[Up-Devs.DB]&end &mgnDebug: ${message}&end, at &grn${database.name}&end`)
        } else {
         new Colorful(`&ylw[Up-Devs.DB]&end ${message}, at &grn${database.name}&end`)
        }
      }
    }

}

module.exports = Events