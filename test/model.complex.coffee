# For issue: https://github.com/TossShinHwa/node-odata/issues/55

should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

PORT = 0

describe 'model.custom.id', ->
  before (done) ->
    server = odata('mongodb://localhost/odata-test')
    server.resource('complex-model', {
        p1: [{
            p2: String
        }]
    })
    s = server.listen PORT, ->
      PORT = s.address().port
      done()

  it 'should work when PUT something', (done) ->
    request("http://localhost:#{PORT}")
      .post('/complex-model')
      .send
        p1: [{
          p2: 'origin'
        }]
      .expect(201)
      .end (err, res) ->
        return done(err)  if(err)
        id = res.body.id
        request("http://localhost:#{PORT}")
          .put("/complex-model(#{id})")
          .send
            p1: [{
              p2: 'new'
            }]
          .expect(200)
          .end (err, res) ->
            return done(err)  if(err)
            request("http://localhost:#{PORT}")
              .get("/complex-model(#{id})")
              .expect(200)
              .end (err, res) ->
                res.body.p1[0].p2.should.be.equal('new')
                done()
