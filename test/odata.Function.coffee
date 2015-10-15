should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

conn = 'mongodb://localhost/odata-test'

describe 'odata.Function', ->
  it 'get should work', (done) ->
    test = odata.Function()
    test.get '/test', (req, res, next) ->
      res.jsonp test: 'ok'
    server = odata(conn)
    server.use(test)
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .get("/test")
        .expect(200, done)
