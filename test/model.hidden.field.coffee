should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

describe 'model.hidden.field', ->
  app = undefined
  entity = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'hidden-field'
      model:
        name: String
        password:
          type: String
          select: false
    app = server._app
    request(app)
      .post('/odata/hidden-field')
      .send
        name: 'zack'
        password: '123'
      .end (err, res) ->
        entity = res.body
        done()

  it "should work when get entity", (done) ->
    request(app)
      .get("/odata/hidden-field/#{entity.id}")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('name')
        res.body.name.should.be.equal('zack')
        res.body.should.be.not.have.property('password')
        done()

  it 'should work when get entities list', (done) ->
    request(app)
      .get('/odata/hidden-field')
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.value[0].should.be.have.property('name')
        res.body.value[0].should.be.not.have.property('password')
        done()

  it 'should work when get entities list even if it is selected', (done) ->
    request(app)
      .get('/odata/hidden-field?$select=name, password')
      .expect(200)
      .end (err, res) ->
        res.body.value[0].should.be.have.property('name')
        res.body.value[0].should.be.not.have.property('password')
        done()

  it 'should work when get entities list even if only it is selected', (done) ->
    request(app)
      .get('/odata/hidden-field?$select=password')
      .expect(200)
      .end (err, res) ->
        res.body.value[0].should.be.not.have.property('name')
        res.body.value[0].should.be.not.have.property('password')
        done()
