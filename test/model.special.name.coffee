should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

describe 'model.special.name', ->
  app = undefined

  describe 'use function keyword', ->
    before (done) ->
      conn = 'mongodb://localhost/odata-test'
      server = odata(conn)
      server.register
        url: 'funcion-keyword'
        model:
          year: Number
      app = server._app
      done()
    it 'should work', (done) ->
      request(app)
        .post('/funcion-keyword')
        .send
          year: 2015
        .expect(201, done)
