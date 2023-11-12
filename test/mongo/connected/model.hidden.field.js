import 'should';
import request from 'supertest';
import { odata, host, port } from '../../support/setup';
import mongoose from 'mongoose';
import { init } from '../../support/db';

const Schema = mongoose.Schema;

describe('mongo.connected.model.hidden.field', function () {
  let httpServer, Model;

  before(async function () {
    const server = odata();

    const ModelSchema = new Schema({
      name: String,
      password: {
        type: String,
        select: false
      }
    });

    Model = mongoose.model('hidden-field', ModelSchema);

    server.mongoEntity('hidden-field', Model);
    init(server);

    httpServer = server.listen(port);

  });

  after(() => {
    httpServer.close();
  });

  it('should fail because a property is requested that is not visible', async function () {
    const res = await request(host).get('/hidden-field?$select=name, password');

    res.should.have.property('error');
    res.error.should.not.be.equal(false);
    res.body.error.code.should.be.equal('400');
    res.body.error.message.should.be.equal(`Entity 'hidden-field' has no property named 'password'`);

  });

});
