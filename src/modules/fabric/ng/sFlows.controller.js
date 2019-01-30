export class sFlowsController {
  static getDI() {
  	return [
  		'$scope',
      '$rootScope',
  		'$q',
      '$filter',
      'roleService',
      '_',
  		'deviceDetailService',
  		'dialogService',
      'notificationService',
      'deviceDataManager',
      'modalManager',
  		'tableProviderFactory'
  	];
  }
  constructor(...args){
  	this.di = {};
    sFlowsController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.types = {'HostToHostIntent': '端点到端点', 'PointToPointIntent': '端口到端口'};
    this.scope.devices = [];
    this.scope.model = {
    	'actionsShow':  this.di.deviceDetailService.getSFlowActionsShow(),
    	'rowActions': this.di.deviceDetailService.getSFlowTableRowActions(),
    	'provider': null
    };
    this.scope.role = this.di.roleService.getRole();

    this.scope.onAPIReady = ($api) => {
    	this.scope.model.API = $api;
    };

    this.scope.addFlow = () => {
      let deviceDefer = this.di.$q.defer(),
          endpointDefer = this.di.$q.defer();
      this.di.deviceDataManager.getDeviceConfigs().then((devices)=> {
        deviceDefer.resolve(devices);
      });
      this.di.deviceDataManager.getEndpoints().then((res)=> {
        endpointDefer.resolve(res.data.hosts);
      });
      this.di.$q.all([deviceDefer.promise, endpointDefer.promise]).then(
        (arr) => {
          if (arr[0].length === 0 && arr[1].length === 0) {
            this.scope.alert = {
              type: 'warning',
              msg: this.translate('MODULES.INTENT.CREATE.RESOURCE.INVALID')
            }
            this.di.notificationService.render(this.scope);
            return;
          }
          this.di.modalManager.open({
            template: require('../components/createIntent/template/createIntent.html'),
            controller: 'createIntentCtrl',
            windowClass: 'create-intent-modal',
            resolve: {
              dataModel: () => {
                return {
                  devices: arr[0],
                  endpoints: arr[1],
                  from: 'intent'
                };
              }
            }
          })
          .result.then((data) => {
            if (data && !data.canceled) {
              this.di.intentDataManager.createIntent(data.result).then(
                () => {
                  this.scope.alert = {
                    type: 'success',
                    msg: this.translate('MODULES.INTENT.CREATE.SUCCESS')
                  }
                  this.di.notificationService.render(this.scope);
                  this.scope.model.API.queryUpdate();
                },
                (msg) => {
                  this.scope.alert = {
                    type: 'warning',
                    msg: msg
                  }
                  this.di.notificationService.render(this.scope);
                }
              )
            }
          });  
      });
    };

    this.scope.batchRemove = ($value) => {
    	if (!$value.length) return;
      this.di.dialogService.createDialog('warning', this.translate('MODULES.SWITCH.FLOW.DIALOG.CONTENT.BATCH_DELETE_FLOWS'))
      .then(() =>{
        this.batchDeleteFlows($value);
      }, () => {
        this.scope.model.API.queryUpdate();
      });
    };

    this.scope.onTableRowSelectAction = ($event) => {
      if (!$event.action || !$event.data) return;
      if ($event.action.value === 'delete') {
        this.di.deviceDataManager.deleteSFlowByDeviceId($event.data.device_id).then(
          () => {
            this.scope.alert = {
              type: 'success',
              msg: this.translate('MODULES.SWITCH.SFLOW.DELETE.SUCCESS')
            }
            this.di.notificationService.render(this.scope);
            this.scope.model.API.queryUpdate();
          },
          (msg) => {
            this.scope.alert = {
              type: 'warning',
              msg: msg
            }
            this.di.notificationService.render(this.scope);
          }
        );
      }
    };

    this.scope.onTableRowClick = ($event) => {
    	this.scope.model.API.setSelectedRow($event.$data.id);
    };

    this.init();
  }

  init() {
  	this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
          this.scope.devices = configs;
          this.di.deviceDataManager.getAllSFlows(params).then((data) => {
            this.scope.entities = this.getEntities(data);
              defer.resolve({
                data: this.scope.entities
            });
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceDetailService.getDeviceSFlowsSchema(),
          index_name: 'id',
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

  getEntities(data) {
  	let entities = [];

  	data.forEach((item) => {
      let obj = {}, device = this.scope.devices.find(device => item.device_id === device.id);
      obj.id = item.device_id + ':' + item.collector_ip;
      obj.device = device && device.name || item.device_id;
      obj.device_id = item.device_id;
      obj.port = item.port.join(',');
      obj.payload = item.max_payload_length;
      obj.header = item.max_header_length;
      obj.interval = item.polling_interval;
      obj.rate = item.sample_rate;
      obj.duration = item.duration === 0 ? this.translate('MODULES.SWITCH.DETAIL.FLOW.DURATION.ALWAYS') : item.duration;
      entities.push(obj);
    });
    return entities;
  }

  batchDeleteFlows(flows) {
    let deferredArr = [];
    flows.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.deleteSFlowByDeviceId(item.device_id)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.SWITCH.SFLOW.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.API.queryUpdate();
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
      this.scope.model.API.queryUpdate();
    });
  }
}

sFlowsController.$inject = sFlowsController.getDI();
sFlowsController.$$ngIsClass = true;