const MongoDB = require('../base/MongoDB');
const JsonDB = require('../base/JsonDB');

/**
 * The math operators that you can use.
 * * `+`: addition
 * * `-`: subtraction
 * * `*`: multiplication
 * * `/`: divide
 * * `%`: percent
 * @typedef {string} MathOperator
 */

/**
 * MongoDB connection states.
 * * `DISCONNECTED`
 * * `CONNECTED`
 * * `CONNECTING`
 * * `DISCONNECTING`
 * @typedef {string} MongoConnectionState
 */

/**
* @typedef {Object} DatabaseLatency
* @property {number} read - This database's read latency.
* @property {number} write - This database's write latency.
* @property {number} average - This database's average latency.
*/

/**
* @typedef {Object} MongoImportOptions
* @param {boolean} [validate] - Choice for importing the valid documents only.
* @param {boolean} [unique] - Choice for importing unique datas.
*/

/**
* @typedef {Object} MongoKey
* @property {string|void} key Parsed Key
* @property {string|void} target Parsed target
*/

exports.Events = {
    DEBUG: "debug",
    ERROR: "error",
    READY: "ready",
};

/**
 * Emitted whenever the database is ready to work.
 * @event MongoDB#ready
 * @param {MongoDB} database - The database that this event happened.
 * @example db.on("ready", (database) => {
 * console.log(`Database: ${database.name} is ready.`);
 * });
 */

/**
 * Emitted whenever an error is returned.
 * @event MongoDB#error
 * @param {Error} error - The error message which was emitted.
 * @param {MongoDB} database - The database that this was emitted.
 * @example
 * db.on("error", (error) => {
 * console.error(error)
 * });
 */

 /**
  * Emitted whenever a debug event happens.
  * @event MongoDB#debug
  * @param {string} message - The debug message which was emitted.
  * @param {MongoDB} database - The database that this event was emitted.
  * @example
  * db.on("debug", (message) => {
  * console.log(message)
  * });
  */

 // ---------------------------------------------------------------- \\

 /**
 * Emitted whenever an error is returned.
 * @event JsonDB#error
 * @param {Error} error - The error message which was emitted.
 * @param {JsonDB} database - The database that this event was emitted.
 * @example
 * db.on("error", (error) => {
 * console.error(error)
 * });
 */

 /**
  * Emitted whenever a debug event happens.
  * @event JsonDB#debug
  * @param {string} message - The debug message which was emitted.
  * @param {JsonDB} database - The database that this event was emitted.
  * @example
  * db.on("debug", (message) => {
  * console.log(message)
  * });
  */
