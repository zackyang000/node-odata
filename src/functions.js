import config from './config'

module.exports = {
  register: (params) => {
    var url = params.url;
    var method = params.method.toLowerCase();
    var handle = params.handle;
    var app = config.get('app');
    var prefix = config.get('prefix');
    app[method](`${prefix}${url}`, handle);
  }
}
