odata = require '../../index'

server = odata('mongodb://localhost/odata-test')

server.config.set 'enableOdataSyntax', true

server.resources.register
  url: '/odataSyntax'
  model:
    title: String

module.exports = server
