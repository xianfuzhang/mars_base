/**
 * Created by wls on 2018/6/7.
 */

export class Details {
  static getDI () {
    return [
      '$rootScope'
    ];
  }

  constructor (...args) {
    this.di = [];
    Details.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/details');

    this.scope={
      // groupUrl:'=',
      // // isMenu: '=',
      // isUser: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {



    }).call(this);
  }
}

Details.$inject = Details.getDI();
Details.$$ngIsClass = true;
