export class rowActions {
  static getDI () {
    return [
      '$log',
      '$rootScope',
      '$window',
      '$compile',
      '$templateCache'
    ];
  }

  constructor(...args) {
    this.di = {};
    rowActions.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.restrict = 'A';
    this.require = '^mdlTable';
    this.template = require('../template/rowActions.html');
    this.scope = {
      data: '=',
      size: '=',
      actionItems: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attrs, ctrl) {
    let unsubscribers = [];
    scope.size = scope.size || 'normal';
    scope.actions =  ctrl.rowActionsFilter(scope.data, scope.actionItems);
    let document = this.di.$window.document;
    let buttonElement = element.children().eq(0).children().eq(0);
    let menuElement = element.children().eq(0).children().eq(1);

    let onTriggerClickRemove = (event) => {
      if (event.target === buttonElement[0]) {
        return;
      }
      else {
       /* if (menuElement[0].classList.contains('mdc-menu--open')) {
          menuElement[0].classList.remove('mdc-menu--open');
        }*/
       let nodes = document.getElementsByClassName('table-row-action-list');
       for(let i=0; i< nodes.length; i++) {
         document.body.removeChild(nodes[i]);
       }
      }
    };
    document.body.addEventListener('click', onTriggerClickRemove, true);

    let insertMenuList = (event) => {
      let menuHtml = this.di.$templateCache.get('table-row-action-list.html');
      let menuElement = this.di.$compile(menuHtml)(scope);
      menuElement.css({
        position: 'absolute',
        left: event.clientX + 'px',
        top: event.clientY + 'px',
        display: 'block',
        opacity: 1
      });
      document.body.appendChild(menuElement[0]);
    };

    scope._menuToggle = (event) => {
      //menuElement.toggleClass('mdc-menu--open');
      if (scope.actions.length > 0) {
        insertMenuList(event);
        event && event.stopPropagation();  
      }
    };

    scope.clickItem = (item, event) => {
      ctrl.rowSelectAction(scope.data, item);
      event && event.stopPropagation();
    };

    unsubscribers.push(this.di.$rootScope.$on('change-device-port-state', ($event, param) => {
      if (scope.data.element === param.data.element && scope.data.port_id === param.data.port_id) {
        scope.actions =  ctrl.rowActionsFilter(param.data, scope.actionItems);
      }
    }));
    scope.$on('$destroy', ()=> {
     document.body.removeEventListener('click', onTriggerClickRemove);
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}

rowActions.$inject = rowActions.getDI();
rowActions.$$ngIsClass = true;