export class CreateIntentController {
	static getDI() {
		return [
			'$scope',
      '$rootScope',
      '$filter',
      '_',
      'intentDataManager',
      '$modalInstance',
      'dataModel'
		];
	}
	constructor(...args){
		this.di = {};
    CreateIntentController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unsubscribes = [];
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.POSITIVE_INT_REG = /^[1-9]\d*$/;
    this.scope.canceled = false;
    this.scope.typesLabel = {
      hint: this.translate('MODULES.INTENT.COLUMN.TYPE'),
      options: [
        //{'label': '端点到端点', 'value': 'HostToHostIntent'},
        //{'label': '端口到端口', 'value': 'PointToPointIntent'}
      ]
    };
    this.scope.srcDevicesLabel = {
      hint: this.translate('MODULES.INTENT.COLUMN.SRC_END'),
      options: []
    };
    this.scope.dstDevicesLabel = {
      hint: this.translate('MODULES.INTENT.COLUMN.DST_END'),
      options: []
    };
    this.scope.srcEndpointsLabel = {
      hint: this.translate('MODULES.INTENT.COLUMN.SRC_END'),
      options: []
    }
    this.scope.dstEndpointsLabel = {
      hint: this.translate('MODULES.INTENT.COLUMN.DST_END'),
      options: []
    };
    this.scope.model = {
      type: null,
      srcHost: {},
      srcHostStatus: false,
      dstHost: {},
      srcDeviceStatus: false,
      ingressDevice: {},
      egressDevice: {},
      ingressPort: null,
      egressPort: null,
      ingressPortDisplayLabel: {
        id: 'ingressPort',
        hint: this.translate('MODULES.ENDPOINT.CREATE.FORM.PORT'),
        regType: 'positive_int',
        type: 'text',
        required: 'true'
      },
      ingressPortHelper: {
        id: 'ingressPortHelper',
        validation: 'false',
        content: this.translate('MODULES.ENDPOINT.CREATE.FORM.PORT.HELP')
      },
      egressPortDisplayLabel: {
        id: 'egressPort',
        hint: this.translate('MODULES.ENDPOINT.CREATE.FORM.PORT'),
        regType: 'positive_int',
        type: 'text',
        required: 'true'
      },
      egressPortHelper: {
        id: 'egressPortHelper',
        validation: 'false',
        content: this.translate('MODULES.ENDPOINT.CREATE.FORM.PORT.HELP')
      }
    };
    
    this.scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    this.scope.save = (event) =>{
      let data = {};
      if (this.scope.host_type) {
        let src_mac = this.scope.model.srcHost.value,
            dst_mac = this.scope.model.dstHost.value,
            srcEndpoint = this.di._.find(this.di.dataModel.endpoints, {'mac': src_mac}),
            dstEndpoint = this.di._.find(this.di.dataModel.endpoints, {'mac': dst_mac}),
            src_vlan = srcEndpoint && (srcEndpoint.segment === 'unknown' ? -1 : srcEndpoint.segment) || -1,
            dst_vlan = dstEndpoint && (dstEndpoint.segment === 'unknown' ? -1 : dstEndpoint.segment) || -1;

        data['one'] = src_mac + '/' + src_vlan;
        data['two'] = dst_mac + '/' + dst_vlan;
      }
      else {
        let invalid = false;
        if (!this.scope.model.ingressPort || !this.POSITIVE_INT_REG.test(this.scope.model.ingressPort)) {
          this.scope.model.ingressPortHelper.validation = 'true';
          invalid = true;
        }
        else {
          this.scope.model.ingressPortHelper.validation = 'false';   
        }
        if (!this.scope.model.egressPort || !this.POSITIVE_INT_REG.test(this.scope.model.egressPort)) {
          this.scope.model.egressPortHelper.validation = 'true';
          invalid = true;
        }
        else {
          this.scope.model.egressPortHelper.validation = 'false';   
        }
        if (invalid) return;
        data['ingressPoint'] = {}, data['egressPoint'] = {};
        data['ingressPoint']['device'] = this.scope.model.ingressDevice.value;
        data['ingressPoint']['port'] = this.scope.model.ingressPort;
        data['egressPoint']['device'] = this.scope.model.egressDevice.value;
        data['egressPoint']['port'] = this.scope.model.egressPort;;
      }
      data['type'] = this.scope.model.type.value;
      data['appId'] = 'org.onosproject.ovsdb';
      data['priority'] = 55;

      this.di.$modalInstance.close({
        canceled: this.scope.canceled,
        result: data
      });
      this.scope.canceled = true;
    };

    this.scope.typeChange = ($value) => {
      this.scope.host_type = $value.value === 'HostToHostIntent' ? true : false;
    };

    this.init();

    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
	}

  init() {
    let from = this.di.dataModel.from,
        devices = this.di.dataModel.devices || [],
        endpoints = this.di.dataModel.endpoints || [],
        srcHost = this.di.dataModel.srcHost || null,
        srcDevice = this.di.dataModel.srcDevice || null;

    if ((from ==='intent' || from ==='endpoint') && endpoints.length >0) {
      this.scope.typesLabel.options.push({'label': '端点到端点', 'value': 'HostToHostIntent'});
      let options = [];
      endpoints.forEach((endpoint) => {
        options.push({'label': endpoint.id, 'value': endpoint.mac});        
      });
      this.scope.srcEndpointsLabel.options = options;
      this.scope.dstEndpointsLabel.options = options;
      if (from === 'endpoint') {
        this.scope.model.srcHostStatus = true;
        this.scope.model.srcHost['label'] = (srcHost && srcHost.mac) || options[0].label;
        this.scope.model.srcHost['value'] = (srcHost && srcHost.mac) || options[0].value;
      }
      else {
        this.scope.model.srcHost = options[0];  
      }
      this.scope.model.dstHost = options[0];
    }
    if ((from ==='intent' || from ==='device') && devices.length >0) {
      this.scope.typesLabel.options.push({'label': '端口到端口', 'value': 'PointToPointIntent'});
      let options = [];
      devices.forEach((device) => {
        options.push({'label': device.name, 'value': device.id});
      });
      this.scope.srcDevicesLabel.options = options;
      this.scope.dstDevicesLabel.options = options;
      if (from === 'device') {
        this.scope.model.srcDeviceStatus = true;
        this.scope.model.ingressDevice['label'] = (srcDevice && srcDevice.switch_name) || options[0].label;
        this.scope.model.ingressDevice['value'] = (srcDevice && srcDevice.id) || options[0].label;
      }
      else {
        this.scope.model.ingressDevice = options[0];  
      }
      this.scope.model.egressDevice = options[0];
    }
    this.scope.model.type = this.scope.typesLabel.options[0].value;
    this.scope.host_type = this.scope.model.type === 'HostToHostIntent' ? true : false;
  }
}
CreateIntentController.$inject = CreateIntentController.getDI();
CreateIntentController.$$ngIsClass = true;