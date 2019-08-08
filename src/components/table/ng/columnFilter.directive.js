export class columnFilter {
  static getDI() {
     return [
       '$filter',
       '$templateCache',
       '$compile',
       '$rootScope',
       '$timeout'
     ];
  }
  constructor(...args){
    this.di = {};
    columnFilter.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/columnFilter.html');
    this.scope = {
      tableSize: '=',
      columns: '=',
      onFilterAction: '&'
    };
    this.link = (...args) => this._link.apply(this, args);
  }
  _link(scope, element, attrs, ngModel) {
    scope.collections = [];
    scope.compareFields = [
      {
        'label': this.di.$filter('translate')('MODULES.TABLE.COLUMN.CONTAIN'),
        'value': 'contains'
      },
      {
        'label': this.di.$filter('translate')('MODULES.TABLE.COLUMN.EQUAL'),
        'value': 'equals'
      }
    ];
    scope.show = false;
    const MAX_COLLECTIONS = 3;
    let created = false;
    let updateColumnFields = () => {
      scope.columnFields = [];
      for (let key in scope.columns) {
        if (scope.columns[key]['visible']  && !scope.columns[key]['hidden']) {
          scope.columnFields.push({
            'label': scope.columns[key]['def']['label'],
            'value': key
          });
        }
      }
    };
    let onClickHideDetail = (event) => {
      const fieldElm = document.body.querySelector('.columns-field');
      if (!fieldElm || fieldElm.contains(event.target) || event.target === fieldElm) {
        return;
      }
      scope.show = false;
      event.stopPropagation();
    };

    scope._showHideDetail = (event) => {
      if (!created) {
        let menuHtml = this.di.$templateCache.get('columns-filter-list.html');
        let menuElement = this.di.$compile(menuHtml)(scope);
        document.body.appendChild(menuElement[0]);

        menuElement.css({
          position: 'absolute',
          left: (event.clientX - 12) + 'px',
          top: (event.clientY + 24) + 'px'
        });  
      }
      created = true;
      scope.show = !scope.show;
      event.stopPropagation();
    };

    scope._addCollection = (event) => {
      if (scope.collections.length < MAX_COLLECTIONS) {
        scope.collections.push({
          column: scope.columnFields[0],
          compare: scope.compareFields[0],
          value: ''
        });
      }
    };

    scope._removeCollection = (index) => {
      scope.collections.splice(index, 1);
    };

    scope._cancel = (event) => {
      scope.collections = [];
      scope.show = false;
    };

    scope._result = (event) => {
      scope.show = false;
      if (scope.collections.length > 0) {
        let result = [], display = [];
        scope.collections.forEach((item) => {
          display.push(item.column.label + ':' + (item.compare.value === 'contains' ? ' ' : '=') + item.value);
          result.push([item.column.value, item.compare.value, item.value]);
        });
        this.di.$timeout(() => {
          scope.onFilterAction = scope.onFilterAction || angular.noop;
          scope.onFilterAction({'$value': {display: display,result: result}});
          scope.collections = [];
        });
      }
    };

    updateColumnFields();
    
    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('table-show-hide-columns', (event) => {
      //columns显示发生变更，数据需要同步更新
      updateColumnFields();
      let columnsElm = document.body.querySelector('.columns-field');
      if (columnsElm) {
        columnsElm.remove();
        created = false;
      }
    }));
    document.body.addEventListener('click', onClickHideDetail);
    scope.$on('$destroy', () => {
      document.body.removeEventListener('click', onClickHideDetail);
      let columnsElm = document.body.querySelector('.columns-field');
      if (columnsElm) {
        columnsElm.remove();
        created = false;
      }
      unsubscribers.forEach(cb => cb());
    });
  }
}
columnFilter.$inject = columnFilter.getDI();
columnFilter.$$ngIsClass = true;