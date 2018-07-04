
export class marDrawer{

  static getDI () {
    return [
      '$rootScope',
      '$log'
    ];
  }

  constructor (...args) {
    this.di = [];
    marDrawer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/mar_drawer');

    this.scope = {
      isRight : '=',
      content:'='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init() {
      let ele =
      scope.drawerModel = {
        isRight: scope.isRight,
      };


      let unsubscribers = [];
      unsubscribers.push(this.di.$rootScope.$on('drawer-redraw',(event, data)=>{
        angular.noop(event);
        // scope.drawerModel.content = data;
        // let aa = element.find('.mdc-drawer__drawer');
        angular.element(element[0].children[0]).empty();
        angular.element(element[0].children[0]).append(data)

      }));

      scope.$on('$destroy', () => {
        this.di._.each(unsubscribers, (unsubscribe) => {
          unsubscribe();
        });
        // element[0].removeEventListener('click', clickEvent);
        // angular.element(this.di.$window).unbind('resize', onResize);
        this.di.$log.info(this.__NAME__, 'Destroyed');
      });

    }).call(this);
  }
}


marDrawer.$inject = marDrawer.getDI();
marDrawer.$$ngIsClass = true;