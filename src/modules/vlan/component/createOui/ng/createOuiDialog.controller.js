export class CreateOuiDialogController {
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
    CreateOuiDialogController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let scope = this.di.$scope;
    const DI = this.di;
    this.translate = this.di.$filter('translate');
    let unsubscribers = []

    scope.model = {
      macAddress: '',
      maskAddress: '',
      description: ''
    };

    scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    scope.save = (event) =>{
      let data = {
        macAddress: scope.model.macAddress,
        maskAddress: scope.model.maskAddress,
        description: scope.model.description
      };

      this.di.$modalInstance.close({
        canceled: scope.canceled,
        result: data
      });
      scope.canceled = true;
    };

    unsubscribers.push(scope.$watchGroup(['model.macAddress', 'model.maskAddress'], (newValue, oldValue) => {
      let regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';

      if(scope.model.macAddress.match(regex) && scope.model.maskAddress.match(regex)) {
        scope.model.inputValid = true;
      } else {
        scope.model.inputValid = false;
      }
    }, true))

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}
CreateOuiDialogController.$inject = CreateOuiDialogController.getDI();
CreateOuiDialogController.$$ngIsClass = true;