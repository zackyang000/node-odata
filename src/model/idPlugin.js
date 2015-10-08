'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeUuid = require('node-uuid');

var _nodeUuid2 = _interopRequireDefault(_nodeUuid);

exports['default'] = function (schema, options) {

  // add _id to schema.
  if (!schema.paths._id) {
    schema.add({
      _id: {
        type: String,
        unique: true }
    });
  }

  // display value of _id when request id.
  if (!schema.paths.id) {
    schema.virtual('id').get(function () {
      return this._id;
    });
    schema.set('toObject', { virtuals: true });
    schema.set('toJSON', { virtuals: true });
  }

  // reomove _id when serialization.
  if (!schema.options.toObject) {
    schema.options.toObject = {};
  }
  if (!schema.options.toJSON) {
    schema.options.toJSON = {};
  }
  var remove = function remove(doc, ret, options) {
    delete ret._id;
    if (!ret.id) {
      delete ret.id;
    }
    return ret;
  };
  schema.options.toObject.transform = remove;
  schema.options.toJSON.transform = remove;

  // genarate _id.
  schema.pre('save', function (next) {
    if (this.isNew && !this._id) {
      this._id = _nodeUuid2['default'].v4();
    }
    return next();
  });
};

module.exports = exports['default'];