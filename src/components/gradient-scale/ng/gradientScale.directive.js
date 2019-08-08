export class gradientScale {
  static getDI () {
    return [];
  }

  constructor (...args) {
    this.di = [];
    gradientScale.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/gradientScale');
    this.scope = {
      currentValue: '=?',
      colorGradient: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attr) {
    const WIDTH = 150, HEIGHT = 20;
    scope.min_value = attr.minValue || 0;
    scope.max_value = attr.maxValue || 100;
    scope.currentValue = scope.currentValue || '0';
  }
}

gradientScale.$inject = gradientScale.getDI();
gradientScale.$$ngIsClass = true;