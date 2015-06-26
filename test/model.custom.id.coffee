should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

describe 'model.custom.id', ->
  app = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'custom-id'
      model:
        id: Number
    app = server._app
    done()

  it 'should work', (done) ->
    request(app)
      .post('/odata/custom-id')
      .send
        id: 100
      .expect(201, done)
