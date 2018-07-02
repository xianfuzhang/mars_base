export class rowActions {
  static getDI () {
    return ['$log', '$window'];
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
      actionItems: '='
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attrs, ctrl) {
    let document = this.di.$window.document;
    let buttonElement = element.children().eq(0).children().eq(0);
    let menuElement = element.children().eq(0).children().eq(1);

    let onTriggerClickHide = (event) => {
      if (event.target === buttonElement[0]) {
        return;
      }
      else {
        if (menuElement[0].classList.contains('mdc-menu--open')) {
          menuElement[0].classList.remove('mdc-menu--open');
        }
      }
    };
    document.body.addEventListener('click', onTriggerClickHide, true);

    scope._menuToggle = (event) => {
      menuElement.toggleClass('mdc-menu--open');
      event && event.stopPropagation();
    };

    scope.clickItem = (item, event) => {
      ctrl.rowSelectAction(scope.data, item);
      event && event.stopPropagation();
    };

    scope.$on('$destroy', ()=> {
      document.body.removeEventListener('click', onTriggerClickHide);
    });
  }
}

rowActions.$inject = rowActions.getDI();
rowActions.$$ngIsClass = true;