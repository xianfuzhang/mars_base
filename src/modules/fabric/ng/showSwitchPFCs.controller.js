export class ShowSwitchPFCsController {
	static getDI() {
		return [
			'$scope',
			'$q',
			'dataModel',
			'deviceDetailService',
			'deviceDataManager',
			'tableProviderFactory'
		];
	}

	constructor(...args) {
		this.di = {};
    ShowSwitchPFCsController.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.scope = this.di.$scope;
		this.scope.switchId = this.di.dataModel.switchId;

		this.scope.pfcModel = {
      provider: null,
      api: null,
      schema: this.di.deviceDetailService.getDevicePFCSchema(),
      entities: []
    };

		this.scope.onTableRowClick = (event) => {
			if (event.$data){
        this.scope.pfcModel.api.setSelectedRow(event.$data.id);
      }
		};

		this.scope.onApiReady = ($api) => {
      this.scope.pfcModel.api = $api;
    };

    this.init();
	}

	init() {
		this.scope.pfcModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.deviceDataManager.getPFCListByDeviceId(this.scope.switchId).then((res) => {
          this.entityStandardization(res.data.pfcs);
          defer.resolve({
            data: this.scope.pfcModel.entities,
            count: this.scope.pfcModel.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.pfcModel.schema,
          index_name: 'id',
          rowCheckboxSupport: false,
          rowActionsSupport: false
        };
      }
    });
	}

	entityStandardization(entities) {
		this.scope.pfcModel.entities = [];

    entities.forEach((entity) => {
      let obj = {};
      obj['port'] = entity.port;
      if(entity['queues'] && Array.isArray(entity['queues'])){
        obj['queues'] = entity.queues.join(', ');
      } else {
        obj['queues'] = '';
      }
      this.scope.pfcModel.entities.push(obj);
    });
	}
}
ShowSwitchPFCsController.$inject = ShowSwitchPFCsController.getDI();
ShowSwitchPFCsController.$$ngIsClass = true;