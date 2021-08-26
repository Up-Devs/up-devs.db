const JsonDB = require("../base/JsonDB");

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
 * The updev.db client options.
 * @typedef {object} ClientOptions
 */

exports.Events = {
    JSON_DB: 'jsonDB'
}

/**
* Emitter for a json database.
* @event Client#jsonDB
* @param {string} message - The message that was emitted.
* @param {JsonDB} database - The database that was emitted from.
*/