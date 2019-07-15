export class CreateEndpointController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '_',
      '$modalInstance',
      'dataModel',
      'regexService'
    ];
  }
  constructor(...args){
    this.di = {};
    CreateEndpointController.getDI().forEach((value, index) => {
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
      mac: null,
      segment: null,
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
        required: 'true'
      }
    };
    this.scope.segmentSelect = {
      'hint': 'Segment',//this.translate('MODULES.ENDPOINT.CREATE.TENANT'),
      'options': this.di.dataModel.segments
    };
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
            'regType': 'ip',
            'required': 'true'
          }
        }
      )
      this.scope.ipIndex++;
    };

    this.scope.addLocation = () =>{
      let devices = [], ports = [],
        segment = this.scope.model.segment.label,
        segmentLocations = angular.copy(this.di.dataModel.locations[segment]);

      /*for(let i =0; i< this.scope.addedReceiverModel.length; i++) {
        if (this.scope.addedReceiverModel[i]['type'] === 'location') {
          let addedDeviceId = this.scope.addedReceiverModel[i]['device']['value'],
            addedDevicePort = this.scope.addedReceiverModel[i]['port']['value'],
            index = segmentLocations[addedDeviceId].indexOf(addedDevicePort);
          if (index > -1) {
            segmentLocations[addedDeviceId].splice(index, 1);
          }
        }
      }*/
      for(let key in segmentLocations) {
        if (segmentLocations[key].length > 0) {
          devices.push({
            'label': this.di.dataModel.devices[key] || key,
            'value': key
          });  
        }
      }
      if (devices.length === 0) return;

      segmentLocations[devices[0]['value']].forEach((port) => {
        ports.push({
          'label': port,
          'value': port
        });
      });

      this.scope.addedReceiverModel.push(
        {
          'type':'location', 
          'label': this.translate('MODULES.ENDPOINT.CREATE.BUTTON.LOCATION'),
          'device': devices[0],
          'port': ports[0],
          'deviceOptions': {
            'hint': this.translate('MODULES.ENDPOINT.CREATE.LOCATION.DEVICE'),
            'options': devices
          },
          'portOptions': {
            'hint': this.translate('MODULES.ENDPOINT.CREATE.LOCATION.PORT'),
            'options': ports
          }
        }
      );
      this.scope.locationIndex++;
    };

    this.scope.changeSegment = (value) => {
      //console.log('change segment...' + value);
      if (this.scope.addedReceiverModel.length > 0) {
        this.scope.addedReceiverModel = [];
      }
      this.scope.ipIndex = 0;
      this.scope.locationIndex = 0;
    };

    this.scope.changeDevice = (value, receiver) => {
      let deviceId = value.value, port = null, portOptions = [];
      this.di.dataModel.locations[this.scope.model.segment.label][deviceId].forEach((port) => {
        portOptions.push({
          'label': port,
          'value': port
        });
      });
      receiver.portOptions.options = portOptions;
      receiver.port = portOptions[0];
    };

    this.scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    this.scope.save = (event) =>{
      let invalid = false;
      if (this.validateMACIPLocation()) return;
      if (this.scope.model.endpointForm.$invalid || this.scope.canceled) {
        return;
      }
      let ips = [], locations = [];
      for(let i=0; i< this.scope.addedReceiverModel.length; i++) {
        if (this.scope.addedReceiverModel[i].type === 'ip') {
          ips.push(this.scope.addedReceiverModel[i].ip);
        }
        else if (this.scope.addedReceiverModel[i].type === 'location') {
          let location = {
            'device_id': this.scope.addedReceiverModel[i].device.value, 
            'port': this.scope.addedReceiverModel[i].port.value
          };
          if (this.di._.findIndex(locations, {'device_id': location.device_id, 'port': location.port}) === -1) {
            locations.push(location);  
          }
        }
      }
      let data = {
        tenant: this.scope.model.segment.value.tenant,
        mac: this.scope.model.mac,
        segment: this.scope.model.segment.value.segment,
        ip_addresses: ips,
        locations: locations
      };
      this.di.$modalInstance.close({
        canceled: this.scope.canceled,
        result: data
      });
      this.scope.canceled = true;
    };
  }

  validateMACIPLocation() {
    let ips = this.di._.filter(this.scope.addedReceiverModel, {'type': 'ip'});
    let locations = this.di._.filter(this.scope.addedReceiverModel, {'type': 'location'});
    let invalid = false;
    this.scope.model.ip_hint = ips.length === 0 ? true : false;
    this.scope.model.location_hint = locations.length === 0  ? true : false;
    if(ips.length === 0 || locations.length === 0) {
      invalid = true;
    }
    if (!this.di.regexService.excute('mac', this.scope.model.mac)) {
      invalid = true;  
      this.scope.model.macHelper.validation = 'true';
    }
    else {
      this.scope.model.macHelper.validation = 'false';
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
    return invalid;
  }
}
CreateEndpointController.$inject = CreateEndpointController.getDI();
CreateEndpointController.$$ngIsClass = true;