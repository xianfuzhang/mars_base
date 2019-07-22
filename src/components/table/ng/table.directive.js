export class mdlTable {
  static getDI() {
    return [
      '$log',
      '$rootScope',
      '$filter',
      '$timeout',
      '_',
      'tableConsts',
      'renderService',
      'fastListenerService',
      'textRendererFactory',
      'clickableTextRendererFactory',
      'popupTextRendererFactory',
      'iconRendererFactory',
      'selectRendererFactory',
      'checkboxRendererFactory',
      'radioRendererFactory'
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

    scope._isNeedPagination = scope.needPagination === 'true' ? true : false;

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
      inlineFilterData: [], //负责从data过滤数据
      filteredData: [], //保存分页后的数据，前台分页从inlineFilterData拿数据，然后通知tbody渲染

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
      columnFilterConditions: [],
      search: {},
      searchResult: '',
      globalSearch: true,
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
        scope.inlineFilter();
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
      $col.sort = $col.sort === scope.tableModel.CONST_SORT_ASC ? scope.tableModel.CONST_SORT_DESC : 
                  $col.sort === scope.tableModel.CONST_SORT_DESC ? scope.tableModel.CONST_SORT_UNDEFINED : 
                  scope.tableModel.CONST_SORT_ASC;
      scope.tableModel.sort = {};
      scope.tableModel.sort[$col.field] = $col.sort;
      scope._orderInlineFilterData();
      scope._clientDataPagination(); 
    };

    scope._orderInlineFilterData = () => {
      if (Object.keys(scope.tableModel.sort).length > 0) {
        const field = Object.keys(scope.tableModel.sort)[0], 
              order = scope.tableModel.sort[field] === scope.tableModel.CONST_SORT_DESC ? 'desc' : 
                      scope.tableModel.sort[field] === scope.tableModel.CONST_SORT_ASC ? 'asc' : null;
        if (order) {
          scope.tableModel.inlineFilterData = this.di._.orderBy(scope.tableModel.inlineFilterData, [field], [order]);  
        }
      }
    };

    scope._sort = ($col) => {
      this.di._.each(scope.tableModel.columns, (col) => {
        if (col.field !== $col.field) {
          col.sort = scope.tableModel.CONST_SORT_UNDEFINED;
        }
      });
      $col.sort = $col.sort === scope.tableModel.CONST_SORT_ASC ? scope.tableModel.CONST_SORT_DESC : 
                  $col.sort === scope.tableModel.CONST_SORT_DESC ? scope.tableModel.CONST_SORT_UNDEFINED :
                  scope.tableModel.CONST_SORT_ASC;
      scope.tableModel.sort = {};            
      if ($col.sort < scope.tableModel.CONST_SORT_UNDEFINED) {
        scope.tableModel.sort[$col.field] = $col.sort;
      }
      //scope.tableModel.pagination.currentPage = 1;
      scope._queryUpdate();
    };

    scope._isColumnDisplayable = (col) => {
      return col.visible && !col.hidden;
    };

    scope._getColumnSortMode = ($col) => {
      return $col.sort || scope.tableModel.CONST_SORT_UNDEFINED;
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
      scope.tableModel.removeItems = [];
      scope.tableModel.filteredData.forEach((item) => {
        if (!event.target.checked) {
          item.isChecked = false;  
        }
        else {
          item.isChecked = true;
          scope.tableModel.removeItems.push(item);
        }
      });
      /*for(var i=0; i < scope.tableModel.data.length;  i++) {
        let index = scope.tableModel.removeItems.indexOf(scope.tableModel.data[i]);
        if (event.target.checked && index === -1) {
          scope.tableModel.removeItems.push(scope.tableModel.data[i]);
        }
        if (!event.target.checked && index !== -1) {
          scope.tableModel.removeItems.splice(index, 1);
        }
      }*/
      //scope.$emit('checkbox-select-all', {'checked': event.target.checked});
    };

    scope._isSelectedAll = () => {
      if (scope.tableModel.data.length === 0) return false;
      return scope.tableModel.filteredData.length > 0 ?
      scope.tableModel.filteredData.length === scope.tableModel.removeItems.length ? true : false : false;
      /*if (scope.tableModel.data.length === 0) return false;
      for(var i=0; i < scope.tableModel.filteredData.length;  i++) {
        if (scope.tableModel.removeItems.indexOf(scope.tableModel.data[i]) === -1) {
          return false;
        }
      }
      return true;*/
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
      //当用户esc退出或取消弹出框时重置数据
      scope.tableModel.removeItems = [];
      scope.tableModel.filteredData.forEach((item) => {
        item.isChecked = false;
      });
      event && event.stopPropagation();
    };
    scope._refresh = (event) => {
      scope._queryUpdate();
      event && event.stopPropagation();
    };
    scope._search = (globalSearch, columns) => {
      scope.tableModel.pagination.start = 0;
      scope.tableModel.globalSearch = globalSearch;
      if (globalSearch) {
      scope.tableModel.search['value'] = scope.tableModel.searchResult;
      }
      else {
        if (columns && columns.display.length > 0) {
          for (let i = 0, len = columns.display.length; i < len; i++) {
            let obj = {
              'display': columns.display[i],
              'result': []
            };
            obj.result.push(columns.result[i]);
            scope.tableModel.columnFilterConditions.push(obj);
          }
        }
        //scope.tableModel.searchResult = columns && columns.display || '';
        scope.tableModel.search['value'] = columns && columns.result || '';
      }
      if (scope._isNeedPagination === false ||  scope._isNeedPagination === 'false') {
        scope.inlineFilter(columns && columns.result);
        scope._orderInlineFilterData();
        scope._clientDataPagination();
        scope.clearRowCheck();
        scope._render();
      }
      else {
        scope._queryUpdate();
      }
    };
    scope._clearSearch = (event) => {
      scope.tableModel.globalSearch = true;
      scope.tableModel.pagination.start = 0;
      scope.tableModel.columnFilterConditions = [];
      scope.tableModel.searchResult = '';
      scope.tableModel.search['value'] = scope.tableModel.searchResult;
      if (scope._isNeedPagination === false ||  scope._isNeedPagination === 'false') {
        scope.inlineFilter();
        scope._orderInlineFilterData();
        scope._clientDataPagination();
        scope.clearRowCheck();
        scope._render();
      }
      else {
        scope._queryUpdate();
      }
      event && event.stopPropagation();
    };

    scope._deletecolumnCondition = (event, index) => {
      scope.tableModel.columnFilterConditions.splice(index, 1);
      if (scope.tableModel.columnFilterConditions.length === 0) {
        scope.tableModel.search['value'] = '';
        scope.tableModel.globalSearch = true;
      }
      let columns = [];
      scope.tableModel.columnFilterConditions.forEach((item) => {
        columns.push(item.result[0]);
      });
      scope.inlineFilter(columns);
      scope._orderInlineFilterData();
      scope._clientDataPagination();
      scope.clearRowCheck();
      scope._render();
      event.stopPropagation();
    };

    scope.inlineFilter = (columns) => {
      scope.tableModel.inlineFilterData = [];
      if (!scope.tableModel.search['value']) {
        scope.tableModel.inlineFilterData = scope.tableModel.data;
      }
      else {
        let reg = new RegExp(scope.tableModel.search['value']);
        let tmpData = angular.copy(scope.tableModel.data);
        scope.tableModel.inlineFilterData = tmpData.filter((item) => {
          let match = false;
          if (!columns) {
          //针对所有列过滤
            for(let key in item) {
              if (scope.tableModel.columnsByField[key] && 'string' === typeof item[key] && reg.test(item[key])) {
                match = true;
                //item[key] = item[key].replace(scope.tableModel.search['value'], '<font color="red">' +scope.tableModel.search['value'] + '</font>');
              }  
            }
          }
          else {
            let match2 = true;
            for(let i = 0; i< columns.length; i++) {
              let match1 = columns[i][1] === 'contains' ? item[columns[i][0]].includes(columns[i][2])
                      : item[columns[i][0]] == columns[i][2]; 
              match2 = match2 && match1;
            }
            match = match2;
          }
          return match;
        });
      }

      scope.tableModel.pagination.totalItemCount = scope.tableModel.inlineFilterData.length;
      scope.tableModel.pagination.numberOfPages = scope.tableModel.pagination.totalItemCount === 0 ?
          1 : Math.ceil(scope.tableModel.pagination.totalItemCount / scope.tableModel.pagination.number);
      scope.tableModel.pagination.start = 0;
    };

    scope.clearRowCheck = () => {
      scope.tableModel.removeItems = [];
      scope.tableModel.filteredData.forEach((item) => {
        item.isChecked = false;
      });
    };


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
      scope.renderService.register('select', this.di.selectRendererFactory);
      scope.renderService.register('checkbox', this.di.checkboxRendererFactory);
      scope.renderService.register('radio', this.di.radioRendererFactory);
    };

    scope._onDataSuccess = (response) => {
      response = response || {};
      scope.tableModel.data = response.data || [];
      scope.tableModel.pagination.totalItemCount = scope._isNeedPagination ? 
          response.count || 0 : scope.tableModel.data.length;
      scope.tableModel.pagination.numberOfPages = scope.tableModel.pagination.totalItemCount === 0 ?
          1 : Math.ceil(scope.tableModel.pagination.totalItemCount / scope.tableModel.pagination.number);

      if (scope._isNeedPagination) {
        scope.tableModel.filteredData = scope.tableModel.data;
      } 
      else {
        scope.inlineFilter();
        scope._clientDataPagination();
      }     
      scope.tableModel.filteredData.forEach((item) => {
        item.isChecked = false;
      });
      //scope.onDataReady();
      if (scope.tableModel.filteredData.length === 0) {
        scope.$emit('table-render-ready');
      }
      else {
        scope._render();  
      }
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
        'width': scope._getLayoutProperty(columnDef, 'width', 0),
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
        scope.tableModel.listeners.notify('table.update', {'searchSwitch': scope.actionsShow.search.enable});
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
        if (Object.keys(scope.tableModel.sort).length > 0) {
          params['sort'] = Object.keys(scope.tableModel.sort)[0];
          params['orderBy'] = scope.tableModel.sort[params['sort']] === 1 ? 'desc' : 'asc';
        }
      }
      else {
        params = {};
      }
      
      return params;
    };

    scope._clientDataPagination = () => {
      scope.tableModel.filteredData = scope.tableModel.inlineFilterData.slice(scope.tableModel.pagination.start, 
          scope.tableModel.pagination.start + scope.tableModel.pagination.number);
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
        scope.tableModel.listeners.notify('table.update', {'searchSwitch': scope.actionsShow.search.enable});
    };

    scope._queryUpdate = () => {
      let params = scope._getTableParams();
      scope.tableModel.columnFilterConditions = [];
      scope.tableModel.searchResult = '';
      scope.tableModel.search['value'] = scope.tableModel.searchResult;
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

    scope._apiInlineFilter = () => {
      scope.inlineFilter();
      scope._clientDataPagination();
    };

    scope.tableModel.api = {
      //在controller中通知table render body
      update: scope._apiUpdate,
      //在controller中设置column显示/隐藏func(column_field, true/false)
      setColumnVisibility: scope._apiSetColumnVisibility,
      inlineFilter : scope._apiInlineFilter,
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
      },
      getSelectedRows: ()=>{
        return scope.tableModel.removeItems;
      },
      resetSelectedRows: ()=>{
        scope.clearRowCheck();
      }
    };

    if (scope.provider) {
      scope._OnRegistryToRenders();
      scope.tableModel.loading = true;
      scope.onTableHeaderInit();
      scope.apiReady = scope.apiReady || angular.noop;
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

    let subscribes = [];
    subscribes.push(this.di.$rootScope.$on('td-filter-event', (event, params) => {
      scope.tableModel.search['value'] = params.display;
      let index = scope.tableModel.columnFilterConditions.findIndex((item) => {
        return item.display === params.display;
      });
      if (index === -1) {
        scope.tableModel.columnFilterConditions.push(params);
      } 
      let columns = [];
      scope.tableModel.columnFilterConditions.forEach((item) => {
        columns.push(item.result[0]);
      });
      scope.inlineFilter(columns);
      scope._orderInlineFilterData();
      scope._clientDataPagination();
      scope.clearRowCheck();
      scope._render();
      scope.tableModel.globalSearch = false;
    }));
    
    scope.$on('$destroy', ()=> {
      subscribes.forEach((cb) => cb());
      document.body.removeEventListener('scroll', onScrollRemoveMenu);
    });
  }
}

mdlTable.$inject = mdlTable.getDI();
mdlTable.$$ngIsClass = true;