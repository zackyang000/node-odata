should = require('should')
request = require('supertest')
odata = require('../.')

bookSchema =
  title: String

describe 'odata.metadata', ->
  app = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    done()

  it "should work", (done) ->
    request(app)
      .get("/")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('resources')
        res.body.resources.should.be.have.property('book')
        res.body.resources.book.should.be.have.property('title')
        res.body.resources.book.title.should.be.equal('String')
        done()
