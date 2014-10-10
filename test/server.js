var app, request, should, sinon;

should = require('should');

request = require('supertest');

sinon = require('sinon');

app = require('../examples/books-list');

describe('Model', function() {
  return describe('handlers', function() {
    return it('should dispatch to GET', function(done) {
      return request(app).get('/odata/books').end(function() {
        return done();
      });
    });
  });
});
