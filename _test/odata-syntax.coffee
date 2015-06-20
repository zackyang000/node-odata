should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
server = undefined

describe "Enable odata syntax", ->
  before (done) ->
      server = require './support/enable-odata-syntax'
      app = server._app
      request(app)
        .post("/odata/odataSyntax")
        .send
          title: 'test'
        .end(done)

  it "should use 200 if it have entity", (done) ->
    request(app)
      .get("/odata/odataSyntax")
      .end (err, res) ->
        console.log res.body.value[0].id
        request(app)
          .get("/odata/odataSyntax(#{res.body.value[0].id})")
          .end(200, done)

  it "should use 404 if it have not entity", (done) ->
    request(app)
      .get("/odata/odataSyntax(1)")
      .end(404, done)

