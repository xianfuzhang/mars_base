export class RoleService {
  static getDI() {
    return [
      'localStoreService',
      'appService'
    ];
  }

  constructor(...args) {
    this.di = {};
    RoleService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getRole() {
    if (!this.role) {
      if(this.di.localStoreService.getSyncStorage().get('menus')) {
        let menu = this.di.localStoreService.getSyncStorage().get('menus');
        this.role = menu.role;
      }
      else {
        this.role = 1;
      }  
    }
    return this.role;
  }

  clearRole() {
    this.role = null;
  }
}
RoleService.$inject = RoleService.getDI();
RoleService.$$ngIsClass = true;  