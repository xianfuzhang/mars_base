export class CreateVoiceVlanDialogController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$modalInstance',
      '_',
      'dataModel',
      'vlanDataManager',
    ];
  }
  constructor(...args){
    this.di = {};
    CreateVoiceVlanDialogController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let scope = this.di.$scope;
    const DI = this.di;
    this.translate = this.di.$filter('translate');
    let unsubscribers = []

    let deviceOptions = [];
    this.di.dataModel.devices.forEach((device) => {
      deviceOptions.push({label: device.name, value: device.id});
    })

    scope.model = {
      deviceOptions: deviceOptions,
      selectedDevice: deviceOptions.length ? deviceOptions[0] : {},
      vlanOptions: [],
      selectedVlan: {},
      aging: "1440",
      agingEnable: true,
      status: 'enable'
    };

    scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    scope.save = (event) =>{
      let data = {
        device_id: scope.model.selectedDevice.value,
        vlan: scope.model.selectedVlan.value,
        aging: parseInt(scope.model.aging),
        status: scope.model.status
      };

      this.di.$modalInstance.close({
        canceled: scope.canceled,
        result: data
      });
      scope.canceled = true;
    };

    unsubscribers.push(scope.$watch('model.selectedDevice', (newValue, oldValue) => {
      if(!newValue || !newValue.value) {
        scope.model.vlanOptions = []
        return;
      }

      this.di.vlanDataManager.getVlanConfigByDeviceId(scope.model.selectedDevice.value).then((res) => {
        scope.model.vlanOptions = []
        let ports = res.data.ports;
        let vlans = [];
        ports.forEach((port) => {
          port.vlans.forEach((vlan) => {
            let vlanConfig = vlan.split('/')
            let vlanId = vlanConfig[0]
            if(vlans.indexOf(vlanId) == -1) {
              vlans.push(vlanId);
              scope.model.vlanOptions.push({
                label: vlanId,
                value: vlanId
              })
            }
          })
        })

        scope.model.vlanOptions = DI._.sortBy(scope.model.vlanOptions, (option) => {
          return option.value;
        })
        scope.model.selectedVlan = scope.model.vlanOptions.length ? scope.model.vlanOptions[0] : {}
      })
    }, true))

    unsubscribers.push(scope.$watch('model.aging', () => {
      let intRegex = '^\d$|^[1-9]+[0-9]*$';
      if(!scope.model.aging) return;

      if(scope.model.aging.match(intRegex)) {
        let aging = parseInt(scope.model.aging)
        if(aging < 5 || aging > 43200) {
          scope.model.agingValid = false;
        } else {
          scope.model.agingValid = true;
        }
      } else {
        scope.model.agingValid = false;
      }
    }, true));

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}
CreateVoiceVlanDialogController.$inject = CreateVoiceVlanDialogController.getDI();
CreateVoiceVlanDialogController.$$ngIsClass = true;