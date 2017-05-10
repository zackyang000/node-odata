export default class Query {
  constructor(model, filter) {
    this.model = model;
    this.filter = filter;
    this.query = model.find();
  }

  top() {
  }

  skip() {
  }

  orderby() {
  }

  select() {
  }

  count() {
  }

  filter() {
  }
}

