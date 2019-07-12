export class GuestVlanCtrl{
	static getDI() {
		return [
			'$scope',
      '$rootScope',
  		'$q',
      '$filter',
      '$timeout',
      'roleService',
      '_',
			'vlanService',
			'dialogService',
      'notificationService',
      'tableProviderFactory',
      'vlanDataManager',
      'deviceDataManager'
		];
	}
	constructor(...args) {
		this.di = {};
		GuestVlanCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.model = {
    	'actionsShow': this.di.vlanService.getGuestVlanTableActionsShow(),
    	'rowActions': this.di.vlanService.getGuestVlanTableRowActions(),
    	'provider': null,
    	'deviceMap': {},
    	'guestVlanMap': {}
    };
    this.scope.role = this.di.roleService.getRole();

    this.scope.onAPIReady = ($api) => {
	  	this.scope.model.API = $api;
	  };

	  this.scope.addGuestVlan = () => {
	  	this.scope.$emit('gestVlan-wizard-show');
		};
		
		this.scope.batchRemoveGuestVlan = (arr) => {
			this.di.dialogService.createDialog('warning', this.di.$filter('translate')("MODULES.VLAN.GUEST.DIALOG.CONTENT.BATCH_DELETE"))
				.then(() =>{
					this.batchDeleteGuestVlans(arr);
				}, () => {
					
				});
		};

	  this.scope.onTableRowClick = ($event) => {
    	this.scope.model.API.setSelectedRow($event.$data.id);
    };

    this.scope.onTableRowSelectAction = (event) => {
    	if (event.action.value === 'delete') {
    		let port = event.data.port, deviceId = event.data.device_id,
    		    params = {'devices': []}, guest = {"device-id": deviceId, "guestvlans": []};
				for (let p in this.scope.model.guestVlanMap[deviceId]) {
					let vlanId = p == port ? 0 : this.scope.model.guestVlanMap[deviceId][p];
					guest.guestvlans.push({
						'port': p,
						'guestVlan': vlanId
					});
				}
				params.devices.push(guest);
				this.di.vlanDataManager.putVlanConfig(params).then(() => {
					this.scope.model.API.queryUpdate();
				}, (msg) => {
					this.scope.alert = {
            type: 'warning',
            msg: msg
          }
          this.di.notificationService.render(this.scope);
				});
    	}
    };

    this.init();
    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('guest-vlan-list-refresh', () => {
      this.scope.model.API.queryUpdate();
    }));
    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => cb());
    });
	}

	init() {
  	this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer(), 
        		deviceConfig = this.di.$q.defer(),
        		vlanConfig = this.di.$q.defer();
        this.di.deviceDataManager.getDeviceConfigs().then((devices)=>{
		    	devices.forEach((device) => {
		    		this.scope.model.deviceMap[device.id]	= device.name;
		    	});
		    	deviceConfig.resolve(null)
		    });
        this.di.vlanDataManager.getVlanConfig().then((res)=>{
          vlanConfig.resolve(res.data.devices);
        });
        this.di.$q.all([deviceConfig.promise, vlanConfig.promise]).then((arr) => {
        	this.scope.entities = this.getEntities(arr[1]);
        	defer.resolve({
            data: this.scope.entities
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getGuestVlanTableSchema(),
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

	getEntities(devices) {
		let result = [];
		devices.forEach((device) => {
			if (!this.scope.model.guestVlanMap.hasOwnProperty(device['device-id'])) {
			  this.scope.model.guestVlanMap[device['device-id']] = {};
			}
			device.ports.forEach((port) => {
				this.scope.model.guestVlanMap[device['device-id']][port.port] = port.guestVlan;
				if (port.guestVlan > 0) {
					result.push({
						'device_id': device['device-id'],
						'device_name': this.scope.model.deviceMap[device['device-id']] || device['device-id'],
						'port': port.port,
						'vlan_id': port.guestVlan
					});
				}
			});
		});
		return result;
	}

	batchDeleteGuestVlans(arr) {
		let params = {'devices': []}, devices = {};
		arr.forEach((item) => {
			if (!devices.hasOwnProperty(item.device_id)) {
				devices[item.device_id] = {
					"ports": []
				};
			}
			devices[item.device_id]['ports'].push(item.port);
		});
		for (let key in devices) {
			let guest = {"device-id": key, "guestvlans": []};
			for (let port in this.scope.model.guestVlanMap[key]) {
				if (this.scope.model.guestVlanMap[key][port] > 0) {
					let vlanId = devices[key]['ports'].indexOf(parseInt(port)) === -1 ? this.scope.model.guestVlanMap[key][port] : 0;  
					guest["guestvlans"].push({
						'port': port,
						'guestVlan': vlanId
					});
				}
			}
			params.devices.push(guest);
		}
		this.di.vlanDataManager.putVlanConfig(params).then(() => {
			this.scope.model.API.queryUpdate();
		}, (msg) => {
			this.scope.alert = {
				type: 'warning',
				msg: msg
			}
			this.di.notificationService.render(this.scope);
		});
	}
}
GuestVlanCtrl.$inject = GuestVlanCtrl.getDI();
GuestVlanCtrl.$$ngIsClass = true;