export class TableAction {
  static getDI() {
    return ['$log', '$window'];
  }

  constructor(...args){
    this.di = {};
    TableAction.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.require = '^mdlTable';
    this.template = require('../template/tableActions.html');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, tableCtrl) {
    scope.menuShow = scope.actionsShow && scope.actionsShow.menu || false;
    scope.addShow = scope.actionsShow && scope.actionsShow.add || false;
    scope.removeShow = scope.actionsShow && scope.actionsShow.remove || false;
    scope.refreshShow = scope.actionsShow && scope.actionsShow.refresh || false;

    let document = this.di.$window.document;
    let onTriggerClickHide = (event) => {
      if (!event.target.matches('.search-filter-button')) {
        let menu = document.getElementsByClassName("search-filter-list");
        for(let i=0; i < menu.length; i++) {
          if (menu[i].classList.contains('mdc-menu--open')) {
            menu[i].classList.remove('mdc-menu--open');
          }
        }
      }
    };
    document.body.addEventListener('click', onTriggerClickHide, true);
    scope.$watch('tableModel.columns', () => {
      scope.filterItems = [];

      scope.tableModel.columns.forEach((column, index) => {
        scope.filterItems.push({
          'label': column.def.label,
          'value': column.field,
          'name': "filter_name",
          'id': "filter_"+ index,
          'checked': index === 0 ? true : false
        });
      });
      if (scope.filterItems.length) {
        scope.filterName = scope.filterItems[0].value;
        //scope._updateCheckboxState();
      }
    }, true);

   /* scope._search = () => {
      scope.tableModel.search[scope.filterName] = scope.search;
      scope._queryUpdate(scope._getTableParams());
    };
    scope._clearSearch = (event) => {
      scope.search='';
      scope.tableModel.search[scope.filterName] = scope.search;
      scope._queryUpdate(scope._getTableParams());
      event && event.stopPropagation();
    };*/
    scope._menuToggle = (event) => {
      if (event.target) {
        let menu = document.getElementsByClassName("search-filter-list");
        for(let i=0; i < menu.length; i++) {
          if (menu[i].classList.contains('mdc-menu--open')) {
            menu[i].classList.remove('mdc-menu--open');
          }
          else {
            menu[i].classList.add('mdc-menu--open');
          }
        }
        event.stopPropagation();
      }
    };

    scope._select = (item, event) => {
      if (event.target) {
        scope.tableModel.search = {};
        scope.filterName = item.value;
        scope.tableModel.search[scope.filterName] = scope.search;
        scope._queryUpdate(scope._getTableParams());
        event.stopPropagation();
      }
    };

    scope.$on('$destroy', ()=> {
      document.body.removeEventListener('click', onTriggerClickHide);
    });
  }
}

TableAction.$inject = TableAction.getDI();
TableAction.$$ngIsClass = true;