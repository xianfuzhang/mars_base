/**
 * Created by wls on 2018/6/7.
 */

export class Header {
  static getDI () {
    return [
      '$document'
    ];
  }

  constructor (...args) {
    this.di = [];
    Header.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/header');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      // var el = element[0];
      // scope.show = () => {
      //   element.addClass('act');
      //   // var eles = document.getElementsByClassName('sign-in');
      //   // for(let i = 0 ; i < eles.length; i++){
      //   //   let ele = eles[i];
      //   //   ele.className += ' act';
      //   // }
      // };
      //
      // scope.hide = () => {
      //   element.removeClass('act');
      // };
    }).call(this);
  }
}

Header.$injector = ['$document'];
Header.$$ngIsClass = true;
