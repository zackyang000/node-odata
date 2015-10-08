'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _resource = require('./resource');

var _resource2 = _interopRequireDefault(_resource);

var _function = require('./function');

var _function2 = _interopRequireDefault(_function);

var server = function server(db, prefix) {
  return new _server2['default'](db, prefix);
};

server.Resource = function (name, model) {
  return new _resource2['default'](name, model);
};

server.Function = function () {
  return new _function2['default']();
};

exports['default'] = server;
module.exports = exports['default'];