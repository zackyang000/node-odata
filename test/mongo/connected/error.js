import 'should';
import request from 'supertest';
import { host, port, odata } from '../../support/setup';
import mongoose from 'mongoose';
import { connect } from '../../support/db';

const Schema = mongoose.Schema;

describe('mongo.error', () => {
  let httpServer, server;

  before(() => {
    mongoose.set('overwriteModels', true);
  })

  beforeEach(async function() {
    server = odata();
  
  });

  afterEach(() => {
    httpServer.close();
    mongoose.default.connection.close();
  });

  it('should return 400 for mongo validation errors', async function() {
    const result = {
      error: {
        code: "400",
        message: "Path `password` (`ggm`) is shorter than the minimum allowed length (8).",
        target: "password"
      }
    };
    const UserSchema = new Schema({
      email: {
        type: String
      },
      password: {
        type: String,
        minLength: 8
      },
    });
    
    const UserModel = mongoose.model('User', UserSchema);

    server.mongoEntity('User', UserModel);
    await connect(server);
    httpServer = server.listen(port);

    const res = await request(host)
      .post(`/User`)
      .send({ password: 'ggm' });    

    res.body.should.deepEqual(result);
  });

});
