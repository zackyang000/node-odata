odata = require '../../index'

server = odata('mongodb://localhost/odata-test')

server.resources.register
  url: '/resource-use-custom-id'
  model:
    id: Number

module.exports = server
