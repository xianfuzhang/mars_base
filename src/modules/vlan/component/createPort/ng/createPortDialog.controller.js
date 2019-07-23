export class CreatePortDialogController {
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
    CreatePortDialogController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let scope = this.di.$scope;
    const DI = this.di;
    this.translate = this.di.$filter('translate');
    let unsubscribers = []

    scope.ruleOptions = [
      {'label': 'oui', 'value': 'oui'},
      {'label': 'lldp', 'value': 'lldp'},
      {'label': 'oui/lldp', 'value': 'oui/lldp'},
    ]

    scope.priorityOptions = [
      {'label': '0', 'value': 0},
      {'label': '1', 'value': 1},
      {'label': '2', 'value': 2},
      {'label': '3', 'value': 3},
      {'label': '4', 'value': 4},
      {'label': '5', 'value': 5},
      {'label': '6', 'value': 6}
    ]

    scope.modeOptions = [
      {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.MODE.MANUAL"), 'value': 'manual'},
      {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.MODE.AUTO"), 'value': 'auto'},
      {'label': this.translate("MODULES.VLAN.VOICE.TABLE.COLUMN.MODE.NONE"), 'value': 'none'}
    ]

    scope.model = {
      selectedPort: {},
      security: true,
      selectedRule: scope.ruleOptions[0],
      selectedPriority: scope.priorityOptions[6],
      selectedMode: scope.modeOptions[0],
    };

    let portOptions = [];
    this.di.vlanDataManager.getVlanConfigByDeviceId(DI.dataModel.device.device_id).then((res) => {
      res.data.ports.forEach((port) => {
        let foundVlan = port.vlans.find((vlanStr) => {
          let vlanArr = vlanStr.split('/')
          return vlanArr[0] == DI.dataModel.device.basic.vlan
        })

        let foundPort = DI._.find(DI.dataModel.device.ports, (vlanPort) => {
          return vlanPort.port == port.port
        })

        if(foundVlan && !foundPort) {
          portOptions.push({
            label: port.port,
            value: parseInt(port.port)
          })
        }
      })

      scope.portOptions = DI._.sortBy(portOptions, (option) => {
        return option.value
      })
      scope.model.selectedPort = scope.portOptions[0]
    })

    scope.securityAction = [
      {
        id: 'check_1',
        label: this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.SECURITY.ENABLE'),
        name: 'security',
        value: true
      },{
        id: 'check_2',
        label: this.translate('MODULES.VLAN.VOICE.TABLE.COLUMN.SECURITY.DISABLE'),
        name: 'security',
        value: false
      }
    ]
    scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    scope.save = (event) =>{
      let data = {
        port: scope.model.selectedPort.value,
        security: scope.model.security,
        priority: scope.model.selectedPriority.value,
        rule: scope.model.selectedRule.value,
        mode: scope.model.selectedMode.value
      };

      this.di.$modalInstance.close({
        canceled: scope.canceled,
        result: data
      });
      scope.canceled = true;
    };

    unsubscribers.push(scope.$watch('model.selectedDevice', (newValue, oldValue) => {


    }, true))

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}
CreatePortDialogController.$inject = CreatePortDialogController.getDI();
CreatePortDialogController.$$ngIsClass = true;