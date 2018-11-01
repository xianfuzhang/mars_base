export class IntentsController {
  static getDI() {
  	return [
  		'$scope',
  		'$q',
      '$filter',
  		'intentService',
  		'dialogService',
      'notificationService',
  		'intentDataManager',
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
    this.types = {'HostToHostIntent': '主机到主机'};
    this.scope.model = {
    	'actionsShow':  this.di.intentService.getIntentActionsShow(),
    	'rowActions': this.di.intentService.getIntentTableRowActions(),
    	'provider': null
    };

    this.scope.onAPIReady = ($api) => {
    	this.scope.model.API = $api;
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
        this.di.intentDataManager.getIntents(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.intents);
          defer.resolve({
            data: this.scope.entities
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
      obj.type = this.types[item.type];
      obj.appId = item.appId;
      obj.state = item.state;
      obj.src_end = item.resources[0];
      obj.dst_end = item.resources[1];
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