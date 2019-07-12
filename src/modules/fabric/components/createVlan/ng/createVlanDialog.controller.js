export class CreateVlanDialogController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$modalInstance',
      'dataModel',
    ];
  }
  constructor(...args){
    this.di = {};
    CreateVlanDialogController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    let unsubscribers = []

    const modeOptions = [{label: 'access', value: 'access'}, {label: 'trunk', value: 'trunk'}, {label: 'hybrid', value: 'hybrid'}]

    let membership_type, selectedMode;
    switch(this.di.dataModel.portMode) {
      case '':
        selectedMode = modeOptions[0];
        membership_type = 'untag';
        break;
      case 'access':
        selectedMode = {label: 'access', value: 'access'}
        membership_type = 'untag';
        break;
      case 'trunk':
        selectedMode = {label: 'trunk', value: 'trunk'}
        membership_type = 'tag';
        break;
      default:
        selectedMode = {label: 'hybrid', value: 'hybrid'};
        membership_type = 'tag';
    }

    scope.model = {
      vlanRegex: '^([1-9]+[0-9]*)(,[1-9]+[0-9]*)*$',
      nativeVlanRegex: '^[1-9]+[0-9]*$',
      vlan: '',
      nativeVlan: '',
      mode: this.di.dataModel.portMode,
      membership_type: membership_type,
      saveBtnDisabled: true
    };

    scope.canceled = false;

    scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    scope.save = (event) =>{
      let vlans = scope.model.vlan.split(',');
      let data = {
        vlans: vlans,
        membership_type: scope.model.membership_type
      };

      this.di.$modalInstance.close({
        canceled: scope.canceled,
        result: data
      });
      scope.canceled = true;
    };

    unsubscribers.push(scope.$watch('model.vlan', () => {
      let regexStr = scope.model.mode == 'access' ? scope.model.nativeVlanRegex : scope.model.vlanRegex
      if(!scope.model.vlan.match(regexStr)) {
        scope.model.saveBtnDisabled = true;
      } else {
        scope.model.saveBtnDisabled = false;
      }
    }, true))

    // unsubscribers.push(scope.$watch('model.selectedMode', () => {
    //   if(scope.model.selectedMode.value == 'access') {
    //     scope.model.membership_type = 'untag';
    //   } else if(scope.model.selectedMode.value == 'trunk') {
    //     scope.model.membership_type = 'tag';
    //   }
    // }, true))

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}
CreateVlanDialogController.$inject = CreateVlanDialogController.getDI();
CreateVlanDialogController.$$ngIsClass = true;