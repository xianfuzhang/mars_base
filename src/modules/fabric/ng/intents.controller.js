export class IntentsController {
  static getDI() {
  	return [
  		'$scope',
      '$rootScope',
  		'$q',
      '$filter',
      '_',
  		'intentService',
  		'dialogService',
      'notificationService',
  		'intentDataManager',
      'deviceDataManager',
      'modalManager',
  		'tableProviderFactory'
  	];
  }
  constructor(...args){
  	this.di = {};
    IntentsController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.types = {'HostToHostIntent': '端点到端点', 'PointToPointIntent': '端口到端口'};
    this.scope.devices = [];
    this.scope.model = {
    	'actionsShow':  this.di.intentService.getIntentActionsShow(),
    	'rowActions': this.di.intentService.getIntentTableRowActions(),
    	'provider': null
    };

    this.scope.onAPIReady = ($api) => {
    	this.scope.model.API = $api;
    };

    this.scope.addIntent = () => {
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
      this.di.dialogService.createDialog('warning', this.translate('MODULES.INTENTS.DIALOG.CONTENT.BATCH_DELETE_INTENT'))
      .then(() =>{
          this.batchDeleteIntents($value);
        }, () => {
          this.scope.model.API.queryUpdate();
        });
    };

    this.scope.onTableRowSelectAction = ($event) => {
      if (!$event.action || !$event.data) return;
      if ($event.action.value === 'delete') {
        this.di.intentDataManager.deleteIntent($event.data.appId, $event.data.id).then(
          () => {
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
          this.di.intentDataManager.getIntents(params).then((res) => {
            this.scope.entities = this.getEntities(res.data.intents);
              defer.resolve({
                data: this.scope.entities
            });
          });
        });
        

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.intentService.getIntentTableSchema(),
          index_name: 'id',
          rowCheckboxSupport: true,
          rowActionsSupport: true
        };
      }
    });
  }

  getEntities(intents) {
  	let entities = [];

  	intents.forEach((item) => {
      let obj = {};
      obj.id = item.id;
      obj.type = this.types[item.type] || item.type;
      obj.appId = item.appId;
      obj.state = item.state;
      if (item.type === 'PointToPointIntent') {
        let  srcArr = item.resources[0].split('/'),
             dstArr = item.resources[1].split('/'),
             srcDevice = this.di._.find(this.scope.devices, {'id': srcArr[0]}),
             dstDevice = this.di._.find(this.scope.devices, {'id': dstArr[0]});
        obj.src_end = ((srcDevice && srcDevice['name'])||srcArr[0]) + '/' + srcArr[1];
        obj.dst_end = ((dstDevice && dstDevice['name'])||dstArr[0]) + '/' + dstArr[1];
      }
      else {
        obj.src_end = item.resources[0];
        obj.dst_end = item.resources[1];
      }
      entities.push(obj);
    });
    return entities;
  }

  batchDeleteIntents(intents) {
    let deferredArr = [];
    intents.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.intentDataManager.deleteIntent(item.appId, item.id)
        .then(() => {
          defer.resolve();
        }, () => {
          defer.resolve();
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.model.API.queryUpdate();
    });
  }
}

IntentsController.$inject = IntentsController.getDI();
IntentsController.$$ngIsClass = true;