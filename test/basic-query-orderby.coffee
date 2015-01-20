should = require("should")
request = require("supertest")

require("../examples/basic")
support = require('./support')
app = undefined
books = undefined

describe "odata query orderby", ->
  before (done) ->
    support.ready ->
      app = support.app
      books = support.books
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
  it "should let items order when use multiple fields", (done) ->
    request(app)
      .get("/odata/books?$orderby=price,title")
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
            if item.price == nextItem.price
              (item.title <= nextItem.title).should.be.true
        done()
###
  it "should 500 when order by not exist field", (done) ->
    request(app)
      .get("/odata/books?$orderby=not-exist-field")
      .expect(500, done)
###
