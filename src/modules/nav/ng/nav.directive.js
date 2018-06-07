export class Nav {
  static getDI() {
    return [
      '$location',
      'navService'
    ];
  }
  constructor(...args) {
    this.di = {};
    Nav.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.controller = 'NavController';
    this.template = require('../template/nav.html');
    this.scope = {
      menus: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope) {
    scope.model = {
      menus: this.di.navService.getNavigationLinks()
    };
    scope.location =  (path) => {
      this.di.$location.path(path);
    }
  }
}

Nav.$inject = Nav.getDI();
Nav.$$ngIsClass = true;