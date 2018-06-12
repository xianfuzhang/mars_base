export class tabItem {
  static getDI() {
    return [];
  }
  constructor(...args){
    this.di = {};
    tabItem.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.require = '^mdlTabs';
    this.template = require('../templates/tabItem.html');
    this.scope = {
      model: '=ngModel',
      option: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    scope.select = () => {
      ngModel.select(scope.option);
    };

    scope.$on('$destroy', ()=> {

    });
  }
}

tabItem.$inject = tabItem.getDI();
tabItem.$$ngIsClass = true;