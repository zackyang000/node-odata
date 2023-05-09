export default class Hooks {
  constructor() {
    this.before = [];
    this.after = [];
  }

  addBefore(fn) {
    if (!fn) {
      throw new Error(`Parameter 'fn' should be given`);
    }

    if (Array.isArray(fn)) {
      this.before = this.before.concat(fn.map(item => this.suppressNext(item)));

    } else {
      this.before.push(this.suppressNext(fn));
    }
  }

  suppressNext(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res);
        next();

      } catch (err) {
        next(err);
      }
    };
  }

  addAfter(fn) {
    if (!fn) {
      throw new Error(`Parameter 'fn' should be given`);
    }

    if (Array.isArray(fn)) {
      this.after = fn.map(item => this.suppressNext(item)).concat(this.after);
    } else {
      this.after.unshift(this.suppressNext(fn));
    }
  }

}