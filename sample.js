const { conn, bookSchema, initData } = require('./test/support/setup');
const odata = require('./');

class Book extends odata.Resource {
  constructor() {
    super('book', bookSchema);
  }
}

const app = new odata({ conn });
app.use(Book);
app.listen(5555);


