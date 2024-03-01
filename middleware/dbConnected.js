const redisDB = require('../redisDB')

function dbConnected(req, res, next) {


    next()
}

module.exports = dbConnected