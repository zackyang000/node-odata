export default class Vocabulary {
  constructor() {
    this.terms = {};
    this.enumerations = {};
    this.items = {};
  }

  getMetadata() {
    const result = {};
    const names = Object.keys(this.terms)
      .forEach(name => {
        result[name] = {
          $Kind: 'Term',
          ...this.terms[name]
        }
      });

    return result;
  }

  isDefined(name) {
    return this.terms[name] ? true : false;
  }

  define(name, prototype, scope) {
    debugger;
    if (this.terms[name]) {
      throw new Error(`Annotation with name '${name}' is allready defined`);
    }

    const isEnum = Array.isArray(prototype);

    if (isEnum) {
      if (!prototype.length) {
        throw new Error('For enumeration array at least one item is required');
      }
      this.enumerations[name] = prototype;
    }

    const type = isEnum ? this.getTypeOf(prototype[0]) : this.getType(prototype);
    const supportedTargets = [ 'Action', 'Action Import', 'Complex Type', 'Entity Container',
      'Entity Set', 'Entity Type', 'Enumeration Type', 'Enumeration Type Member', 'Function',
      'Function Import', 'Navigation Property', 'Parameter', 'Property', 'Return Type',
      'Singleton', 'Type Definition' ];

    if (scope && scope.length) {
      scope.forEach(target => {
        if (supportedTargets.indexOf(target) === -1) {
          throw new Error(`Target '${target}' is not supported`);
        }
      });
    }

    this.terms[name] = {
      $AppliesTo: scope && scope.length ? scope : supportedTargets
    };

    if (type) {
      this.terms[name].$Type = type;
    }

    if (prototype.item) {
      this.terms[name].$Collection = true;
      this.items[name] = prototype.item;
    }
  }

  annotate(name, destination, value) {
    const anno = this.terms[name];
    const enumeration = this.enumerations[name];

    if (!anno) {
      throw new Error(`Annotation with name '${name}' is not defined`);
    }

    const currentType = this.getTypeOf(value);
    if (currentType !== anno.$Type) {
      throw new Error(`Annotation '${name}' requires type '${anno.$Type}'. Given '${currentType}'`);
    }

    if (!destination) {
      throw new Error(`Parameter 'destination' should be given`);
    }

    if (anno.$AppliesTo.indexOf(destination) === -1) {
      throw new Error(`Annotation '${name}' can not assigned to '${destination}'`);
    }

    if (enumeration && enumeration.indexOf(value) === -1) {
      throw new Error(`Annotation value '${value}' can not be used as '${name}'`);
    } 

    return {
      [`@${name}`]: value
    }
  }

  getTypeOf(value) {
    const type = Array.isArray(value) && value.length > 0 ? typeof value[0] : typeof value;

    return this.getType(type);
  }

  getType(prototype) {
    if (prototype.item) {
      return this.getType(prototype.type);
    }

    switch (prototype) {
      case 'number':
        return 'Edm.Double';

      case 'string':
        return undefined; //Edm.String is default

      case 'boolean':
        return 'Edm.Boolean';

      default:
        throw Error(`Type '${prototype}' is not supported`);
    }
  }
}