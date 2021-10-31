const { Schema, Connection } = require("mongoose");

const UpSchema = new Schema({
    ID: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true
    }
});

/**
 * Makes and returns an UpSchema.
 * @param {Connection} connection - Mongoose's MongoDB connection.
 * @param {string} name - MongoDB model name.
 * @returns {Schema}
 */
module.exports = (connection, name) => {
    if (typeof name === "string") {
       return connection.model(name, UpSchema);
    } else {
       return connection.model("JSON", UpSchema);
    }
};
