should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

describe 'model.special.name', ->

  describe 'use function keyword', ->
    before (done) ->
      conn = 'mongodb://localhost/odata-test'
      server = odata(conn)
      server.resource 'funcion-keyword', year: Number
      s = server.listen PORT, ->
        PORT = s.address().port
        done()

    it 'should work', (done) ->
      request("http://localhost:#{PORT}")
        .post('/funcion-keyword')
        .send
          year: 2015
        .expect(201, done)
