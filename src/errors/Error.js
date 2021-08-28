const ErrorList = require('./ErrorList')

class UpError extends Error {

    /**
     * 
     * @param {string} message - This error's message
     * @param {string} [type=TypeError] - This error's type (RangeError, ReferenceError etc).
     */
    constructor(message, type) {
    super();

        this.message = message;

        this.name = type ? type : "TypeError";
    }

}

module.exports = UpError;
