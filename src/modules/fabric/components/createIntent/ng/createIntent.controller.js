export class CreateIntentController {
	static getDI() {
		return [
			'$scope',
      '$rootScope',
      //'notificationService',
      'intentDataManager'
		];
	}
	constructor(...args){
		this.di = {};
    CreateIntentController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unsubscribes = [];
    const intentDataManager = this.di.intentDataManager;
    const rootScope = this.di.$rootScope;
    this.scope = this.di.$scope;
    this.scope.dstEndpointsLabel = {
      options: []
    };
    this.scope.typesLabel = {
      options: [
        {'label': '主机到主机', 'value': 'HostToHostIntent'},
        //{'label': '端点到端点', 'value': 'EndpointToEndpoint'}
      ]
    };
    this.scope.model = {
      type: null,
      dst_end: null,
      src_end: null,
    };

    this.scope.showWizard = false;
    this.scope.title = '添加Intent';
    this.scope.steps = [
      {
        id: 'step1',
        title: 'Info',
        content: require('../template/createIntent.html'),
      },
    ];

    this.scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    this.scope.submit = function() {
      let params = {
          'type': this.model.type.value,
          'appId': 'org.onosproject.ovsdb',
          'priority': 55,
          'one': this.model.src_end + '/-1',
          'two': this.model.dst_end.value + '/-1',
        };
      return new Promise((resolve, reject) => {
        intentDataManager.createIntent(params).then(
          () => {
            //rootScope.$emit('intent-list-refresh');
            resolve({valid: true, errorMessage: ''});
        }, (msg) => {
          /*this.scope.alert = {
            type: 'warning',
            msg: msg
          }
          this.di.notificationService.render(this.scope);*/
          resolve({valid: false, errorMessage: msg});
        });
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('create-intent-show', ($event, params) => {
      this.scope.model.src_end = params.srcEndpoint;
      this.prepareDstEndpoints(params.endpoints, params.srcEndpoint);
      this.open(params.srcEndPoint);
    }));

    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
	}

	open(srcEndPoint) {
		if(this.scope.showWizard) return;
    this.scope.showWizard = true;
	}

  prepareDstEndpoints(endpoints, src_end) {
    this.scope.dstEndpointsLabel.options = [];
    endpoints.forEach((item) => {
      if (item.mac !== src_end) {
        this.scope.dstEndpointsLabel.options.push({'label': item.mac, 'value': item.mac});
      }
    });
  }
}
CreateIntentController.$inject = CreateIntentController.getDI();
CreateIntentController.$$ngIsClass = true;