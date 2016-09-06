import 'should';
import request from 'supertest';
import { odata, conn, host, port, bookSchema, initData } from './support/setup';

let data;

describe('odata.query.filter.functions', function() {
  let httpServer;

  before(async function() {
    data = await initData();
    const server = odata(conn);
    server
    .resource('book', bookSchema)
    .action('/50off', function(req, res, next) {
      server.resources.book.findById(req.params.id, function(err, book) {
        book.price = halfPrice(book.price);
        book.save((err) => res.jsonp(book));
      });
    });
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  describe('[contains]', function() {
    it('should filter items', function(done) {
      request("http://localhost:" + PORT).get("/book?$filter=contains(title,'i')").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.title.indexOf('i') >= 1;
        });
        return done();
      });
    });
    it('should filter items when it has extra spaces in query string', function(done) {
      request("http://localhost:" + PORT).get("/book?$filter=contains(title,'Visual Studio')").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.title.indexOf('Visual Studio') >= 0;
        });
        return done();
      });
    });
  });

  describe('[indexof]', function() {
    it('should filter items', function(done) {
      request("http://localhost:" + PORT).get("/book?$filter=indexof(title,'i') ge 1").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.title.indexOf('i') >= 1;
        });
        return done();
      });
    });
    it('should filter items when it has extra spaces in query string', function(done) {
      request("http://localhost:" + PORT).get("/book?$filter=indexof(title,'Visual Studio') ge 0").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return item.title.indexOf('Visual Studio') >= 0;
        });
        return done();
      });
    });
  });

  describe('[year]', function() {
    it('should filter items', function(done) {
      request("http://localhost:" + PORT).get("/book?$filter=year(publish_date) eq 2000").expect(200).end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.value.length.should.greaterThan(0);
        res.body.value.should.matchEach(function(item) {
          return new Date(item.publish_date).getFullYear() === 2000;
        });
        return done();
      });
    });
  });
});
