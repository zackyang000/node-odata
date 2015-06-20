should = require("should")
request = require("supertest")

support = require('./support')
app = undefined
books = undefined

describe "Use put method to create entity", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
      done()

  it "should work", (done) ->
    id = 'adb6fac1-e046-4dbe-bc36-e574360f3f08'
    request(app)
      .put("/odata/books/#{id}")
      .send
        title: "Code Complete"
      .expect(201)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('id')
        res.body.id.should.be.equal(id)
        done()
