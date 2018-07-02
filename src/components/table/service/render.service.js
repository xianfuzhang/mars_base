export class renderService {
  static getDI() {
    return [
      'genericFactoryRegistryService'
    ];
  }

  constructor(...args) {
    this.di = [];
    renderService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  render () {
    let service = this.di.genericFactoryRegistryService.createFactory();
    service.CONST_TYPE_HTML = 's';
    service.CONST_TYPE_TEXT = 't';
    service.CONST_TYPE_DOM = 'd';
    service.CONST_TYPE_INCLUDE = 'i';

    return service;
  };
}

renderService.$inject = renderService.getDI();
renderService.$$ngIsClass = true;
