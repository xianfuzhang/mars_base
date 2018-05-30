export class Nav {
  static getDI() {
    return [];
  }
  constructor(...args) {
    this.di = {};
    Nav.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/nav.html');
    this.scope = {};
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope) {

  }
}

Nav.$inject = Nav.getDI();
Nav.$$ngIsClass = true;