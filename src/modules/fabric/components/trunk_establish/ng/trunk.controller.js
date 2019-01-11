export class TrunkController {
  static getDI() {
    return [
      '$scope',
      '$rootScope'
    ];
  }

  constructor(...args) {
    this.di = {};
    TrunkController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.edit = false;
    this.scope.showWizard = false;
    this.scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/trunk'),
      }
    ];

    this.initActions();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('trunk-wizard-show', ($event, data) => {
      this.scope.edit = data.edit || false;
      this.scope.open(data);
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  initActions() {
    this.scope.open = (data)  => {
      if(this.scope.showWizard) return;
      this.scope.title = this.scope.edit ? '修改端口聚合' : '创建端口聚合';
      this.scope.showWizard = true;
    };

    this.scope.submit = () => {
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    this.scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };
  }
}
TrunkController.$inject = TrunkController.getDI();
TrunkController.$$ngIsClass = true;