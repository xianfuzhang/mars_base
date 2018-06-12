export class mdlTabs {
  static getDI() {
    return ['$filter'];
  }
  constructor(...args){
    this.di = {};
    mdlTabs.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.controller = 'TabsController';
    this.template = require('../templates/tabs.html');
    this.scope = {
      model: '=ngModel',
      data: '=options',
      onSelect: '&'
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    var unsubscribers = [];

    scope.prepareOptions = (data) => {
      var options = angular.copy(data);
      if (data === undefined) {
        scope.options = [];
        return;
      }
      if (attrs.orderBy) {
        scope.options = this.di.$filter('orderBy')(options, attrs.orderBy);
      } else {
        scope.options = options;
      }
    };

    unsubscribers.push(scope.$watch('data', (options) => {
      scope.prepareOptions(options);
    }, true));

    scope.$on('$destroy', ()=> {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}

mdlTabs.$inject = mdlTabs.getDI();
mdlTabs.$$ngIsClass = true;