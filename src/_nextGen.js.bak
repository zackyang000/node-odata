import Resource from './ODataResource';

const model = {
  title: String,
  price: Number,
};

function checkUserAuth() {}
function router() {}
function queryable() {}

export default class Book extends Resource {
  constructor() {
    super('book', model);
  }

  @queryable({ pageSize: 10, maxTop: 100 })
  async onGetList(next) {
    const entities = await next();
    console.log(entities);
  }

  async onGet(next) {
    // do something before
    const entity = await next();
    console.log(entity);
    // dosomething after
  }

  async onCreate(next) {
    const entity = await next();
    console.log(entity);
  }

  @checkUserAuth
  async onRemove(next) {
    const entity = await next();
    console.log(entity);
  }

  @checkUserAuth
  async onUpdate(next) {
    const entity = await next();
    console.log(entity);
  }

  @router['/50off']
  async halfPriceAction(id, query) {
    const entity = await this.findOneById(id);
    entity.price /= 2;
    await entity.save();
    return entity;
  }
}
