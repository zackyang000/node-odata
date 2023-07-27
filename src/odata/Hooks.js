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

  suppressNext(fn, name, isFinal) {
    return async (req, res, next) => {
      try {
        if (name) {
          const con = new Console();

          con.debug(`Hook ${name} started`);
        }

        const combine = new Promise(async (resolve, reject) => {
          try {
            const prom = fn(req, res, err => {
              if (err) {
                reject(err);
              }
              resolve();
            });

            if (prom && prom.then) {
              await prom;
              resolve();
            } else if (isFinal) {
              resolve();
            }

          } catch (err) {
            reject(err);
          }
        });

        await combine;
        if (!isFinal) {
          next();
        }

      } catch (err) {
        next(err);
      }
    };
  }

  addAfter(fn, name, isFinal) {
    if (!fn) {
      throw new Error(`Parameter 'fn' should be given`);
    }

    if (Array.isArray(fn)) {
      this.after = fn.map(item => this.suppressNext(item, name, isFinal)).concat(this.after);
    } else {
      this.after.unshift(this.suppressNext(fn, name, isFinal));
    }
  }

}