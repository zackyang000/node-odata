import 'should';
import request from 'supertest';
import { odata, host, port, bookSchema } from '../../support/setup';
import { BookModel } from '../../support/books.model';
import mongoose from 'mongoose';
import sinon from 'sinon';

const Schema = mongoose.Schema;

describe('rest.get', () => {
  const query = {
    $where: () => { },
    limit: () => { },
    skip: () => { },
    select: () => { },
    sort: () => { },
    exec: () => { }
  };
  const bookQuery = {
    ...query,
    model: BookModel
  };
  
  let httpServer, modelMock, queryMock, complexQuery;

  before(async function() {
    const server = odata();
    server.mongoEntity('book', BookModel);
    const ComplexModelSchema = new Schema({
      p1: {
        p2: {
          type: String
        }
      }
    });

    mongoose.set('overwriteModels', true);
    const ComplexModel = mongoose.model('complex-type', ComplexModelSchema);

    complexQuery = {
      ...query,
      model: ComplexModel
    };
    server.mongoEntity('complex-type', ComplexModel);
    httpServer = server.listen(port);

  });

  after(() => {
    httpServer.close();
  });

  afterEach(() => {
    modelMock?.restore();
    queryMock?.restore();
  });

  it('should return all of the resources', async function() {
    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(bookQuery);
    modelMock.expects('find').once().returns(bookQuery);
    queryMock.expects('exec').once().callsArgWith(0, null, []);

    const res = await request(host).get(`/book`);

    res.body.should.be.have.property('value');
    res.body.value.length.should.be.equal(0);
    modelMock.verify();
    queryMock.verify();
  });
  it('should return special resource', async function() {
    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(bookQuery);
    modelMock.expects('findById').once().withArgs('1')
      .callsArgWith(1, null, {toObject: () => ({title: 'Krieg und Frieden'})})

    const res = await request(host).get(`/book('1')`);
    
    res.body.should.be.have.property('title');
    res.body.title.should.be.equal('Krieg und Frieden');
  });
  it('should be 404 if resouce name not declare', async function() {
    const res = await request(host).get(`/not-exist-resource`);
    res.status.should.be.equal(404);
  });
  it('should be 404 if resource not exist', async function() {
    const res = await request(host).get(`/book(not-exist-id)`);
    res.status.should.be.equal(404);
  });
  it('should replace a dot in property names with -', async function() {
    const res = await request(host).get(`/complex-type(${cdata[0].id})`);
    res.body.should.be.have.property('p1-p2');
  });
});
