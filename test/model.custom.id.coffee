should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

describe 'model.custom.id', ->
  before (done) ->
    server = odata('mongodb://localhost/odata-test')
    server.resource 'custom-id', id: Number
    s = server.listen PORT, ->
      PORT = s.address().port
      done()

  it 'should work', (done) ->
    request("http://localhost:#{PORT}")
      .post('/custom-id')
      .send
        id: 100
      .expect(201, done)

