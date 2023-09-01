export default class Vocabulary {
  constructor() {
    this.terms = {};
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
    if (this.terms[name]) {
      throw new Error(`Annotation with name '${name}' is allready defined`);
    }

    const type = this.getType(prototype);
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
      $AppliesTo: scope && scope.length ? scope : supportedTargets,
      $Type: type
    };
  }

  annotate(name, destination, value) {
    const anno = this.terms[name];

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

    return {
      [`@${name}`]: value
    }
  }

  getTypeOf(value) {
    const type = typeof value;

    switch (type) {
      case 'number':
        return 'Edm.Double';

      case 'string':
        return 'Edm.String';

      case 'boolean':
        return 'Edm.Boolean';

      default:
        throw Error(`type of value '${value}' is not supported`);
    }
  }

  getType(prototype) {
    switch (prototype) {
      case Number:
        return 'Edm.Double';

      case String:
        return 'Edm.String';

      case Boolean:
        return 'Edm.Boolean';

      default:
        throw Error(`Type '${prototype}' is not supported`);
    }
  }
}