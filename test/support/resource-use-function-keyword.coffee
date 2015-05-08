odata = require '../../index'

server = odata('mongodb://localhost/odata-test')

server.resources.register
  url: '/resource-use-function-keyword'
  model:
    year: Number

module.exports = server
