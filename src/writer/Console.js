export default class Console {
  constructor(settings) {
    const logLevel = settings && settings.logLevel || process.env.LOG_LEVEL || 'error';

    switch (logLevel) {
      case 'debug':
        this.logLevel = 40;
        break;

      case 'info':
        this.logLevel = 30;
        break;

      case 'warning':
        this.logLevel = 20;
        break;

      case 'error':
        this.logLevel = 10;
        break;

      default:
        if (logLevel) {
          console.error(`Unsupported log level ${logLevel}`);
        }
        this.logLevel = 10;
        break;
    }

    this.namespace = settings && settings.namespace || 'node.odata';
  }

  debug(msg) {
    if (this.logLevel < 40) {
      return;
    }

    console.debug(`[${new Date().toUTCString()}] ${this.namespace ? this.namespace : ''}: ${msg}`);
  }

  log(obj) {
    if (this.logLevel < 40) {
      return;
    }

    console.log(obj);
  }
}