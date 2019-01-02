export class mdlTable {
  static getDI() {
    return [
      '$log',
      //'$window',
      '$filter',
      '$timeout',
      '_',
      'tableConsts',
      'renderService',
      'fastListenerService',
      'textRendererFactory',
      'clickableTextRendererFactory',
      'popupTextRendererFactory',
      'iconRendererFactory'
    ];
  }

  constructor(...args){
    this.di = {};
    mdlTable.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.controller = 'TableController';
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/table.html');
    this.scope = {
      actionsShow: '=', //是否显示相应action，默认都隐藏
      actions: '=',     //row actions
      provider: '=',
      apiReady: '&',
      rowClick: '&',
      onAdd: '&',
      onRemove: '&',
      rowActionsFilter: '&',
      rowSelectAction: '&',
      needPagination : "@"
    }
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, tableCtrl) {
    let renders =  [];
    scope.placeholder = this.di.$filter('translate')('MODULES.TABLE.SEARCH.PLACEHOLDER');
    scope.renderService = this.di.renderService.render();
    scope.log = this.di.$log;
    scope.tableSize = attrs.tableSize || 'normal';

    scope._isNeedPagination = scope.needPagination || false;

    scope.tableModel = {
      'CONST_SORT_ASC': this.di.tableConsts.CONST.SORT_ASC,
      'CONST_SORT_DESC': this.di.tableConsts.CONST.SORT_DESC,
      'CONST_SORT_UNDEFINED': this.di.tableConsts.CONST.SORT_UNDEFINED,

      listeners: this.di.fastListenerService.createInstance(this.di._), //通知row service render table

      //dataTimeout: null,
      schema: [],
      rowActionsSupport: false,
      rowCheckboxSupport: false,
      //rowActions: [],
      data: [],
      filteredData: [],

      index_name: null,
      selectedRowId: null,
      removeItems: [],

      columns: [],
      columnsByField: {},

      loading: true,

      //sortByField: {},
      pagination: {
        numberOfPages: 1,              //总页数
        //pageSize: [10, 20, 50],        //每页显示多少项
        //currentPage: 1,                //当前页
        totalItemCount: 0,             //数据总数
        //displayedPages: 5,             //显示页数
        start: 0,
        number: 10
      },
      sort: {},
      search: {},
      searchResult: '',
      api: {}
    };
    /*****************************************************************************
     browser events
     *****************************************************************************/
    scope._preventDefault = ($event) => {
      if ($event && $event.preventDefault) {
        $event.preventDefault();
      }
    };

    scope._stopPropagation = function ($event) {
      if ($event && $event.stopPropagation) {
        $event.stopPropagation();
      }
    };

    scope._onHeaderClick = ($col, $event) => {
      scope._preventDefault($event);
      if (!$col.sortable) {
        return;
      }
      // 默认不需要后台分页，分页的场景较少。如果需要分页，需要添加配置
      if(scope._isNeedPagination === false ||  scope._isNeedPagination === 'false'){
        scope._inlineOrder($col);
      }
      else {
        scope._sort($col);  
      }
      scope._render();
    };

    scope._inlineOrder = ($col) =>{
      this.di._.each(scope.tableModel.columns, (col) => {
        if (col.field !== $col.field) {
          col.sort = scope.tableModel.CONST_SORT_UNDEFINED;
        }
      });
      $col.sort = $col.sort === scope.tableModel.CONST_SORT_ASC
        ? scope.tableModel.CONST_SORT_DESC : scope.tableModel.CONST_SORT_ASC;
      scope.tableModel.sort = {};
      scope.tableModel.sort[$col.field] = $col.sort;

      let orderStr = 'asc';
      if($col.sort === scope.tableModel.CONST_SORT_DESC){
        orderStr = 'desc';
      }
      scope.tableModel.data = this.di._.orderBy(scope.tableModel.data,[$col.field],[orderStr]);
      scope.tableModel.filteredData = scope.tableModel.data;

    };

    scope._sort = ($col) => {
      this.di._.each(scope.tableModel.columns, (col) => {
        if (col.field !== $col.field) {
          col.sort = scope.tableModel.CONST_SORT_UNDEFINED;
        }
      });
      $col.sort = $col.sort === scope.tableModel.CONST_SORT_ASC
        ? scope.tableModel.CONST_SORT_DESC : scope.tableModel.CONST_SORT_ASC;
      scope.tableModel.sort = {};
      scope.tableModel.sort[$col.field] = $col.sort;
      //scope.tableModel.pagination.currentPage = 1;

      scope._queryUpdate();
    };

    scope._isColumnDisplayable = (col) => {
      return col.visible && !col.hidden;
    };

    scope._getColumnSortMode = ($col) => {
      return $col.sort || scope.tableModel.CONST_SORT_UNDEFINED;
    };

    scope._getColumnWidth = ($col) => {
      if($col.width){
        return {"width":$col.width}
      } else {
        return {};
      }
    };

    scope._isSelected = function (rowId) {
      return scope.tableModel.selectedRowId && scope.tableModel.selectedRowId === rowId;
    };

    scope._setSelected = function (rowId) {
      scope.tableModel.selectedRowId = rowId;
    };

    scope._onRowClick = ($data, $index, $event) => {
      scope._setSelected($index);
      scope._stopPropagation($event);
      scope.rowClick({$event: {
        cancel: false,
        $data: $data
      }});
    };

    scope._selectAll = (event) => {
      for(var i=0; i < scope.tableModel.data.length;  i++) {
        let index = scope.tableModel.removeItems.indexOf(scope.tableModel.data[i]);
        if (event.target.checked && index === -1) {
          scope.tableModel.removeItems.push(scope.tableModel.data[i]);
        }
        if (!event.target.checked && index !== -1) {
          scope.tableModel.removeItems.splice(index, 1);
        }
      }
      scope.$emit('checkbox-select-all', {'checked': event.target.checked});
    };

    scope._isSelectedAll = () => {
      if (scope.tableModel.data.length === 0) return false;
      for(var i=0; i < scope.tableModel.data.length;  i++) {
        if (scope.tableModel.removeItems.indexOf(scope.tableModel.data[i]) === -1) {
          return false;
        }
      }
      return true;
    };

    scope._menu = ($event) => {
      tableCtrl.onMenu();
    };
    scope._add = ($event) => {
      scope.onAdd = scope.onAdd || angular.noop;
      scope.onAdd();
    };
    scope._remove = (event) => {
      scope.onRemove = scope.onRemove || angular.noop;
      let removes = this.di._.cloneDeep(scope.tableModel.removeItems);
      for(let i=0; i< removes.length; i++) {
        let item = this.di._.find(scope.tableModel.filteredData, removes[i]);
        if(!item) {
          scope.tableModel.removeItems.splice(this.di._.findIndex(scope.tableModel.removeItems, removes[i]), 1);
        }
      }
      if (scope.tableModel.removeItems.length) {
        scope.onRemove({$value: scope.tableModel.removeItems});
      }
      scope.tableModel.removeItems = [];
      event && event.stopPropagation();
    };
    scope._refresh = (event) => {
      scope._queryUpdate();
      event && event.stopPropagation();
    };
    scope._search = () => {
      scope.tableModel.pagination.start = 0;
      scope.tableModel.search['value'] = scope.tableModel.searchResult;
      if (scope._isNeedPagination === false ||  scope._isNeedPagination === 'false') {
        scope.inlineFilter();
        scope._render();
      }
      else {
        scope._queryUpdate();
      }
    };
    scope._clearSearch = (event) => {
      scope.tableModel.searchResult = '';
      scope.tableModel.search['value'] = scope.tableModel.searchResult;
      if (scope._isNeedPagination === false ||  scope._isNeedPagination === 'false') {
        scope.inlineFilter();
        scope._render();
      }
      else {
        scope._queryUpdate();
      }
      event && event.stopPropagation();
    };

    scope.inlineFilter = () => {
      if (!scope.tableModel.search['value']) {
        scope.tableModel.filteredData = scope.tableModel.data;
      }
      else {
        let reg = new RegExp(scope.tableModel.search['value'], 'i');
        scope.tableModel.filteredData = scope.tableModel.data.filter((item) => {
          let match = false;
          for(let key in item) {
            if (reg.test(item[key])) {
              match = true;
              break;
            }  
          }
          return match;
        });
      }
    };
    /*scope._filter = (event) => {
      tableCtrl.onFilter();
    };*/

    /*****************************************************************************
     data handle
     *****************************************************************************/

    //table支持的renders都需要注册到factoryRegistry中
    scope._OnRegistryToRenders = () => {
      //let registry = scope._getRendererService();
      scope.renderService.register('text', this.di.textRendererFactory);
      scope.renderService.register('clickabletext', this.di.clickableTextRendererFactory);
      scope.renderService.register('popuptext', this.di.popupTextRendererFactory);
      scope.renderService.register('icon', this.di.iconRendererFactory);
    };

    scope._onDataSuccess = (response) => {
      response = response || {};
      scope.tableModel.data = response.data || [];

      scope.tableModel.pagination.totalItemCount = response.count || 0;
      scope.tableModel.pagination.numberOfPages = response.count === 0 ?
        1 : Math.ceil(response.count / scope.tableModel.pagination.number);

      //scope._prepareFilteredData();
      scope.tableModel.filteredData = scope.tableModel.data;

      //scope.onDataReady();
      scope._render();
    };

    scope._onDataError = () => {
      scope.tableModel.data = [];
      //scope.onDataReady();
      scope._render();
    };

    scope.onTableHeaderInit = () => {
      renders = [];
      //scope.tableModel.columns = [];
      //scope.tableModel.columnsByField = {};
      scope.tableModel.index_name = scope.provider.getSchema().index_name || 'id';
      scope.tableModel.schema = scope.provider.getSchema().schema || [];
      scope.tableModel.rowCheckboxSupport = scope.provider.getSchema().rowCheckboxSupport;
      scope.tableModel.rowActionsSupport = scope.provider.getSchema().rowActionsSupport;
      scope.tableModel.authManageSupport = scope.provider.getSchema().authManage && scope.provider.getSchema().authManage.support || false;
      scope.tableModel.currentRole = scope.provider.getSchema().authManage && scope.provider.getSchema().authManage.currentRole || 1;

      if (scope.tableModel.columns.length === 0) {
        scope.tableModel.schema.forEach((value, index) => {
          let render = scope._createRender(index);
          renders.push(render);

          let column = scope._createColumn(index);
          scope.tableModel.columns.push(column);
          scope.tableModel.columnsByField[column.field] = column;
        });
      }
    };

    scope._createRender = (colIndex) => {
      let columnDef = scope.tableModel.schema[colIndex] || {};
      let renderSpec = scope._getLayoutProperty(columnDef, 'render', {});
      let renderFactory =  scope.renderService.get(columnDef.type) || this.di.textRendererFactory;
      let render = renderFactory.createFactory();

      return {
        spec: render,
        params: renderSpec.params || {}
      };
    };

    scope._createColumn = (colIndex) => {
      let columnDef = scope.tableModel.schema[colIndex] || {};

      let col = {
        'def': columnDef,
        'visible': scope._getLayoutProperty(columnDef, 'visible', true),
        'width': scope._getLayoutProperty(columnDef, 'width', null),
        'hidden': scope._getLayoutProperty(columnDef, 'hidden', false),
        'fixed': scope._getLayoutProperty(columnDef, 'fixed', false),
        'sortable': scope._getLayoutProperty(columnDef, 'sortable', false),
        'sort': scope._getInitialColumnSort(colIndex),
      };
      col.render = renders[colIndex];
      col.index = colIndex;
      col.field = col.def.field;
      col.type = col.def.type;

      return col;
    };

    scope._getLayoutProperty = (columnDef, propName, defValue) => {
      let value = columnDef['layout'][propName];
      if (value === undefined) {
        value = columnDef[propName];
      }
      if (value === undefined) {
        value = defValue;
      }
      return value;
    };

    scope._getInitialColumnSort = (colIndex) => {
      return scope.tableModel.sort[scope.tableModel.schema[colIndex].field]
        || scope.tableModel.CONST_SORT_UNDEFINED;
    };

    scope._render = () => {
      this.di.$timeout(() =>{
        scope.tableModel.listeners.notify('table.update');
      }, 0);
    };

    scope._getTableParams = () => {
      let params;
      if (scope._isNeedPagination) {
        params = {
          start: scope.tableModel.pagination.start,
          number: scope.tableModel.pagination.number
         /* sort: scope.tableModel.sort,
          search: scope.tableModel.search,
          pagination: scope.tableModel.pagination*/
        };
        if (Object.keys(scope.tableModel.search) && !!scope.tableModel.search['value']) {
          params['search'] = scope.tableModel.search['value'];
        }
        //1: desc, 2:asc
        if (Object.keys(scope.tableModel.sort)) {
          params['sort'] = Object.keys(scope.tableModel.sort)[0];
          params['orderBy'] = scope.tableModel.sort[params['sort']] === 1 ? 'desc' : 'asc';
        }
      }
      else {
        params = {};
      }
      
      return params;
    };

    /*****************************************************************************
     public api
    *****************************************************************************/
    scope._apiGuard = () => {
      if (!scope.model) {
        return;
      }
    };

    scope._requestUpdate = () => {
        scope.tableModel.listeners.notify('table.update');
    };

    scope._queryUpdate = () => {
      let params = scope._getTableParams();
      scope.tableModel.loading = true;
      return scope.provider.query(params).then(
        function (response) {
          scope.tableModel.loading = false;
          scope._onDataSuccess(response);
        },
        () => {
          scope.tableModel.loading = false;
          scope._onDataError();
        }
      );
    };

    scope._extractProperties = (colmuns, field, propField) => {
      let result = {};
      colmuns.forEach((obj, index) => {
        result[obj[field]] = obj[propField];
      });

      return result;
    };

    scope._apiUpdate = () => {
      scope._apiGuard();
      this.di.$timeout(function () {
        scope._requestUpdate();
      }, 0);
    };

    scope._apiSetColumnVisibility = (fieldName, visible) => {
      scope._apiGuard();
      scope.tableModel.columnsByField[fieldName].visible = visible;
    };

    scope._apiQueryUpdate = () => {
      scope._apiGuard();
      return scope._queryUpdate();
    };

    scope._apiGetColumnVisibility = () => {
      scope._apiGuard();
      return scope._extractProperties(scope.tableModel.columns, 'field', 'visible');
    };

    scope._apiGetColumnFilter = () => {
      scope._apiGuard();
      return scope._extractProperties(scope.tableModel.columns, 'field', '$value');
    };

    (function () {
      scope.tableModel.api = {
        //在controller中通知table render body
        update: scope._apiUpdate,
        //在controller中设置column显示/隐藏func(column_field, true/false)
        setColumnVisibility: scope._apiSetColumnVisibility,
        //在controller中更新table data
        queryUpdate: scope._apiQueryUpdate,
        //在controller中返回table所有columns的visible值{column_field: true/false, ...}
        getColumnsVisibility: scope._apiGetColumnVisibility,
        getColumnsFilter: scope._apiGetColumnFilter,
        setSelectedRow: (itemId) => {
            // var found;
            if (!itemId) { // unselect
              scope.tableModel.selectedRowId = null;
              return;
            }
            // NOTE: set the ID anyway - the developer is responsible of having this valid for now
            scope.tableModel.selectedRowId = itemId;
        }
      };

      if (scope.provider) {
        scope._OnRegistryToRenders();
        scope.tableModel.loading = true;
        scope.onTableHeaderInit();
        scope.apiReady({$api: scope.tableModel.api});
        scope.provider.query(scope._getTableParams())
          .then(function (response) {
            scope.tableModel.loading = false;
            scope._onDataSuccess(response);
          }, function () {
            scope.tableModel.loading = false;
            scope._onDataError();
          });
      }
    })(this);

    scope.$watch(
      () =>{
        return {
          visibility: this.di._.map(scope.tableModel.columns, scope._isColumnDisplayable)
        }
      },
      (newVal, oldVal) => {
        if (oldVal && newVal.visibility.length === oldVal.visibility.length) {
          scope.tableModel.listeners.notify('table.columns.visibility', {
            oldCols: oldVal.visibility,
            newCols: newVal.visibility
          });
        }
      },
      true);

    let onScrollRemoveMenu = (event) => {
      let elements = document.getElementsByClassName('table-row-action-list');
      while (elements.length > 0) {
        elements[0].remove();
      }
    };
    document.body.addEventListener('scroll', onScrollRemoveMenu, true);

    scope.$on('$destroy', ()=> {
      document.body.removeEventListener('scroll', onScrollRemoveMenu);
    });
  }
}

mdlTable.$inject = mdlTable.getDI();
mdlTable.$$ngIsClass = true;