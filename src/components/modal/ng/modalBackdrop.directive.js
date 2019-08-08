export class modalBackdrop {
  static getDI () {
    return [
      '$timeout'
    ];
  }

  constructor (...args) {
    this.di = [];
    modalBackdrop.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'EA';
    this.template = require('../templates/backdrop');

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope) {
    scope.animate = true;
  }
}

modalBackdrop.$inject = modalBackdrop.getDI();
modalBackdrop.$$ngIsClass = true;
