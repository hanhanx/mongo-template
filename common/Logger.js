var level = process.env.LOGLEVEL || 'debug';
var logger = require('tracer').console({level:level});
module.exports = logger;