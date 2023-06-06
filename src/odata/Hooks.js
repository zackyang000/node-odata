import Console from "../writer/Console";

export default class Hooks {
  constructor() {
    this.before = [];
    this.after = [];
  }

  addBefore(fn, name) {
    if (!fn) {
      throw new Error(`Parameter 'fn' should be given`);
    }

    if (Array.isArray(fn)) {
      this.before = this.before.concat(fn.map(item => this.suppressNext(item, name)));

    } else {
      this.before.push(this.suppressNext(fn, name));
    }
  }

  suppressNext(fn, name) {
    return async (req, res, next) => {
      try {
        const con = new Console();

        con.debug(`Hook ${name} started`);

        const prom = fn(req, res, next);
        if (prom && prom.then) {
          await prom;
          next();
        }

      } catch (err) {
        next(err);
      }
    };
  }

  addAfter(fn, name) {
    if (!fn) {
      throw new Error(`Parameter 'fn' should be given`);
    }

    if (Array.isArray(fn)) {
      this.after = fn.map(item => this.suppressNext(item, name)).concat(this.after);
    } else {
      this.after.unshift(this.suppressNext(fn, name));
    }
  }

}