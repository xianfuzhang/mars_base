/**
 * Created by wls on 2018/6/7.
 */
import {MDCTemporaryDrawer} from '@material/drawer';

export class marHeader {
  static getDI () {
    return [
      '$rootScope'
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
      headers : '=',
      // headerModel : '=headers'
    },
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      // this.scope.headerModel = {
      //   'menuStaticUrl':{
      //     'fabric':[
      //       {'label':'HEADER.SWITCH', 'url':'switch'},
      //       {'label':'HEADER.INTERFACE', 'url':'interface'}
      //     ],
      //     'logical': [
      //       {'label':'HEADER.TENANT', 'url':'tenant'},
      //       {'label':'HEADER.SEGMENT', 'url':'segment'}
      //     ]
      //   }
      // }

      //   menuStaticUrl = {
      //   'fabric':[
      //     {'label':'HEADER.SWITCH', 'url':'switch'},
      //     {'label':'HEADER.INTERFACE', 'url':'interface'}
      //   ],
      //   'logical': [
      //     {'label':'HEADER.TENANT', 'url':'tenant'},
      //     {'label':'HEADER.SEGMENT', 'url':'segment'}
      //   ]
      // }
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
