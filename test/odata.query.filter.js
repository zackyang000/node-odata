var PORT, bookSchema, books, odata, request, should, support;

should = require('should');

request = require('supertest');

odata = require('../.');

support = require('./support');

PORT = 0;

bookSchema = {
  author: String,
  description: String,
  genre: String,
  price: Number,
  publish_date: Date,
  title: String
};

books = void 0;

describe('odata.query.filter', function() {
  before(function(done) {
    var conn, server;
    conn = 'mongodb://localhost/odata-test';
    server = odata(conn);
    server.resource('book', bookSchema);
    return support(conn, function(data) {
      var s;
      books = data;
      return s = server.listen(PORT, function() {
        PORT = s.address().port;
        return done();
      });
    });
  });
  describe('[Equal]', function() {
    it('should filter items', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=title eq '" + books[1].title + "'").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.be.equal(1);
        res.body.value[0].title.should.be.equal(books[1].title);
        return done();
      });
    });
    it('should filter items when field has keyword', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=author eq 'Ralls, Kim'").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.be.equal(1);
        return done();
      });
    });
    it('should filter items when it has extra spaces at begin', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=   title eq '" + books[1].title + "'").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.be.equal(1);
        res.body.value[0].title.should.be.equal(books[1].title);
        return done();
      });
    });
    it('should filter items when it has extra spaces at mid', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=title   eq   '" + books[1].title + "'").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.be.equal(1);
        res.body.value[0].title.should.be.equal(books[1].title);
        return done();
      });
    });
    return it('should filter items when it has extra spaces at end', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=title eq '" + books[1].title + "'   ").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.be.equal(1);
        res.body.value[0].title.should.be.equal(books[1].title);
        return done();
      });
    });
  });
  describe("'Not equal'", function() {
    return it('should filter items', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=title ne '" + books[1].title + "'").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.should.matchEach(function(item) {
          return item.title !== books[1].title;
        });
        return done();
      });
    });
  });
  describe("'Greater than'", function() {
    return it('should filter items', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=price gt 36.95").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.price > 36.95;
        });
        return done();
      });
    });
  });
  describe('[Greater than or equal]', function() {
    return it('should filter items', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=price ge 36.95").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.price >= 36.95;
        });
        return done();
      });
    });
  });
  describe('[Less than]', function() {
    return it('should filter items', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=price lt 36.95").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.price < 36.95;
        });
        return done();
      });
    });
  });
  describe('[Less than or equal]', function() {
    return it('should filter items', function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=price le 36.95").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.price <= 36.95;
        });
        return done();
      });
    });
  });
  return describe('[Logical and]', function() {
    it("should filter items", function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=title ne '" + books[1].title + "' and price ge 36.95").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.title !== books[1].title && item.price >= 36.95;
        });
        return done();
      });
    });
    return it("should filter items when it has extra spaces", function(done) {
      return request("http://localhost:" + PORT).get("/book?$filter=title ne '" + books[1].title + "'   and   price ge 36.95").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.title !== books[1].title && item.price >= 36.95;
        });
        return done();
      });
    });
  });
});

// ---
// generated by coffee-script 1.9.2
