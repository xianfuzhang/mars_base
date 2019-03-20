export class CreateHostController {
	static getDI() {
		return [
			'$scope',
      '$rootScope',
      '$filter',
      '_',
      '$modalInstance',
      'dataModel',
      'appService',
      'regexService'
		];
	}
	constructor(...args){
		this.di = {};
    CreateHostController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    /*this.MAC_REG = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/;
    this.INT_REG = /^[1-9]\d*|-[1-9]\d*$/;
    this.POSITIVE_INT_REG = /^[1-9]\d*$/;
    this.IP_REG = /^(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))$/;*/
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.addedReceiverModel = [];
    this.scope.model = {
      type: null,
      desc: null,
      mac: null,
      vlan: null,
      ip: null,
      ip_hint: false,
      location_hint: false,
      port: null,
      ipAddresses: [],
      locations: [],
      typeHelper: {
        'hint': this.translate('MODULES.ENDPOINT.CREATE.TYPE'),
        'options': this.di.appService.CONST.ENDPOINT_TYPE
      },
      descHelper: {
        id: 'descHelper',
        validation: 'false'
      },
      descDisplayLabel: {
        id: 'desc',
        hint: this.translate('MODULES.ENDPOINT.CREATE.DESC'),
        type: 'text',
        required: 'false'
      },
      macHelper: {
        id: 'macHelper',
        validation: 'false',
        content: this.translate('MODULES.ENDPOINT.CREATE.FORM.MAC.HELP')
      },
      macDisplayLabel: {
        id: 'mac',
        hint: 'MAC',
        type: 'text',
        regType: 'mac',
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
        regType: 'int',
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
            'regType': 'ip',
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
            'regType': 'positive_int',
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
      if (this.scope.model.endpointForm.$invalid || this.scope.canceled) {
        return;
      }
      if (this.validateIPLocation()) {
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
        description: this.scope.model.desc,
        type: this.scope.model.type.value,
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
    let invalid = false;

    this.scope.model.ip_hint = ips.length === 0 ? true : false;
    this.scope.model.location_hint = locations.length === 0  ? true : false;
    if(ips.length === 0 || locations.length === 0) {
      invalid = true;
    }
    if (!this.di.regexService.excute('mac', this.scope.model.mac)) {
      this.scope.model.macHelper.validation = 'true';
      invalid = true;
    }
    else {
      this.scope.model.macHelper.validation = 'false';
    }
    if (!this.di.regexService.excute('int', this.scope.model.vlan)){
      this.scope.model.vlanHelper.validation = 'true';
      invalid = true;
    }
    else {
      const value = this.scope.model.vlan;
      if ((value<= 0 && value != -1) || value >= 4095) {
        this.scope.model.vlanHelper.validation = 'true';
        invalid = true;   
      }
      else {
        this.scope.model.vlanHelper.validation = 'false';  
      }
    }
    for(let i=0; i< ips.length; i++) {
      if (!this.di.regexService.excute('ip', ips[i].ip)) {
        ips[i].ipHelper.validation = 'true';
        invalid = true;
      }
      else {
        ips[i].ipHelper.validation = 'false';
      }
    }
    for(let j=0; j< locations.length; j++) {
      if (!this.di.regexService.excute('positive_int', locations[j].port)) {
        locations[j].portHelper.validation = 'true';
        invalid = true;
      }
      else {
        locations[j].portHelper.validation = 'false';
      }
    }
    return invalid;
  }
}
CreateHostController.$inject = CreateHostController.getDI();
CreateHostController.$$ngIsClass = true;