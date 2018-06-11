/**
 * Created by wls on 2018/6/7.
 */

export class Menu {
  static getDI () {
    return [
      '$document'
    ];
  }

  constructor (...args) {
    this.di = [];
    Menu.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/menu');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      var el = element[0];
      scope.show = () => {
        element.addClass('act');
        // var eles = document.getElementsByClassName('sign-in');
        // for(let i = 0 ; i < eles.length; i++){
        //   let ele = eles[i];
        //   ele.className += ' act';
        // }
      };

      scope.hide = () => {
        element.removeClass('act');
      };
    }).call(this);
  }
}

Menu.$injector = ['$document'];
Menu.$$ngIsClass = true;
