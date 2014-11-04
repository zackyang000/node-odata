config = require "./config"

module.exports.resources = require "./resource"
module.exports.functions = require "./function"
module.exports.get = config.get
module.exports.set = config.set
module.exports.mongoose = require 'mongoose'