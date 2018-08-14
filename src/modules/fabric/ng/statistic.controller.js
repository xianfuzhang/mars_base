export class StatisticController {
  static getDI() {
    return ['$log'];
  }
  constructor(...args){
    this.di = {};
    StatisticController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.di.$log.info('statistic controller func.');
  }
}

StatisticController.$inject = StatisticController.getDI();
StatisticController.$$ngIsClass = true;