should = require("should")
request = require("supertest")

require("../examples/hidden-field")
app = require('../')._app

describe "[hidden-field]", ->
  before (done) ->
      done()

  it "should work", (done) ->
    request(app)
      .post("/odata/users")
      .send
        name: "zack"
        password: "123"
      .expect(201)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        return done(err)  if(err)
        request(app)
          .get("/odata/users/#{res.body._id}")
          .expect(200)
          .end (err, res) ->
            res.body.should.be.have.property('name')
            res.body.name.should.be.equal('zack')
            res.body.should.be.not.have.property('password')
            done()
