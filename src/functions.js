import config from './config'

module.exports = {
  register: (params) =>
    url = params.url;
    method = params.method.toLowerCase();
    handle = params.handle;
    app = config.get('app');
    prefix = config.get('prefix');
    app[method](`${prefix}${url}`, handle);
}
