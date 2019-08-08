export class VlanAllController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$filter',
      '$q',
      '$log',
      '$location',
      'roleService',
      'dialogService',
      'appService',
      'applicationService',
      'notificationService',
      'tableProviderFactory',
      'functionDataManager',
      'deviceDataManager',
      'deviceService',
      'topoManageService',
      'functionService'
    ];
  }

  constructor(...args) {
    this.di = {};
    VlanAllController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    scope.role = this.di.roleService.getRole();
    scope.page_title = 'VLAN';
    scope._page_title = 'VLAN';

    scope.menuSelected = null;
    scope.page_menus = this.di.topoManageService.getVlanMenuSchema();

    scope.onMenuChange = (tab) => {
      scope.menuSelected = tab;
      scope.page_title = scope._page_title + ' - ' + tab.label;
    };

    scope.menuSelected = scope.page_menus[0];
    scope.onMenuChange(scope.page_menus[0]);


    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }

}

VlanAllController.$inject = VlanAllController.getDI();
VlanAllController.$$ngIsClass = true;