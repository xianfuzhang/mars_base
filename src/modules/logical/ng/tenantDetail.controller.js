export class TenantDetail {
	static getDI() {
		return [
			'$scope',
			'$rootScope',
			'$routeParams',
			'$q',
			'logicalService',
			'roleService',
			'logicalDataManager',
			'deviceDataManager',
			'tableProviderFactory'
		];
	};
	constructor(...args) {
		this.di = {};
		TenantDetail.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.scope = this.di.$scope;
		this.scope.tenantName = this.di.$routeParams['tenantName'];
		this.scope.role = this.di.roleService.getRole();
		this.scope.tabSwitch = false;
		this.scope.tabSelected = null;
		this.scope.segmentName = null;
		this.scope.deviceObjects = {};
		this.scope.tabs = this.di.logicalService.getTenantDetailTabSchema();
		this.scope.detailModel = {
			provider: null,
			api: null,
			actionsShow: null,
			rowActions: null,
			entities: []
		};
		this.scope.segmentModel = {
			actionsShow: null,
			vlanProvider: null,
			vxlanProvider: null
		};
		this.initActions();
		this.di.deviceDataManager.getDeviceConfigs().then((devices) =>{
			devices.forEach((device) => {
				this.scope.deviceObjects[device.id] = device.name;
			});
			this.init();
		});
	}

	initActions() {
		this.scope.onTabChange = (tab) => {
			if (tab && !this.scope.tabSwitch){
        this.scope.tabSelected = tab;
        this.scope.tabSwitch = true;
        this.prepareTableData();
      }
		}

		this.scope.onTableRowSelectAction = (event) => {
			switch (this.scope.tabSelected.type){
				case 'segment':
					if (event.action.value === 'delete') {

					}
					break;
			}
		};

		this.scope.onTableRowClick = (event) => {
			this.scope.segmentName = event.$data.id;
			this.scope.detailModel.api.setSelectedRow(event.$data.id);
			switch (this.scope.tabSelected.type){
				case 'segment':
					if (!this.scope.initSegmentDetail) {
						this.initSegmentDetailPanel();
						this.scope.initSegmentDetail = true;
					}
					else {
						this.scope.segmentModel.vlanApi.queryUpdate();
						this.scope.segmentModel.vxlanApi.queryUpdate();
					}
					break;
			}
		};

		this.scope.onApiReady = ($api) => {
      this.scope.detailModel.api = $api;
    };

    this.scope.onVlanApiReady = ($api) => {
    	this.scope.segmentModel.vlanApi = $api;
    };

    this.scope.onVxlanApiReady = ($api) => {
    	this.scope.segmentModel.vxlanApi = $api;
    };
	}

	init() {
		this.scope.detailModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.getEntities(params).then((res) => {
          this.scope.tabSwitch = false;
          this.entityStandardization(res.data);
          defer.resolve({
            data: this.scope.detailModel.entities
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.detailModel.schema,
          index_name: this.getDataType().index_name,
          rowCheckboxSupport: this.getDataType().rowCheckboxSupport,
          rowActionsSupport: this.getDataType().rowActionsSupport,
          authManage: this.getDataType().authManage
        };
      }
    });
		this.scope.onTabChange(this.scope.tabs[0]);
	}

	prepareTableData() {
		this.scope.detailModel.schema = this.getSchema();
    this.scope.detailModel.actionsShow = this.getActionsShow();
    this.scope.detailModel.rowActions = this.getRowActions();
	}

	getEntities(params) {
		let defer = this.di.$q.defer();
    switch (this.scope.tabSelected.type) {
    	case 'segment':
        this.di.logicalDataManager.getTenantSegments(this.scope.tenantName).then((res) => {
          defer.resolve({'data': res.data.tenantSegments});
        });
      break;
    }
    return defer.promise;
	}

	entityStandardization(entities) {
		this.scope.detailModel.entities = [];
    switch (this.scope.tabSelected.type) {
    	case 'segment':
    		entities.forEach((entity) => {
    			let obj = {};
          obj['id'] = entity.name;
          obj['segment_name'] = entity.name;
          obj['type'] = entity.type;
          obj['value'] = entity.value;
          obj['ip_address'] = entity.ip_address;
          this.scope.detailModel.entities.push(obj);
    		});
    		break;
    }
	}

	getSchema() {
		let schema;
		switch(this.scope.tabSelected.type) {
			case 'segment':
				schema = this.di.logicalService.getTenantSegmentsSchema();
				break;
		}
		return schema;
	}

	getActionsShow() {
		let actions = [];
		switch(this.scope.tabSelected.type) {
			case 'segment':
				actions = this.di.logicalService.getTenantSegmentsActionsShow();
				break;
		}
		return actions;
	}

	getRowActions() {
		let actions = [];
		switch(this.scope.tabSelected.type) {
			case 'segment':
				actions = this.di.logicalService.getTenantSegmentsRowActions();
				break;
		}
		return actions;
	}

	getDataType() {
		let schema = {};
		 schema['authManage'] = {
      support: true,
      currentRole: this.scope.role
    };

    switch (this.scope.tabSelected.type) {
    	case 'segment':
        schema['index_name'] = 'id';
        schema['rowCheckboxSupport'] = true;
        schema['rowActionsSupport'] = true;
        break;
    }
    return schema;
	}

	initSegmentDetailPanel() {
		this.scope.segmentModel.vlanSchema = this.di.logicalService.getSegmentVlanSchema();
		this.scope.segmentModel.vxlanSchema = this.di.logicalService.getSegmentVxlanSchema();
		this.scope.segmentModel.actionsShow = this.di.logicalService.getSegmentVlanActionsShow();

		this.scope.segmentModel.vlanProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.logicalDataManager.getSegmentVlanMember(this.scope.tenantName, this.scope.segmentName).then((res) => {
        	let data = this.formatSegmentVLanData(res.data.segment_members);
          defer.resolve({
            data: data
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.segmentModel.vlanSchema,
          rowCheckboxSupport: false,
          rowActionsSupport: false
        };
      }
    });
    this.scope.segmentModel.vxlanProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.logicalDataManager.getSegmentVxlanMember(this.scope.tenantName, this.scope.segmentName).then((res) => {
        	let data = this.formatSegmentVxLanData(res.data);
          defer.resolve({
            data: data
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.scope.segmentModel.vxlanSchema,
          rowCheckboxSupport: false,
          rowActionsSupport: false
        };
      }
    });
	}

	formatSegmentVLanData(origins) {
		let result = [];
		origins.forEach((member) => {
			let device = this.scope.deviceObjects[member.device_id] || member.device_id;
			if (member.hasOwnProperty('ports')) {
				member.ports.forEach((port) => {
					result.push({
						'type': 'normal',
						'device': device,
						'port': port
					});
				});
			}
			if (member.hasOwnProperty('logical_ports')) {
				member.logical_ports.forEach((logical) => {
					result.push({
						'type': 'logical',
						'device': device,
						'logical_port': logical
					});
				});
			}
			if (member.hasOwnProperty('mac_based_vlans')) {
				member.mac_based_vlans.forEach((mac) => {
					result.push({
						'type': 'macbased',
						'device': device,
						'mac_based_vlan': mac
					});
				});
			}
		});
		return result;
	}

	formatSegmentVxLanData(origins) {
		let result = [];
		if (origins.hasOwnProperty('access_port')) {
			origins.access_port.forEach((port) => {
				result.push({
					'type': port.type,
					'name': port.name,
					'vlan': port.vlan,
					'device': port.switch && ((this.scope.deviceObjects[port.switch] || port.switch) + '/' + port.port) || '-',
					'server': port.server_mac
				});
			});
		}
		if (origins.hasOwnProperty('network_port')) {
			origins.network_port.forEach((port) => {
				port.ip_addresses.forEach((ip) => {
					result.push({
						'type': 'network port',
						'name': port.name,
						'ip_address': ip
					});
				});
			});
		}
		return result;
	}
}

TenantDetail.$inject = TenantDetail.getDI();
TenantDetail.$$ngIsClass = true;