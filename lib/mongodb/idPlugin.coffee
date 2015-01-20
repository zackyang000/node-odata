uuid = require('node-uuid')

module.exports = exports = (schema, options) ->
  # add _id to schema.
  unless schema.paths._id
    schema.add
      _id:
        type: String
        unique: true

  # copy _id to id.
  unless schema.paths.id
    schema.virtual('id').get -> this._id
    schema.set 'toObject', virtuals: true
    schema.set 'toJSON', virtuals: true

  # reomove _id when serialization.
  remove = (doc, ret, options) ->
    delete ret._id
    delete ret.id  unless ret.id
    return ret
  schema.options.toObject = {} unless schema.options.toObject
  schema.options.toJSON = {} unless schema.options.toJSON
  schema.options.toObject.transform = remove
  schema.options.toJSON.transform = remove

  # genarate _id.
  schema.pre 'save', (next) ->
    if this.isNew and !this._id
      this._id = uuid.v4()
    next()
