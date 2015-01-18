should = require("should")
request = require("supertest")

require("../examples/hidden-field")
app = require('../')._app

describe "[hidden-field]", ->
  before (done) ->
      done()

  it "should work when get entity", (done) ->
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

  it "should work when get entities list", (done) ->
    request(app)
      .get("/odata/users")
      .expect(200)
      .end (err, res) ->
        res.body.value[0].should.be.have.property('name')
        res.body.value[0].name.should.be.equal('zack')
        res.body.value[0].should.be.not.have.property('password')
        done()
  ###
  it "should work when get entities list even if it is selected", (done) ->
    request(app)
      .get("/odata/users?$select=name, password")
      .expect(200)
      .end (err, res) ->
        res.body.value[0].should.be.have.property('name')
        res.body.value[0].name.should.be.equal('zack')
        res.body.value[0].should.be.not.have.property('password')
        done()

  it "should work when get entities list even if only it is selected", (done) ->
    request(app)
      .get("/odata/users?$select=password")
      .expect(200)
      .end (err, res) ->
        res.body.value[0].should.be.not.have.property('name')
        res.body.value[0].should.be.not.have.property('password')
        done()
  ###
