export class NavController {
  static getDI() {
    return [
      '$location',
      'navService'
    ];
  }

  constructor(...args) {
    this.di = {};
    NavController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.model = {
      menus: this.di.navService.getNavigationLinks()
    };
  }

  location(path) {
    this.di.$location.path(path);
  }
}

NavController.$inject = NavController.getDI();
NavController.$$ngIsClass = true;

