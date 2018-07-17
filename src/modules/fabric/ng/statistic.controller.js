export class StatisticController {
  static getDI() {
    return [];
  }
  constructor(...args){
    this.di = {};

  }
}

StatisticController.$inject = StatisticController.getDI();
StatisticController.$$ngIsClass = true;