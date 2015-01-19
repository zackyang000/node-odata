should = require("should")
request = require("supertest")

require("./support/resource-use-function-keyword")
app = require('../')._app

describe "[basic CRUD]", ->
  describe "$filter", ->
    it "should get work when key is built-in functions's name", (done) ->
      request(app)
        .post('/odata/resource-use-function-keyword')
        .send
          year: 2015
        .expect(201)
        .expect('Content-Type', /json/)
        .end (err, res) ->
          return done(err)  if(err)
          request(app)
            .get('/odata/resource-use-function-keyword?$filter=year eq 2015')
            .expect(200)
            .expect('Content-Type', /json/)
            .end (err, res) ->
              return done(err)  if(err)
              res.body.value.length.should.be.above(0)
              done()
