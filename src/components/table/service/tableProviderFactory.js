export class tableProviderFactory {
  static getDI () {
    return [
      'tableProvider',
      '$q'
    ];
  }

  constructor (...args) {
    this.di = [];
    tableProviderFactory.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  createProvider (spec) {
    let createProviderObj = this.di.tableProvider.getProvider(this.di.$q, spec);
    return createProviderObj;
  };
}

tableProviderFactory.$inject = tableProviderFactory.getDI();
tableProviderFactory.$$ngIsClass = true;
