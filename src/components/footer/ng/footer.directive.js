/**
 * Created by wls on 2018/6/7.
 */

export class Footer {
  static getDI () {
    return [
      '$document'
    ];
  }

  constructor (...args) {
    this.di = [];
    Footer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/footer');
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

Footer.$inject = ['$document'];
Footer.$$ngIsClass = true;
