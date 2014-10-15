should = require("should")
request = require("supertest")
sinon = require("sinon")

example = require("../examples/books-list")
app = example.app
books = undefined

describe "[odata query orderby]", ->
  before (done) ->
    example.ready ->
      books = example.books
      done()

  it "should default let items order with asc", (done) ->
    request(app)
      .get("/odata/books?$orderby=price")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.should.be.have.property('value')
        for item, i in res.body.value
          nextItem = res.body.value[i+1]
          if nextItem
            (item.price <= nextItem.price).should.be.true
        done()
  it "should let items order asc", (done) ->
    request(app)
      .get("/odata/books?$orderby=price asc")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.should.be.have.property('value')
        for item, i in res.body.value
          nextItem = res.body.value[i+1]
          if nextItem
            (item.price <= nextItem.price).should.be.true
        done()
  it "should let items order desc", (done) ->
    request(app)
      .get("/odata/books?$orderby=price desc")
      .expect(200)
      .expect('Content-Type', /json/)
      .end (err, res) ->
        if(err)
          done(err)
          return
        res.body.should.be.have.property('value')
        for item, i in res.body.value
          nextItem = res.body.value[i+1]
          if nextItem
            (item.price >= nextItem.price).should.be.true
        done()