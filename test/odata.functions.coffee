should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

describe 'odata.functions', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.get '/test', (req, res, next) ->
      res.jsonp test: 'ok'
    s = server.listen PORT, ->
      PORT = s.address().port
      done()

  it 'should work', (done) ->
    request("http://localhost:#{PORT}")
      .get("/test")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.test.should.be.equal('ok')
        done()
