export class CreateGuestVlanCtrl {
	static getDI() {
		return [
			'$scope',
			'$filter',
			'$rootScope',
			'$q',
			'regexService',
			'deviceDataManager',
			'vlanDataManager',
			'notificationService'
		];
	}
	constructor(...args){
		this.di = {};
    CreateGuestVlanCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
    let scope = this.di.$scope;
    scope.showWizard = false;
    scope.title = this.translate("MODULES.VLAN.GUEST.CREATE.TITLE");
    scope.steps = [
      {
        id: 'step1',
        content: require('../template/guestVlan'),
      }

    ];
    scope.model = {
    	device: null,
    	port: null,
    	deviceDisplayLabel: {
    		'options': [], 
      	'hint': this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.DEVICE')	
    	},
      portDisplayLabel: {
    		'options': [], 
      	'hint': this.translate('MODULES.VLAN.DYNAMIC.TABLE.COLUMN.PORT')	
    	},
    	vlanDisplayLabel: {
    		'hint': 'VLAN'
    	},
    	vlanId: null,
    	port_vlans: []
    }  

    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = () => {
    	let params = {'devices': []}, devices = {};
    	scope.model.port_vlans.forEach((guest) => {
    		if (!devices.hasOwnProperty(guest.device_id)) {
    			devices[guest.device_id] = {
    				"device-id": guest.device_id,
    				"guestvlans": []
    			};
    		}
    		devices[guest.device_id]['guestvlans'].push({
  				"port": guest.port,
  				"guestVlan": guest.guestVlan
  			});
    	});
    	for(let key in devices) {
    		params.devices.push(devices[key]);
    	}

    	return new Promise((resolve, reject) => {
    		if (params.devices.length === 0) {
    			return resolve({valid: false, errorMessage: this.di.$filter('translate')("MODULES.VLAN.GUEST.CREATE.NO_PORT_VLAN")});
    		}
        this.di.vlanDataManager.postVlanConfig(params)
          .then(() => {
            scope.$emit('guest-vlan-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // scope.switch = _.cloneDeep(initSwitch);
            resolve({valid: false, errorMessage: err});
          });
      });
    };

    scope.open = () => {
    	if(scope.showWizard) return;
    	scope.model.port = scope.model.portDisplayLabel.options[0];
    	scope.showWizard = true;
    };

    scope.addPorts = () => {
    	if (scope.model.vlanId && this.di.regexService.excute('vlan_number', scope.model.vlanId)) {
    		let guest = {
    			'device_name': scope.model.device.label,
    			'device_id': scope.model.device.value,
    			'port': scope.model.port.value,
    			'guestVlan': scope.model.vlanId
    		};
    		let exist = scope.model.port_vlans.find((item) => {
					return item.device_id === scope.model.device.value && item.port === scope.model.port.value;
    		});
    		if (!exist) {
    			scope.model.port_vlans.push(guest);
    		}
    	}	
    };

    scope.removePort = (guest) => {
    	let index = scope.model.port_vlans.indexOf(guest);
    	if (index > -1) scope.model.port_vlans.splice(index, 1);
    };

    let getDevicePorts = () => {
    	let defer = this.di.$q.defer();
    	this.di.deviceDataManager.getDeviceWithPorts(scope.model.device.value).then((res) => {
    		scope.model.portDisplayLabel.options = [];
    		res.data.ports.forEach((port) => {
    			scope.model.portDisplayLabel.options.push({
    				'label': port.port,
    				'value': parseInt(port.port)
    			});
    		});
    		defer.resolve(null);
    	});
    	return defer.promise;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('gestVlan-wizard-show', ($event) => {
    	this.di.deviceDataManager.getDeviceConfigs().then((devices)=>{
    		scope.model.deviceDisplayLabel.options = [];
    		devices.forEach((device) => {
    			if (device.protocol === 'rest') {
    				scope.model.deviceDisplayLabel.options.push({
    					'label': device.name,
    					'value': device.id
    				});
    			}
    		});
    		if (scope.model.deviceDisplayLabel.options.length === 0) {
    			this.di.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.GUEST.CREATE.NO_REST_DEVICE'));
          return;
    		}
    		scope.model.device = scope.model.deviceDisplayLabel.options[0];
    		getDevicePorts().then(() => {
    			scope.open();  	
    		});
	    });
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }  
}
CreateGuestVlanCtrl.$inject = CreateGuestVlanCtrl.getDI();
CreateGuestVlanCtrl.$$ngIsClass = true;