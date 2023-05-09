
const authorizePipe = async (req, res, auth) => {
  if (auth !== undefined && !await auth(req, res)) {
      const result = new Error();

      result.status = 401;
      throw result;
  }
};

const beforePipe = (req, res, before) => new Promise((resolve) => {
  if (before) {
    before(req.body, req, res);
  }
  resolve();
});


const afterPipe = (req, res, after, data) => new Promise((resolve) => {
  if (after) {
    after(data, req.body, req, res);
  }
  resolve();
});

export default {
  afterPipe,
  authorizePipe,
  beforePipe
};
