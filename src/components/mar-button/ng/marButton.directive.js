/**
 * Created by wls on 2018/6/7.
 */

export class MarButton {
  static getDI () {
    return [
      '$compile',
      '$filter'
    ];
  }

  constructor (...args) {
    this.di = [];
    MarButton.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/mar-button.html');
    this.scope = {
      btnId: '=',
      btnText: '=',
      btnClass: '=',
      btnIcon: '=',
      btnType: '=',
      btnStyle: '=',
      btnTextClass: '=',
      btnIconClass: '=',
      btnClick: '&',
      btnDisabled: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope) {
    let unsubscribers = [];
    
    scope.disabled = scope.disabled === true ? true : false;
    (function init () {
      
      scope.$on('$destroy', () => {
        unsubscribers.forEach((cb) => {
          cb();
        });
      });
    }).call(this);
  }
}

MarButton.$inject = MarButton.getDI();
MarButton.$$ngIsClass = true;
