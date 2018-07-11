export class TestController {
  static getDI() {
    return [
      '$scope',
      '$log',
      '$q',
      '$timeout',
      '$uibModal',
      '_',
      'tableProviderFactory'
    ];
  }

  constructor(...args) {
    this.di = {};
    TestController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.di.$scope.dashModel = {
      switch: false,
      switch1: true,
      checkbox: {
        aaa: false,
        bbb: true,
        ccc: true,
      },
      checkbox1: {ddd: false, eee: false, fff: true},
      select1: {
        label: 'sw2-eth2',
        value: '7'
      },
      radio1: 'ddd',
      radio: null,
      text1: null,
      text2: 'zhang',
      tabSelected: {
        label: '虚机',
        value: 'vm',
        type: 'vm',
      },
      tabs: [{
        label: '虚机',
        value: 'vm',
        type: 'vm',
      },
        {
          label: '主机',
          value: 'server',
          type: 'server',
        }],
      context: {
        //visible 默认为true，可通过show/hide column 修改是否可见；
        // hidden 默认为false，当设置为true该column不可见
        schema: [
          {
            label: '名称',
            field: 'name',
            type: 'text',
            layout: {'visible': true, 'sortable': false},
          },
          {
            label: 'MAC',
            field: 'mac',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: '描述',
            field: 'desc',
            type: 'text',
            layout: {'visible': false, 'sortable': true},
          },
          {
            label: 'Spine',
            field: 'spine',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: '状态',
            field: 'status',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: '角色',
            field: 'role',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: 'Leaf 组',
            field: 'group',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: '管理IP',
            field: 'ip',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: 'Port',
            field: 'port',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: '接口数',
            field: 'count',
            type: 'text',
            layout: {'visible': true, 'sortable': true},
          },
          {
            label: '连接时间',
            field: 'connect_time',
            type: 'text',
            layout: {'visible': false, 'sortable': true},
          },
        ]
      },
      actionsShow: {'menu': true, 'add': true, 'remove': true, 'refresh': true, 'search': true}
    };

    this.di.$scope.dashModel.provider = this.di.tableProviderFactory.createProvider({
      /*init: () => {
        let defer = this.di.$q.defer();
        defer.resolve({
          queryParams: {},
          loadDataAtInit: true,
          selectedRowId: this.getDataOfType().rowId
          // globalSearch: this.di.appModel.get().globalSearch
        });
        return defer.promise;
      },*/
      query: (params) => {
        return this.getDatafromMockServer(params);
        /*let defer = this.di.$q.defer();
        defer.resolve({
          data: this.di.$scope.dashModel.context.data
        });
        return defer.promise;*/
      },
      getSchema: () => {
        return {
          //必选项 列名称数组
          schema: this.di.$scope.dashModel.context.schema,
          //必选项 table index 值为返回data中的key，默认为id
          index_name: 'mac',
          //可选项 默认false
          rowCheckboxSupport: true,
          //可选项 默认false
          rowActionsSupport: true,
          //rowActionsSupport为true需要rowActions数据
          rowActions: [{'label': '编辑', 'value': 'edit'}, {'label': '删除', 'value': 'delete'}],

        };
      }
    });

    this.di.$scope.onTableRowClick = (event) => {
      if (event.$data){
        this.di.$scope.dashModel.api.setSelectedRow(event.$data.mac);
      }
    };

    this.di.$scope.onApiReady = ($api) => {
      this.di.$scope.dashModel.api = $api;
    };

    this.di.$scope.onTabChange = (tab)=> {
      console.log('dash controller,   '+ tab);
      this.di.$scope.dashModel.tabSelected = tab;
    };

    this.di.$scope.addSwitch = () => {
      this.di.$log.info('test controller add switch.');
    };

    this.di.$scope.addSwitch2 = () => {
      this.di.$log.info('test controller add switch2.');
    };

    this.di.$scope.removeSwitch = (items) => {
      this.di.$log.info('test controller remove switch.');
      this.di.$uibModal.open({
          template: require('../../../components/mdc/templates/dialog.html'),
          controller: 'dialogCtrl',
          backdrop: true,
          resolve: {
            dataModel: () => {
              return {
                type: 'warning',
                headerText: '警告',
                contentText: '确认删除虚拟机？',
                cancelText: '取消',
                confirmationText: '确认'
              };
            }
          }
        })
        .result.then((data) => {
        if(data) {
          console.log('data handle');
        }
      });

    };

    this.di.$scope.removeSwitch2 = (items) => {
      this.di.$log.info('test controller remove switch2.');
    };

    this.di.$scope.getSwitches = (params) => {
      this.di.$log.info('test controller get switch from back-end.');
    };


    this.mockTableData = [];
  }

  getDatafromMockServer(params) {
    let deferred = this.di.$q.defer();
    if (this.mockTableData.length === 0) {
      this.di._.times(30, (index, val) => {
        let role = ['Spine', 'Leaf'][this.di._.random(1)];
        let group = role === 'Spine' ? '-' : ['G1', 'G2', 'G3'][this.di._.random(2)];

        let item = {
          'name': 'switch'+index,
          'mac': '00:00:00:01:'+this.di._.random(9)+this.di._.random(9)+':'+this.di._.random(9)+this.di._.random(9),
          'desc': '-',
          'spine': ['Yes', 'No'][this.di._.random(1)],
          'status': ['Up', 'Down'][this.di._.random(1)],
          'role': role,
          'group': group,
          'ip': '192.168.122.254',
          'port': this.di._.random(1000, 3000),
          'count': this.di._.random(8, 48),
          'connect_time': new Date().toUTCString()
        };
        this.mockTableData.push(item);
      });
    }
    this.di.$timeout(() => {
      let start = params.pagination.start || 0;
      let number = params.pagination.number || 10;
      let search = params.search || {};
      let sort = params.sort || {};
      let result = [], sorted = [];
      let keys = Object.keys(sort);
      let values = Object.values(sort);

      //search
      if (Object.keys(search).length > 0) {
        //let key = Object.keys(search)[0];
        let value = search['value'];
        this.mockTableData.forEach((item, index) => {
          if (JSON.stringify(item).search(value) !== -1) {
            result.push(item);
          }
        });
      }
      else {
        result = this.mockTableData;
      }


      //sort
      if (keys.length >0) {
        sorted = this.di._.sortBy(result, function (item) {
          return item[keys[0]];
        });
        //默认asc, 当value为2表示desc
        if (values[0] === 2) {
          sorted = sorted.reverse();
        }
      }
      else {
        sorted = result;
      }

      //pagination
      let data = sorted.slice(start, start + number);

      deferred.resolve({
        count: result.length,
        data: data
      });
    });
    return deferred.promise;
  }
}

TestController.$inject = TestController.getDI();
TestController.$$ngIsClass = true;

