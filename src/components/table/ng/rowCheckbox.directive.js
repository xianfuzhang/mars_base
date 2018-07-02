export class rowCheckbox {
  static getDI () {
    return ['$rootScope', '$log'];
  }

  constructor(...args) {
    this.di = {};
    rowCheckbox.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.restrict = 'A';
    this.require = '^mdlTable';
    this.scope = {
      data: '='
    }
    this.template = require('../template/rowCheckbox.html');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attrs, ctrl) {
    scope._clicked = (event) => {
      let action = event.target.checked ? 'add' : 'remove';
      ctrl.select(scope.data, action);
      event.stopPropagation();
    }

    this.di.$rootScope.$on('checkbox-select-all', (event, data) => {
      element.find('input')[0].checked = data.checked || false;
    });

    this.di.$rootScope.$on('pagination-checkbox-unselect', (event) => {
      element.find('input')[0].checked = false;
    });
  }
}

rowCheckbox.$inject = rowCheckbox.getDI();
rowCheckbox.$$ngIsClass = true;