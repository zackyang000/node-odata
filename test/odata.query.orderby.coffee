should = require('should')
request = require('supertest')
odata = require('../.')
support = require('./support')

bookSchema =
  author: String
  description: String
  genre: String
  price: Number
  publish_date: Date
  title: String

describe 'odata.query.orderby', ->
  app = undefined
  books = undefined

  before (done) ->
    conn = 'mongodb://localhost/odata-test'
    server = odata(conn)
    server.register
      url: 'book'
      model: bookSchema
    app = server._app
    support conn, (data) ->
      books = data
      done()

  it 'should default let items order with asc', (done) ->
    request(app)
      .get("/book?$orderby=price")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('value')
        for item, i in res.body.value
          nextItem = res.body.value[i+1]
          if nextItem
            (item.price <= nextItem.price).should.be.true
        done()

  it 'should let items order asc', (done) ->
    request(app)
      .get("/book?$orderby=price asc")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('value')
        for item, i in res.body.value
          nextItem = res.body.value[i+1]
          if nextItem
            (item.price <= nextItem.price).should.be.true
        done()

  it 'should let items order desc', (done) ->
    request(app)
      .get("/book?$orderby=price desc")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('value')
        for item, i in res.body.value
          nextItem = res.body.value[i+1]
          if nextItem
            (item.price >= nextItem.price).should.be.true
        done()

  it 'should let items order when use multiple fields', (done) ->
    request(app)
      .get("/book?$orderby=price,title")
      .expect(200)
      .end (err, res) ->
        return done(err)  if(err)
        res.body.should.be.have.property('value')
        for item, i in res.body.value
          nextItem = res.body.value[i+1]
          if nextItem
            (item.price <= nextItem.price).should.be.true
            if item.price == nextItem.price
              (item.title <= nextItem.title).should.be.true
        done()

  it "should be ignore when order by not exist field", (done) ->
    request(app)
      .get("/book?$orderby=not-exist-field")
      .expect(200, done)

