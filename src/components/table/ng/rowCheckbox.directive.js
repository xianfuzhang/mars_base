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
      data: '=',
      size: '='
    }
    this.template = require('../template/rowCheckbox.html');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attrs, ctrl) {
    let size = scope.size || 'normal';
    element.find('input')[0].checked = scope.data.isChecked ? true : false;
    let unsubscribers = [];
    scope._clicked = (event) => {
      let action = event.target.checked ? 'add' : 'remove';
      scope.data.isChecked = event.target.checked ? true : false;
      ctrl.select(scope.data, action);
      event.stopPropagation();
    }

    /*unsubscribers.push(this.di.$rootScope.$on('checkbox-select-all', (event, data) => {
      element.find('input')[0].checked = data.checked || false;
    }));*/

    /*unsubscribers.push(this.di.$rootScope.$on('pagination-checkbox-unselect', (event) => {
      element.find('input')[0].checked = false;
    }));*/

    unsubscribers.push(this.di.$rootScope.$on('batch-delete-endpoints', (event) => {
      if (element.find('input')[0].checked) {
        element.find('input')[0].checked = false;
      }
    }));

    scope.$watch('data.isChecked', () => {
      element.find('input')[0].checked = scope.data.isChecked ? true : false;
    }, true);

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}

rowCheckbox.$inject = rowCheckbox.getDI();
rowCheckbox.$$ngIsClass = true;