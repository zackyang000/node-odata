###
should = require('should')
request = require('supertest')
odata = require('../.')

PORT = 0

bookSchema =
  title: String

describe 'odata.metadata', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    s = server.listen PORT, ->
      PORT = s.address().port
      done()

  it "should work", (done) ->
    request("http://localhost:#{PORT}")
      .get("/")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('resources')
        res.body.resources.should.be.have.property('book')
        res.body.resources.book.should.be.have.property('title')
        res.body.resources.book.title.should.be.equal('String')
        done()
###
