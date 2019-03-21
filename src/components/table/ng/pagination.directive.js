export class tablePagination {
  static getDI () {
    return [
      '$log',
      '$filter',
      '$timeout',
      'tableConsts'
    ];
  }

  constructor(...args) {
    this.di = {};
    tablePagination.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.restrict = 'AE';
    this.replace = true;
    this.require = '^mdlTable';
    this.priority = -1;
    this.template = require('../template/pagination.html');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attrs) {
    scope.displayLabel = {
      options: []
    };
    let options = this.di.tableConsts.CONST.PAGINATION.pageSize;
    options.forEach((value, index) => {
      scope.displayLabel.options.push({'label': value, 'value': value});
    });
    scope.model = {
      'label':this.di.tableConsts.CONST.PAGINATION.defaultPageSize,
      'value':this.di.tableConsts.CONST.PAGINATION.defaultPageSize
    };
    scope.preNumber = scope.model.value;
    scope.numPages = 1;
    scope.currentPage = 1;
    scope.pageStart = 0;
    scope.pageEnd = 0;
    scope.pages = [];

    scope._changeSelect = ($value) => {
      scope.preNumber = scope.model.value;
      scope.model = $value;
      if (!scope._isNeedPagination) {
        scope.tableModel.pagination.number = scope.model.value;
        scope.tableModel.pagination.numberOfPages = scope.tableModel.pagination.totalItemCount === 0 ?
          1 : Math.ceil(scope.tableModel.pagination.totalItemCount / scope.tableModel.pagination.number);
      }
      scope._selectPage(1);
    };

    scope._selectPage = (page) => {
      if (page > 0 && page <= scope.numPages) {
        scope.tableModel.pagination.start = (page - 1) * scope.model.value;
        scope.tableModel.pagination.number = scope.model.value;
        scope.tableModel.removeItems = [];
        if (scope._isNeedPagination) {
          scope._queryUpdate(scope._getTableParams());
        }
        else {
          scope.tableModel.filteredData = scope._clientDataPagination();
          scope.tableModel.filteredData.forEach((item) => {
            item.isChecked = false;
          });
          //当filteredData数据变少时不会触发table-render-ready指令$last === true，需要手动触发
          if (scope.tableModel.pagination.number > scope.preNumber) {
            scope._render();  
          }
          else {
            this.di.$timeout(() =>{
              scope.$emit('table-render-ready');  
            });
          }
        }
      }
    };

    function redraw () {
      let paginationState = scope.tableModel.pagination;
      let start = 1, end;
      let i;
      let count;
      let prevPage = scope.currentPage;
      scope.totalItemCount = paginationState.totalItemCount;
      scope.pageStart = paginationState.start + 1;
      count = scope.pageStart + paginationState.number -1;
      scope.pageEnd = count > paginationState.totalItemCount
        ? paginationState.totalItemCount : count;
      scope.currentPage = Math.floor(paginationState.start / paginationState.number) + 1;

      start = Math.max(start, scope.currentPage - Math.abs(Math.floor(scope.model.value / 2)));
      end = start + scope.model.value;

      if (end > paginationState.numberOfPages) {
        end = paginationState.numberOfPages + 1;
        start = Math.max(1, end - scope.model.value);
      }

      scope.pages = [];
      scope.numPages = paginationState.numberOfPages;

      for (i = start; i < end; i++) {
        scope.pages.push(i);
      }
    }

    //table state --> view
    scope.$watch(function () {
      return scope.tableModel.pagination;
    }, redraw, true);
  }
}

tablePagination.$inject = tablePagination.getDI();
tablePagination.$$ngIsClass = true;