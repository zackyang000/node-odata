import 'should';
import sinon from 'sinon';
import request from 'supertest';
import { odata, host, port, assertSuccess } from '../../support/setup';
import data from '../../support/books.json';
import { BookModel } from '../../support/books.model';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
  isAutoLogOffActive: {
    type: Boolean,
    default: true
  },
},
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  });

const ConfigModel = mongoose.model('Config', ConfigSchema);

describe('mongo.mocked.singleton', () => {
  let httpServer, modelMock, queryMock, bookInstanceMock, server;

  beforeEach(async function () {
    server = odata();
  });

  afterEach(() => {
    httpServer.close();
    modelMock?.restore();
    queryMock?.restore();
    bookInstanceMock?.restore();
  });

  it('should select anyone field', async function () {
    const query = {
      $where: () => { },
      where: () => { },
      equals: () => { },
      select: () => { },
      sort: () => { },
      exec: () => { },
      model: BookModel
    };
    const books = data.map(item => ({
      price: item.price
    }));

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('findOne').once().returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 0,
      price: 1
    });
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve({ toObject: () => books[0] })));
    server.mongoSingleton('book', BookModel);
    httpServer = server.listen(port);

    const res = await request(host).get('/book?$select=price');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    res.body.should.deepEqual(books[0]);
  });

  it('should select anyone field for upsert', async function () {
    const query = {
      $where: () => { },
      where: () => { },
      equals: () => { },
      select: () => { },
      sort: () => { },
      exec: () => { },
      model: BookModel
    };
    const books = data.map(item => ({
      price: item.price
    }));

    modelMock = sinon.mock(BookModel);
    queryMock = sinon.mock(query);
    modelMock.expects('findOne').once().returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 0,
      price: 1
    });
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve(undefined)));
    bookInstanceMock = sinon.mock(BookModel.prototype);
    bookInstanceMock.expects('toObject').once().returns(JSON.parse(JSON.stringify(data[0])));
    server.mongoSingleton('book', BookModel);
    httpServer = server.listen(port);

    const res = await request(host).get('/book?$select=price');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    bookInstanceMock.verify();
    res.body.should.deepEqual(books[0]);
  });

  it('should return default value', async function () {
    const query = {
      $where: () => { },
      where: () => { },
      equals: () => { },
      select: () => { },
      sort: () => { },
      exec: () => { },
      model: ConfigModel
    };

    modelMock = sinon.mock(ConfigModel);
    queryMock = sinon.mock(query);
    modelMock.expects('findOne').once().returns(query);
    queryMock.expects('select').once().withArgs({
      _id: 0,
      isAutoLogOffActive: 1
    });
    queryMock.expects('exec').once()
      .returns(new Promise(resolve => resolve(undefined)));
    bookInstanceMock = sinon.mock(ConfigModel.prototype);
    bookInstanceMock.expects('toObject').once().returns(JSON.parse(JSON.stringify({ isAutoLogOffActive: true })));
    server.mongoSingleton('config', ConfigModel);
    httpServer = server.listen(port);

    const res = await request(host).get('/config?$select=isAutoLogOffActive');

    assertSuccess(res);
    modelMock.verify();
    queryMock.verify();
    bookInstanceMock.verify();
    res.body.should.deepEqual({
      isAutoLogOffActive: true
    });
  });
});
