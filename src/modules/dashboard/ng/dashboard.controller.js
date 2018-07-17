export class DashboardController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$q',
      'appService'
    ];
  }

  constructor(...args) {
    this.di = {};
    DashboardController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.di.$scope.dashboardModel = {
      headers: this.di.appService.CONST.HEADER,
    }

  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

