should = require("should")
request = require("supertest")
odata = require '../'
app = undefined

describe 'database config', ->
  it "should 200 when set correct connection string", (done) ->
    server = odata()
    server.set('db', 'mongodb://localhost/odata-test')
    app = server._app
    request(app)
      .get("/odata")
      .expect(200, done)

  it "should 500 when set wrong connection string", (done) ->
    server = odata()
    server.set('db', 'mongodb://localhost/odata-test')
    app = server._app
    request(app)
      .get("/odata")
      .expect(200, done)
