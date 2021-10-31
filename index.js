module.exports = {
    // Databases
    MongoDB: require("./src/base/MongoDB"),
    JsonDB: require('./src/base/JsonDB'),

    // Bases
    MongoBase: require("./src/base/MongoBase"),

    // Error
    UpError: require("./src/Error"),

    // Util
    Util: require("./src/util/Util"),

    // Managers
    Schema: require("./src/manager/Schema"),

    // Structures
    Colorful: require("./src/structures/Colorful"),

    version: require("./package.json").version
};
