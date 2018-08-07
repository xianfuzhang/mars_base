/**
 * Created by wls on 2018/6/7.
 */
import {MDCTemporaryDrawer} from '@material/drawer';

export class marHeader {
  static getDI () {
    return [
      '$rootScope',
      'appService'
    ];
  }

  constructor (...args) {
    this.di = [];
    marHeader.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/mar_header');

    this.scope = {
      // headers : '=',
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {

      scope.headers = this.di.appService.CONST.HEADER;

      scope.headerModel = {
        'menu': scope.headers.menu,
        'user': scope.headers.user
      };


      scope.showDrawer = () =>{
        scope.$emit('drawer-redraw',"<div>aaaa</div>");
        let drawer = new MDCTemporaryDrawer(document.querySelector('.mdc-drawer--temporary'));
        drawer.open = true;
      }

    }).call(this);
  }
}

marHeader.$inject = marHeader.getDI();
marHeader.$$ngIsClass = true;
