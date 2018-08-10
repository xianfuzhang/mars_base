export class HealthyCheckController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$filter',
      '$q',
      'appService',
      'configurationDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    HealthyCheckController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');



    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }
}

HealthyCheckController.$inject = HealthyCheckController.getDI();
HealthyCheckController.$$ngIsClass = true;