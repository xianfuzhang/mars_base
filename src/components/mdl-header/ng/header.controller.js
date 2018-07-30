export class headerController{
  static getDI() {
    return [
      '$log',
      '$scope',
      '$cookies',
      '$location',
      '_',
      'appService',
      'loginDataManager'
    ];
  }

  constructor(...args){
    this.di= {};
    headerController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.CONST_ADMIN_GROUP = this.di.appService.CONST.ADMIN_GROUP;
    this.scope.groups = this.di.appService.CONST.HEADER;

    this.scope.location = (url, event) => {
      event && event.stopPropagation();
      if (url === '/logout') {
        this.di.loginDataManager.doLogout();
      }
      this.di.$location.path(url);
    };

    this.init();
  }

  init() {
    this.di.$log.info('mdl-header controller func');
    this.scope.userConfig = angular.copy(this.scope.groups.user.items);
    let useraccount = this.di.$cookies.get('useraccount');
    if (!useraccount || JSON.parse(useraccount).groups.indexOf(this.CONST_ADMIN_GROUP) === -1) {
      this.scope.userConfig.splice(0, 1);
    }
  }
}

headerController.$inject = headerController.getDI();
headerController.$$ngIsClass = true;