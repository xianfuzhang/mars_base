export class tableConsts {
  static getDI() {
    return [
    ];
  }

  constructor(...args) {
    this.di = [];
    tableConsts.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    this.CONST = {

      SORT_ASC: 1,
      SORT_DESC: 2,
      SORT_UNDEFINED: 3,
      GROUP_UNCLASSIFIED: 'unclassified',

      PAGINATION: {
        pageSize: [10, 20, 50],        //每页显示多少项
        displayedPages: 5,             //显示页数
        defaultPageSize: 10
      },

      // provider
      EVENT_PROVIDER_READY: 'metatable.event.provider_ready',

      // columns
      EVENT_PREPARE_COLUMNS: 'metatable.event.prepare_columns',

      EVENT_COLUMNS_VISIBILITY: 'metatable.event.columns_visibility',
      EVENT_FILTERS: 'metatable.event.filters',
      EVENT_SORT: 'metatable.event.sort',

      // data
      EVENT_DATA_SUCCESS: 'metatable.event.data_success',
      EVENT_DATA_FAIL: 'metatable.event.data_fail'
    };

    this.CONST.SORT_OPTIONS = [
      this.CONST.SORT_ASC,
      this.CONST.SORT_DESC,
      this.CONST.SORT_UNDEFINED
    ];
  }
}

tableConsts.$inject = tableConsts.getDI();
tableConsts.$$ngIsClass = true;
