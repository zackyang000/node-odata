uuid = require('node-uuid')

module.exports = exports = (schema, options) ->
  schema.add({ lastMod: Date })

  unless schema.paths._id
    schema.add
      _id:
        type: String
        unique: true

  schema.pre 'save', (next) ->
    if this.isNew and !this._id
      this._id = uuid.v4()
    next()
