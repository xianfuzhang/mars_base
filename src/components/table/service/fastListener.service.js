export class fastListenerService {
  static getDI() {
    return [
      '_'
    ];
  }

  static instance (...args) {
    return new fastListenerService(args);
  }

  constructor(...args) {
    this.di = [];
    fastListenerService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    let _id = 0;
    let nextId = () => {
      _id += 1;
      return _id;
    };
    let reg = {};

    this.addEventListener = (type, handler) => {
      let id = nextId(); let typeReg = reg[type];

      if (!typeReg) {
        typeReg = reg[type] = {};
      }
      typeReg[id] = handler;

      return id;
    };
    this.removeEventListener = (type, id) => {
      let typeReg = reg[type];

      if (typeReg) {
        delete typeReg[id];
      }
    };

    this.notify = (type, data) => {
      let handlers = reg[type];

      if (handlers) {
        this.di._.each(handlers, (handler) => {
          handler(type, data);
        });
      }
    };
  }

  createInstance (_) {
    return new fastListenerService(_);
  };
}

fastListenerService.instance.$inject = fastListenerService.getDI();
fastListenerService.$$ngIsClass = true;
