/**
 * Created by wls on 2018/6/7.
 */

export class Menu {
  static getDI () {
    return [
      '$rootScope'
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

    this.scope={
      groupUrl:'=',
      // isMenu: '=',
      isUser: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {

      scope.show = (ele) => {
        scope.menuModel.isAct = true;
      };

      scope.hide = (ele) => {
        scope.menuModel.isAct = false;
      };


      scope.menuModel = {
        // isMenu: scope.isMenu,
        isUser: scope.isUser,
        urls : scope.groupUrl.items,
        groupName: scope.groupUrl.group,
        isAct: false
      };
      if(scope.menuModel.isUser){
        scope.menuModel.groupName = "Nocsys";
      }


    }).call(this);
  }
}

Menu.$inject = Menu.getDI();
Menu.$$ngIsClass = true;
