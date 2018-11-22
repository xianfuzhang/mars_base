export class SegmentDetailController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$routeParams',
      '$filter',
      '$q',
      '$log',
      '_',
      'roleService',
      'notificationService',
      'dialogService',
      'logicalService',
      'logicalDataManager',
      'tableProviderFactory',
      'modalManager'
    ];
  }
  constructor(...args){
    this.di = {};
    SegmentDetailController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.page_title = this.translate('MODULES.SWITCH.DETAIL.TITLE');
    scope.tenantName = this.di.$routeParams['tenantName'];
    scope.segmentName = this.di.$routeParams['segmentName'];
    scope.role = this.di.roleService.getRole();
    let isInit = true;
    let vxlanData = {'network':[],'access':[]};

    scope.segDetailModel = {
      provider: null,
      actionsShow: null,
      api: null,
      schema: [],
      rowActions: [],
      entities: [],
      total: null
    };

    scope.vxlanTableModel = {
      network_provider: null,
      access_provider: null,
      actionsShow: null,
      network_api: "",
      access_api: "",
      rowActions: [],
    };

    scope.vlanTableModel = {

    };


    let vxlanDataRefresh = () => {
      let defer = this.di.$q.defer();
      this.di.logicalDataManager.getTenantSegmentMemberVxlan(scope.tenantName, scope.segmentName)
        .then((res)=>{
          vxlanData = _formatVxlanData(res.data);
          // scope.vlanTableModel.network_api.queryUpdate();
          // scope.vlanTableModel.access_api.queryUpdate();
          defer.resolve()
        },(err)=>{
          this.di.notificationService.renderWarning(scope, err);
        });
      return defer.promise;
    };

    scope.onVxlanAccessApiReady = ($api) =>{
      scope.vxlanTableModel.access_api = $api;
    };
    scope.onVxlanNetworkApiReady = ($api) =>{
      scope.vxlanTableModel.network_api = $api;
    };

    scope.vxlanTableModel.network_provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        if(isInit){
          defer.resolve({
            data: vxlanData.network|| [],
            count: undefined
          });
        } else {
          vxlanDataRefresh().then(()=>{
            defer.resolve({
              data: vxlanData.network|| [],
              count: undefined
            });
          });
        }

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.logicalService.getSegmentMemberVxlanNetworkTableSchema(),
          index_name: 'name',
          rowCheckboxSupport: false,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.di.$scope.role
          }
        };
      }
    });

    scope.vxlanTableModel.access_provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        if(isInit){
          defer.resolve({
            data: vxlanData.access|| [],
            count: undefined
          });
        } else {
          vxlanDataRefresh().then(()=>{
            defer.resolve({
              data: vxlanData.access|| [],
              count: undefined
            });
          });
        }
        // },200);
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.logicalService.getSegmentMemberVxlanAccessTableSchema(),
          index_name: 'name',
          rowCheckboxSupport: false,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.di.$scope.role
          }
        };
      }
    });

    let init = () =>{
      scope.vxlanTableModel.rowActions = this.getVxlanTableRowActions();
      scope.vxlanTableModel.actionsShow =  this.getVxlanTableActionShow();

      this.di.logicalDataManager.

      vxlanDataRefresh().then(()=>{
        scope.vxlanTableModel.network_api.queryUpdate();
        scope.vxlanTableModel.access_api.queryUpdate();
        isInit = false;
      })

      // isInit = false;

    };

    init();

    // this.di.deviceDataManager.getDeviceConfigs().then((res) => {
    //   if (res) {
    //     scope.detailDisplay = true;
    //     scope.detailValue = res;
    //
    //     scope.page_title = this.translate('MODULES.SWITCH.DETAIL.TITLE') + "(" + scope.detailValue.name + ")";
    //     scope.detailValue.leaf_group = !scope.detailValue.leaf_group ? '-' : scope.detailValue.leaf_group;
    //   }
    //   // init();
    // });

    let unSubscribers = [];
  
    unSubscribers.push(this.di.$rootScope.$on('segment-member-refresh',()=>{
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.SWITCH.DETAIL.GROUP.CREATE.SUCCESS'));
      // scope.detailModel.api.queryUpdate();//TODO
    }));
    
    scope.$on('$destroy', () => {
      unSubscribers.forEach((unSubscribe) => {
        unSubscribe();
      });
    });



    let _formatVxlanData = (data) =>{
      let network_data = data['network_port']|| [];
      let access_data = data['access_port']|| [];
      let res = {'network':[], 'access':[]};
      if(network_data.length > 0)
        this.di._.forEach(network_data,(item)=>{
          res.network.push({'name': item['name'], 'ip_addresses': item['ip_addresses'].join(',')})
        });

      if(access_data.length > 0)
        this.di._.forEach(access_data,(item)=>{
          let port = item['type'] === 'normal' ? item['switch']+ ':' + item['port']:item['server_mac']
          res.access.push({'name': item['name'], 'type': item['type'], 'port':port , 'vlan':item['vlan']});
        });
      return res;
    };



    scope.onVxlanAccessTableRowSelectAction = ($event) =>{
      if ($event.data && $event.action) {
        if ($event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.SEGMENT_DETAIL.REMOVE_SEGMENT_MEMBER'))
            .then((data) =>{
              this.di.logicalDataManager.deleteTenantSegmentMemberVxlanAccess(scope.tenantName, scope.segmentName, $event.data.name)
                .then((res) =>{
                  this.di.notificationService.renderSuccess(scope, this.translate('MODULES.LOGICAL.SEGMENT_DETAIL.REMOVE_SEGMENT_MEMBER.SUCCESS'));
                  vxlanDataRefresh().then(()=>{
                    // scope.vxlanTableModel.network_api.queryUpdate();
                    scope.vxlanTableModel.access_api.queryUpdate();
                  });
                },(error)=>{
                  this.di.notificationService.renderWarning(scope, error);
                });
            }, (res) =>{
              this.di.$log.debug('delete tenant segment member dialog cancel');
            });
        } else if($event.action.value === 'edit'){
          this.di.$rootScope.$emit('', $event.data.host.split('/')[0]);//TODO
        }
      }
    };

    scope.onVxlanNetworkTableRowSelectAction = ($event) =>{
      if ($event.data && $event.action) {
        if ($event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.SEGMENT_DETAIL.REMOVE_SEGMENT_MEMBER'))
            .then((data) =>{
              this.di.logicalDataManager.deleteTenantSegmentMemberVxlanNetwork(scope.tenantName, scope.segmentName, $event.data.name)
                .then((res) =>{
                  this.di.notificationService.renderSuccess(scope, this.translate('MODULES.LOGICAL.SEGMENT_DETAIL.REMOVE_SEGMENT_MEMBER.SUCCESS'));
                  vxlanDataRefresh().then(()=>{
                    scope.vxlanTableModel.network_api.queryUpdate();
                    // scope.vxlanTableModel.access_api.queryUpdate();
                  });
                },(error)=>{
                  this.di.notificationService.renderWarning(scope, error);
                });
            }, (res) =>{
              this.di.$log.debug('delete tenant segment member dialog cancel');
            });
        } else if($event.action.value === 'edit'){
          this.di.$rootScope.$emit('', $event.data.host.split('/')[0]);//TODO
        }
      }
    };

    scope.onVxlanNetworkTableRowClick = ($event) =>{
      if (event.$data){
        scope.vxlanTableModel.network_api.setSelectedRow(event.$data.name);
      }
    };

    scope.onVxlanAccessTableRowClick = ($event) =>{
      if (event.$data){
        scope.vxlanTableModel.access_api.setSelectedRow(event.$data.name);
      }
    };




  }

  getVxlanTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.ACTION.EDIT'),
        'role': 2,
        'value': 'edit'
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT_DETAIL.TABLE.ACTION.DELETE'),
        'role': 2,
        'value': 'delete'
      }
    ];
  }

  getVxlanTableActionShow(){
    return {
      'menu': {'enable': false, 'role': 2},
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 2},
      'search': {'enable': false, 'role': 2}
    };
  }


}
SegmentDetailController.$inject = SegmentDetailController.getDI();
SegmentDetailController.$$ngIsClass = true;