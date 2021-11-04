const Error = require('../Error');

/**
 * Makes your console colorful
 * @private
 */
class Colorful {
   /**
    * Colorful stuff and options.
    * @param {string} text - The text that you want to make colorful.
    */
   constructor(text = '') {
    if (!text || text === '') throw new Error("No text was provided!");
    if (typeof text !== "string") throw new Error(`Expected a string for text, received ${typeof text}`);

     /**
      * The colorful console text that was generated.
      * @type {string}
      * @private
      */
     this.colorfulText = text
      .replace(/&red/g, '\x1b[31m')
		.replace(/&grn/g, '\x1b[32m')
		.replace(/&ylw/g, '\x1b[33m')
		.replace(/&blu/g, '\x1b[34m')
		.replace(/&mgn/g, '\x1b[35m')
		.replace(/&cyn/g, '\x1b[36m')
		.replace(/&wht/g, '\x1b[37m')
      .replace(/&end/g, '\x1b[0m');

      console.log(this.colorfulText);
   }

   /**
    * Returns this colorful console message as a string.
    * @returns {string}
    */
   toString() {
    return this.colorfulText;
   }
}

module.exports = Colorful;
