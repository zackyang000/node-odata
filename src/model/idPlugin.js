import uuid from 'uuid';

/*eslint-disable */
export default function (schema) {
  // add _id to schema.
  if (!schema.paths._id) {
    schema.add({
      _id: {
        type: String,
        unique: true,
      }
    });
  }

  // display value of _id when request id.
  if (!schema.paths.id) {
    schema.virtual('id').get(function getId() {
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
  const remove = (doc, ret) => {
    delete ret._id;
    if (!ret.id) {
      delete ret.id;
    }
    return ret;
  };
  schema.options.toObject.transform = remove;
  schema.options.toJSON.transform = remove;

  // genarate _id.
  schema.pre('save', function preSave(next) {
    if (this.isNew && !this._id) {
      if (this.id) {
        // Use a user-defined id to save
        this._id = this.id;
      } else {
        // Use uuid to save
        this._id = uuid.v4();
      }
    }
    return next();
  });
}
/*eslint-enable */
