should = require('should')
request = require('supertest')
odata = require('../.')

PORT = 0

bookSchema =
  title:
    type: String
    unique: true

describe 'rest.post', ->
  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.resource 'book', bookSchema
    s = server.listen PORT, ->
      PORT = s.address().port
      done()

  it 'should create new resource', (done) ->
    request("http://localhost:#{PORT}")
      .post("/book")
      .send
        title: Math.random()
      .expect(201)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('id')
        res.body.should.be.have.property('title')
        done()

  it 'should be 422 if post without data', (done) ->
    request("http://localhost:#{PORT}")
      .post("/book")
      .expect(422, done)

  it 'should be 500 if same title already exist.', (done) ->
    title = Math.random()
    request("http://localhost:#{PORT}")
      .post("/book")
      .send
        title: title
      .expect(201)
      .end (err, res) ->
        request("http://localhost:#{PORT}")
          .post("/book")
          .send
            title: title
          .expect(500)
          .end (err, res) ->
            return done(err)  if(err)
            res.should.be.have.property('error')
            res.error.should.be.have.property('text')
            done()
