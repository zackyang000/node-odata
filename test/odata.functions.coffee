should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

conn = 'mongodb://localhost/odata-test'

describe 'odata.functions', ->
  it 'get should work', (done) ->
    server = odata(conn)
    server.get '/test', (req, res, next) ->
      res.jsonp test: 'ok'
    PORT = 0
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .get("/test")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.test.should.be.equal('ok')
          done()

  it 'put should work', (done) ->
    server = odata(conn)
    server.put '/test', (req, res, next) ->
      res.jsonp test: 'ok'
    PORT = 0
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .put("/test")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.test.should.be.equal('ok')
          done()

  it 'post should work', (done) ->
    server = odata(conn)
    server.post '/test', (req, res, next) ->
      res.jsonp test: 'ok'
    PORT = 0
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .post("/test")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.test.should.be.equal('ok')
          done()

  it 'put should work', (done) ->
    server = odata(conn)
    server.delete '/test', (req, res, next) ->
      res.jsonp test: 'ok'
    PORT = 0
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .delete("/test")
        .expect(200)
        .end (err, res) ->
          return done(err)  if(err)
          res.body.test.should.be.equal('ok')
          done()
