export class genericFactoryRegistryService {
  static getDI() {
    return [
      '_',
      'genericFactoryRegistry'
    ];
  }

  constructor(...args) {
    this.di = [];
    genericFactoryRegistryService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  /**
   * @description Returns Factory object
   */

  createFactory () {
    return this.di.genericFactoryRegistry.createGenericFactory(this.di._);
  };
}

genericFactoryRegistryService.$inject = genericFactoryRegistryService.getDI();
genericFactoryRegistryService.$$ngIsClass = true;
