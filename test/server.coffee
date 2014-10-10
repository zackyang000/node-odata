should = require('should')
request = require('supertest')
sinon = require('sinon')
app = require('../examples/books-list')

describe 'Model', ->
  describe 'handlers', ->
    it 'should dispatch to GET', (done) ->
      request(app)
        .get('/odata/books')
        .end -> done()