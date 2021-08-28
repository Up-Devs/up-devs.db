module.exports = require('./base/Client.js')

module.exports = {
 Client: require('./base/Client.js'),
 BaseClient: require('./base/BaseClient.js'),
 JsonDB: require('./base/JsonDB.js'),
 version: require('../package.json').version
}
