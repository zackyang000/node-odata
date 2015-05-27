should = require("should")
request = require("supertest")
app = undefined

describe "Resource special conditions", ->
  describe "use function keyword", ->
    before (done) ->
      server = require './support/resource-use-function-keyword'
      app = server._app
      done()
    it "should work when $filter it", (done) ->
      request(app)
        .post('/odata/resource-use-function-keyword')
        .send
          year: 2015
        .expect(201, done)

  describe "use custom id", ->
    before (done) ->
      server = require './support/resource-use-custom-id'
      app = server._app
      done()
    it "should work", (done) ->
      request(app)
        .post('/odata/resource-use-custom-id')
        .send
          id: 100
        .expect(201, done)
