should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

describe 'odata.functions', ->
  app = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.get '/license', (req, res, next) ->
      res.jsonp test:'ok'
    app = server._app
    done()

  it 'should work', (done) ->
    request(app)
      .get("/odata/test")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.test.should.be.equal('ok')
        done()
