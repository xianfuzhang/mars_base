export class dialogCtrl {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$uibModalInstance',
      'dataModel',
    ];
  }
  constructor(...args) {
    this.di = {};
    dialogCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = args[0];
    this.i18n = this.di.$filter('translate');

    this.scope.canceled = () => {
      this.di.$uibModalInstance.close();
    };

    this.scope.ok = () => {
      this.di.$uibModalInstance.close('ok');
    };

    this.init();
  }

  init() {
    let data = this.di.dataModel;
    this.scope.type = data && data.type || 'warning';
    this.scope.header = data && data.headerText || '';
    this.scope.content = data && data.contentText || '';
    this.scope.confirmation = data && data.confirmationText || this.i18n('COMPONENT.MDC.DIALOG.ACCEPT');
    this.scope.cancel = data && data.cancelText || this.i18n('COMPONENT.MDC.DIALOG.CANCEL');

    this.scope.infoStyle = data&&data.isInfoNotJson ? {"white-space":"normal"}:{};
  }
}

dialogCtrl.$inject = dialogCtrl.getDI();
dialogCtrl.$$ngIsClass = true;