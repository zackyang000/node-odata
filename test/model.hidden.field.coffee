should = require('should')
request = require('supertest')
odata = require('../.')

PORT = 0
entity = undefined

describe 'model.hidden.field', ->

  before (done) ->
    server = odata('mongodb://localhost/odata-test')
    server.resource 'hidden-field',
      name: String
      password:
        type: String
        select: false
    s = server.listen PORT, ->
      PORT = s.address().port
      request("http://localhost:#{PORT}")
        .post('/hidden-field')
        .send
          name: 'zack'
          password: '123'
        .end (err, res) ->
          entity = res.body
          done()

  it "should work when get entity", (done) ->
    request("http://localhost:#{PORT}")
      .get("/hidden-field(#{entity.id})")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('name')
        res.body.name.should.be.equal('zack')
        res.body.should.be.not.have.property('password')
        done()

  it 'should work when get entities list', (done) ->
    request("http://localhost:#{PORT}")
      .get('/hidden-field')
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('id')
        res.body.value[0].should.be.have.property('name')
        res.body.value[0].should.be.not.have.property('password')
        done()

  # TODO: unknown error: timeout for test.
  # it 'should work when get entities list even it is selected', (done) ->
  #   request("http://localhost:#{PORT}")
  #     .get('/hidden-field?$select=name, password')
  #     .expect(200)
  #     .end (err, res) ->
  #       res.body.value[0].should.be.not.have.property('id')
  #       res.body.value[0].should.be.have.property('name')
  #       res.body.value[0].should.be.not.have.property('password')
  #       done()

  it 'should work when get entities list even only it is selected', (done) ->
    request("http://localhost:#{PORT}")
      .get('/hidden-field?$select=password')
      .expect(200)
      .end (err, res) ->
        res.body.value[0].should.be.have.property('id')
        res.body.value[0].should.be.have.property('name')
        res.body.value[0].should.be.not.have.property('password')
        done()
