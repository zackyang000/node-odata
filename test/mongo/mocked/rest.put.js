import 'should';
import request from 'supertest';
import { odata, host, port } from '../../support/setup';
import books from '../../support/books.json';
import { BookModel } from '../../support/books.model';
import sinon from 'sinon';

describe('mongo.mocked.rest.put', () => {
  let httpServer, modelMock, bookInstanceMock;

  before(async function () {
    const server = odata();

    server.mongoEntity('book', BookModel);
    httpServer = server.listen(port);
  });

  after(() => {
    httpServer.close();
  });

  beforeEach(() => {
    modelMock?.restore();
    bookInstanceMock?.restore();
  });

  it('should modify resource', async function () {
    const book = JSON.parse(JSON.stringify(books[0]));

    book.title = 'modify book';
    modelMock = sinon.mock(BookModel);
    modelMock.expects('findOne').once().withArgs({_id: '1'})
      .returns(new Promise((resolve, reject) => resolve(JSON.parse(JSON.stringify({
        ...books[0],
        _id: books[0].id
      })))));
    modelMock.expects('findByIdAndUpdate').once().withArgs('1', book)
      .returns(new Promise(resolve => resolve()));

    const res = await request(host)
      .put(`/book('${book.id}')`)
      .send(book);

    modelMock.verify();
    res.body.should.be.have.property('title');
    res.body.title.should.be.equal(book.title);
  });
  it('should create resource if send with a id which not exist', async function () {
    const book = JSON.parse(JSON.stringify(books[0]));

    book.id = '12345678-1234-1234-A123-123456789012';
    book.title = 'new book';
    modelMock = sinon.mock(BookModel);
    modelMock.expects('findOne').once().withArgs({_id: book.id})
      .returns(new Promise(resolve => resolve()))
    // mocking save method of created with new instance
    bookInstanceMock = sinon.mock(BookModel.prototype);
    bookInstanceMock.expects('save').once()
      .returns(new Promise(resolve => resolve()))

    const res = await request(host)
      .put(`/book('${book.id}')`)
      .send({ title: book.title });

    res.body.should.be.have.property('title');
    res.body.title.should.be.equal(book.title);
    res.body.should.be.have.property('id');
    modelMock.verify();
  });
  it('should be 404 if without id', async function () {
    const res = await request(host).put(`/book`).send(books[0]);
    res.status.should.be.equal(404);
  });
  it("should 400 if with a wrong id", async function () {
    const book = JSON.parse(JSON.stringify(books[0]));

    book.title = 'new book';
    modelMock = sinon.mock(BookModel);
    modelMock.expects('findOne').once().withArgs({_id: book.id})
     .returns(new Promise(resolve => resolve()))

    const res = await request(host).put(`/book('1')`).send(books[0]);

    res.status.should.be.equal(400);
    modelMock.verify();
  });
});
