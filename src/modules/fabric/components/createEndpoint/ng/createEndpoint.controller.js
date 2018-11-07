export class CreateEndpointController {
	static getDI() {
		return [
			'$scope',
      '$rootScope',
      '$filter',
      '_',
      '$modalInstance',
      'dataModel'
		];
	}
	constructor(...args){
		this.di = {};
    CreateEndpointController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.MAC_REG = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/;
    this.INT_REG = /^[1-9]\d*|-[1-9]\d*$/;
    this.POSITIVE_INT_REG = /^[1-9]\d*$/;
    this.IP_REG = /^(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))$/;
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.addedReceiverModel = [];
    this.scope.model = {
      mac: null,
      vlan: null,
      ip: null,
      ip_hint: false,
      location_hint: false,
      port: null,
      ipAddresses: [],
      locations: [],
      macHelper: {
        id: 'macHelper',
        validation: 'false',
        content: this.translate('MODULES.ENDPOINT.CREATE.FORM.MAC.HELP')
      },
      macDisplayLabel: {
        id: 'mac',
        hint: 'MAC',
        type: 'text',
        required: 'true'
      },
      vlanHelper: {
        id: 'vlanHelper',
        validation: 'false',
        content: this.translate('MODULES.ENDPOINT.CREATE.FORM.VLAN.HELP')
      },
      vlanDisplayLabel: {
        id: 'vlan',
        hint: 'VLAN',
        type: 'text',
        required: 'true'
      }
    };
  
    this.scope.deviceSelect = {
      'hint': this.translate('MODULES.ENDPOINT.CREATE.LOCATION.DEVICE'),
      'options': this.di.dataModel.devices
    }
    this.scope.canceled = false;
    this.scope.ipIndex = 0;
    this.scope.locationIndex = 0;
    this.scope.removeReceiver = (rec) =>{
      let index = this.scope.addedReceiverModel.indexOf(rec);
      this.scope.addedReceiverModel.splice(index, 1);
    };

    this.scope.addIP = () =>{
      this.scope.addedReceiverModel.push(
        {
          'type':'ip', 
          'label': 'IP',
          'ip': null,
          'ipHelper': {
            'id': 'ipHelper' + this.scope.ipIndex,
            'validation': 'false',
            'content': this.translate('MODULES.ENDPOINT.CREATE.FORM.IP.HELP')
          },
          'ipDisplayLabel': {
            'id': 'ip' + this.scope.ipIndex,
            'hint': 'IP',
            'type': 'text',
            'required': 'true'
          }
        }
      )
      this.scope.ipIndex++;
    };

    this.scope.addLocation = () =>{
      this.scope.addedReceiverModel.push(
        {
          'type':'location', 
          'label': this.translate('MODULES.ENDPOINT.CREATE.BUTTON.LOCATION'),
          'location': this.di.dataModel.devices[0],
          'port': null,
          'portHelper': {
            'id': 'portHelper' + this.scope.locationIndex,
            'validation': 'false',
            'content': this.translate('MODULES.ENDPOINT.CREATE.FORM.PORT.HELP')
          },
          'portDisplayLabel': {
            'id': 'port'  + this.scope.locationIndex,
            'hint': this.translate('MODULES.ENDPOINT.CREATE.FORM.PORT'),
            'type': 'text',
            'required': 'true'
          }
        }
      );
      this.scope.locationIndex++;
    };

    this.scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    this.scope.save = (event) =>{
      let invalid = false;
      if (this.scope.model.endpointForm.$invalid || this.scope.canceled) {
        return;
      }
      if (!this.scope.model.mac || this.regExp('mac', this.scope.model.mac)) {
        this.scope.model.macHelper.validation = 'true';
        invalid = true;
      }
      else {
        this.scope.model.macHelper.validation = 'false';
      }
      if (!this.scope.model.vlan || this.regExp('int', this.scope.model.vlan)){
        this.scope.model.vlanHelper.validation = 'true';
        invalid = true;
      }
      else {
        this.scope.model.vlanHelper.validation = 'false';
      }
      invalid = this.validateIPLocation();
     
      if (invalid) {
        return;
      }

      let ips = [], locations = [];
      for(let i=0; i< this.scope.addedReceiverModel.length; i++) {
        if (this.scope.addedReceiverModel[i].type === 'ip') {
          ips.push(this.scope.addedReceiverModel[i].ip);
        }
        else if (this.scope.addedReceiverModel[i].type === 'location') {
          locations.push({
            'elementId': this.scope.addedReceiverModel[i].location.value, 
            'port': this.scope.addedReceiverModel[i].port
          });
        }
      }
      let data = {
        mac: this.scope.model.mac,
        vlan: this.scope.model.vlan,
        ipAddresses: ips,
        locations: locations
      };
      this.di.$modalInstance.close({
        canceled: this.scope.canceled,
        result: data
      });
      this.scope.canceled = true;
    };
	}

  validateIPLocation() {
    let ips = this.di._.filter(this.scope.addedReceiverModel, {'type': 'ip'});
    let locations = this.di._.filter(this.scope.addedReceiverModel, {'type': 'location'});

    this.scope.model.ip_hint = ips.length === 0 ? true : false;
    this.scope.model.location_hint = locations.length === 0  ? true : false;
    if(ips.length === 0 || locations.length === 0) {
      return true;
    }
    let invalid = false;
    for(let i=0; i< ips.length; i++) {
      if (!ips[i].ip || this.regExp('ip', ips[i].ip)) {
        ips[i].ipHelper.validation = 'true';
        invalid = true;
      }
      else {
        ips[i].ipHelper.validation = 'false';
      }
    }
    for(let j=0; j< locations.length; j++) {
      if (!locations[j].port || this.regExp('positive_int', locations[j].port)) {
        locations[j].portHelper.validation = 'true';
        invalid = true;
      }
      else {
        locations[j].portHelper.validation = 'false';
      }
    }
    return invalid;
  }

  regExp(type, value) {
    let invalid = true;
    switch (type){
      case 'mac':
        invalid = !this.MAC_REG.test(value);
        break;
      case 'int':
        invalid = !this.INT_REG.test(value);
        if (!invalid && ((value<= 0 && value != -1) || value >= 4095)) {
          invalid = true;
        }
        break;
      case 'positive_int':
        invalid = !this.POSITIVE_INT_REG.test(value);
        break;  
      case 'ip':
        invalid = !this.IP_REG.test(value);
        break;
    }
    return invalid;
  }
}
CreateEndpointController.$inject = CreateEndpointController.getDI();
CreateEndpointController.$$ngIsClass = true;