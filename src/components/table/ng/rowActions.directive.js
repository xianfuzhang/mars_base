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
       let nodes = document.getElementsByClassName('table-row-action-list');
       for(let i=0; i< nodes.length; i++) {
         document.body.removeChild(nodes[i]);
       }
      }
    };
    document.body.addEventListener('click', onTriggerClickRemove, true);

    let calculatePosition = (event, menuElement) => {
      let windowInnerWidth = this.di.$window.document.body.scrollWidth,
        windowInnerHeight = this.di.$window.document.body.scrollHeight;
      let menuHeight = scope.actions.length ? scope.actions.length * 35 + 16 : 0;
      let topPosition = event.clientY, leftPosition = event.clientX;
      if (topPosition + menuHeight > windowInnerHeight) {
        topPosition = event.clientY - menuHeight;
      }
      return {
        top: topPosition,
        left: leftPosition
      };
    };

    let insertMenuList = (event) => {
      let menuHtml = this.di.$templateCache.get('table-row-action-list.html');
      let menuElement = this.di.$compile(menuHtml)(scope);
      document.body.appendChild(menuElement[0]);
      let position = calculatePosition(event, menuElement);
      menuElement.css({
        position: 'absolute',
        left: position.left + 'px',
        top: position.top + 'px',
        display: 'block',
        opacity: 1
      });
    };

    scope._menuToggle = (event) => {
      //menuElement.toggleClass('mdc-menu--open');
      scope.actions =  ctrl.rowActionsFilter(scope.data, scope.actionItems);
      if (scope.actions.length > 0) {
        insertMenuList(event);
        event && event.stopPropagation();  
      }
    };

    scope.clickItem = (item, event) => {
      ctrl.rowSelectAction(scope.data, item);
      event && event.stopPropagation();
    };

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