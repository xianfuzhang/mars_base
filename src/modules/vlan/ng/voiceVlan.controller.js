export class VoiceVlanCtrl{
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
    VoiceVlanCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.model = {
      'actionsShow': this.di.vlanService.getVoiceVlanTableActionsShow(),
      'rowActions': this.di.vlanService.getVoiceVlanTableRowActions(),
      'provider': null,
      'deviceMap': {},
      'voiceVlanMap': {}
    };
    this.scope.role = this.di.roleService.getRole();

    this.scope.onAPIReady = ($api) => {
      this.scope.model.API = $api;
    };

    this.scope.addVoiceVlan = () => {
      this.scope.$emit('gestVlan-wizard-show');
    };

    this.scope.batchRemoveVoiceVlan = (arr) => {
      this.di.dialogService.createDialog('warning', this.di.$filter('translate')("MODULES.VLAN.GUEST.DIALOG.CONTENT.BATCH_DELETE"))
        .then(() =>{
          this.batchDeleteVoiceVlans(arr);
        }, () => {

        });
    };

    this.scope.onTableRowClick = ($event) => {
      this.scope.model.API.setSelectedRow($event.$data.id);
    };

    this.scope.onTableRowSelectAction = (event) => {
      if (event.action.value === 'delete') {
        let port = event.data.port, deviceId = event.data.device_id,
            params = {'devices': []}, voice = {"device-id": deviceId, "voicevlans": []};
        for (let p in this.scope.model.voiceVlanMap[deviceId]) {
          let vlanId = p == port ? 0 : this.scope.model.voiceVlanMap[deviceId][p];
          voice.voicevlans.push({
            'port': p,
            'voiceVlan': vlanId
          });
        }
        params.devices.push(voice);
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
    unsubscribes.push(this.di.$rootScope.$on('voice-vlan-list-refresh', () => {
      this.scope.model.API.queryUpdate();
    }));
    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => cb());
    });
  }

  init() {
    this.di.deviceDataManager.getDeviceConfigs().then((devices)=>{
      devices.forEach((device) => {
        this.scope.model.deviceMap[device.id]  = device.name;
      });
    });

    this.scope.model.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();

        this.di.vlanDataManager.getVoiceVlanConfig().then((res)=>{
          this.scope.model.voiceVlanMap = this.getVoiceVlanMap(res.data.devices);
          this.scope.entities = this.getEntities();
          defer.resolve({
            data: this.scope.entities
          });
        });

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.vlanService.getVoiceVlanTableSchema(),
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

  getVoiceVlanMap(devices) {
    let voiceVlanMap = {}
    devices.forEach((device) => {
      voiceVlanMap[device['device-id']] = {
        'device_id': device['device-id'],
        'device_name': this.scope.model.deviceMap[device['device-id']] || device['device-id'],
        'basic': device.basic,
        'ports': device.ports,
        'ouis': device.ouis
      }
    })

    return voiceVlanMap
  }

  getEntities(devices) {
    let result = [];
    for(let key of Object.keys(this.scope.model.voiceVlanMap)) {
      result.push({
        'device_id': this.scope.model.voiceVlanMap[key]['device-id'],
        'device_name': this.scope.model.deviceMap[key] || key,
        'vlan_id': this.scope.model.voiceVlanMap[key].basic.vlan,
        'aging': this.scope.model.voiceVlanMap[key].basic.aging,
        'status': this.scope.model.voiceVlanMap[key].basic.status === 'enable' ? 'done' : 'not_interested'
      });
    };

    return result;
  }

  batchDeleteVoiceVlans(arr) {
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
      let voice = {"device-id": key, "voicevlans": []};
      for (let port in this.scope.model.voiceVlanMap[key]) {
        if (this.scope.model.voiceVlanMap[key][port] > 0) {
          let vlanId = devices[key]['ports'].indexOf(parseInt(port)) === -1 ? this.scope.model.voiceVlanMap[key][port] : 0;
          voice["voicevlans"].push({
            'port': port,
            'voiceVlan': vlanId
          });
        }
      }
      params.devices.push(voice);
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
VoiceVlanCtrl.$inject = VoiceVlanCtrl.getDI();
VoiceVlanCtrl.$$ngIsClass = true;