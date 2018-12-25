export class SegmentController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$rootScope',
      '$q',
      '$log',
      '$location',
      'roleService',
      'dialogService',
      'logicalDataManager',
      'tableProviderFactory',
      'notificationService'
    ];
  }
  
  constructor(...args) {
    this.di = {};
    SegmentController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    
    this.scope = this.di.$scope;
    this.scope.role = this.di.roleService.getRole();
    this.translate = this.di.$filter('translate');
    this.date = this.di.$filter('date');
  
    let scope = this.di.$scope;
    scope.segmentModel = {
      provider: null,
      api: null,
      actionsShow: this.getActionsShow(),
      rowActions: this.rowActions()
    };
  
    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.segmentModel.api.setSelectedRow(event.$data.name);
      }
    };
    
    scope.onAPIReady = ($api) => {
      scope.segmentModel.api = $api;
    };
  
    scope.createSegment = () => {
      this.di.$rootScope.$emit('segment-wizard-show');
    };
  
    scope.onSegmentTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.SEGMENT.TABLE.REMOVE_SEGMENT'))
            .then((data) =>{
              this.di.logicalDataManager.deleteSegment(event.data.tenant_name, event.data.segment_name)
                .then((res) =>{
                  this.di.notificationService.renderSuccess(scope,this.translate('MODULES.LOGICAL.SEGMENT.DELETE.SUCCESS'));
                  scope.segmentModel.api.queryUpdate();
                },(err)=>{
                  this.di.notificationService.renderWarning(scope, err);
                });
            
            }, (res) =>{
              this.di.$log.debug('delete segment dialog cancel');
            });
        } else if (event.action.value === 'edit'){
          this.di.$rootScope.$emit('segment-wizard-show', event.data.tenant_name, event.data.segment_name);
        } else if (event.action.value === 'add_segment_member'){
          let param = {
            tenantName: event.data.tenant_name,
            segmentName: event.data.segment_name
          }
          this.di.$rootScope.$emit('segmentmember-wizard-show', param);
        }
      }
    };
  
    scope.batchRemove = ($value) => {
      if (!$value.length) return;
      this.di.dialogService.createDialog('warning', this.translate('MODULES.LOGICAL.SEGMENT.TABLE.BATCH_DELETE_SEGMENT'))
        .then(() =>{
          batchDeleteSegments($value);
        }, () => {
          scope.segmentModel.api.queryUpdate();
        });
    };
    
    this.unsubscribers = [];

    this.init();
  
    this.unsubscribers.push(this.di.$rootScope.$on('segment-list-refresh',()=>{
      this.di.notificationService.renderSuccess(this.scope, this.translate('MODULES.LOGICAL.SEGMENT.CREATE.SUCCESS'));
      scope.segmentModel.api.queryUpdate();
    }));
  
    this.unsubscribers.push(this.di.$rootScope.$on('clickabletext', (event, params) => {
      //location path to device detail
      if (params && params.field === 'tenant_name') {
        //this.di.$location.path('/devices/' + params.value).search({'id': params.object.id});
        this.di.$location.path('/tenant/' + params.object.tenant_name);
      } else if (params && params.field === 'segment_name') {
        //this.di.$location.path('/devices/' + params.value).search({'id': params.object.id});
        this.di.$location.path('/tenant/' + params.object.tenant_name + '/segment/' + params.object.segment_name);
      }
    }));
    
    this.scope.$on('$destroy', () => {
      this.unsubscribers.forEach((cb) => {
        cb();
      });
    });
  
    let batchDeleteSegments = (segments) => {
      let deferredArr = [];
      segments.forEach((item) => {
        let defer = this.di.$q.defer();
        this.di.logicalDataManager.deleteSegment(item.tenant_name, item.segment_name)
          .then(() => {
            defer.resolve();
          }, (msg) => {
            defer.reject(msg);
          });
        deferredArr.push(defer.promise);
      });
    
      this.di.$q.all(deferredArr).then(() => {
        this.di.notificationService.renderSuccess(this.scope,this.translate('MODULES.LOGICAL.SEGMENT.BATCH.DELETE.SUCCESS'));
        this.scope.segmentModel.api.queryUpdate();
      }, (error) => {
        this.di.notificationService.renderWarning(this.scope, error);
        this.scope.segmentModel.api.queryUpdate();
      });
    };
  }
  
  init() {
    this.scope.segmentModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        
        this.di.logicalDataManager.getSegments(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.segments);
          defer.resolve({
            data: this.scope.entities,
            count: res.data.count
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.getTableSchema(),
          index_name: 'segment_name',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  }
  
  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    origins.forEach((item) => {
      let obj = {};
      
      obj.tenant_name = item.tenant_name;
      obj.tenant_type = item.tenant_type;
      obj.segment_name = item.segment_name;
      obj.segment_type = item.segment_type;
      obj.ip_address = item.ip_address ? item.ip_address.join(', ') : '-';
      obj.segment_value = item.segment_value;
      
      entities.push(obj);
    });
    return entities;
  }

  getActionsShow() {
    return {
      'add': {'enable': true, 'role': 2},
      'remove': {'enable': true, 'role': 2},
      'refresh': {'enable': true, 'role': 2}
    };
  }
  
  rowActions() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.TENANT.TABLE.EDIT'),
        'value': 'edit',
        'role':  2
      },
      {
        'label': this.translate('MODULES.LOGICAL.TENANT.TABLE.DELETE'),
        'value': 'delete',
        'role': 2
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.ADD_MEMBER'),
        'value': 'add_segment_member',
        'role':  2
      }]
  }
  
  getTableSchema() {
    return [
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.TENANT_NAME'),
        'field': 'tenant_name',
        'type': 'clickabletext',
        'layout': {'visible': true, 'sortable': true, 'fixed': true, width:"15%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.TENANT_TYPE'),
        'field': 'tenant_type',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"15%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.SEGMENT_NAME'),
        'field': 'segment_name',
        'type': 'clickabletext',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"15%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.SEGMENT_TYPE'),
        'field': 'segment_type',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"15%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.SEGMENT_VALUE'),
        'field': 'segment_value',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"15%"}
      },
      {
        'label': this.translate('MODULES.LOGICAL.SEGMENT.TABLE.IP_ADDRESS'),
        'field': 'ip_address',
        'layout': {'visible': true, 'sortable': false, 'fixed': true, width:"25%"}
      }
    ];
  }
}

SegmentController.$inject = SegmentController.getDI();
SegmentController.$$ngIsClass = true;