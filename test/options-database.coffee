should = require("should")
request = require("supertest")
odata = require '../'

app = undefined

describe 'database config', ->
  before (done) ->
    server = odata()
    server.set('db', 'mongodb://localhost/odata-test')
    server.resources.register
      url: 'db'
      model: {}
    app = server._app
    done()

  it "should 200 when set correct connection string", (done) ->
    request(app)
      .get("/odata/db")
      .expect(200, done)
