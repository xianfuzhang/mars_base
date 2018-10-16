export class headerController{
  static getDI() {
    return [
      '$log',
      '$scope',
      '$cookies',
      '$location',
      '_',
      'crypto',
      'appService',
      'loginDataManager',
      'alertDataManager',
    ];
  }

  constructor(...args){
    this.di= {};
    headerController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.CONST_ADMIN_GROUP = this.di.appService.CONST.ADMIN_GROUP;
    this.scope.groups = angular.copy(this.di.appService.CONST.HEADER);
    this.scope.username = null;
    this.scope.alerts_acount = 0;
    this.scope.location = (url, event) => {
      event && event.stopPropagation();
      if (url === '/logout') {
        this.di.loginDataManager.doLogout().then(() => {
          this.di.$location.path(url);
        });
      }
      else {
        this.di.$location.path(url);
      }
    };

    this.di.alertDataManager.getAlertHistories({})
      .then((res) => {
        this.scope.alerts_acount = res.data.total;
      });
    this.init();
  }

  init() {
    this.scope.userConfig = angular.copy(this.scope.groups.user.items);
    let useraccount = this.di.$cookies.get('useraccount');
    if (!useraccount) {
      this.di.$location.path('/login');
      return;
    }
    let decodeBytes = this.di.crypto.AES.decrypt(useraccount.toString(), this.di.appService.CONST.CRYPTO_STRING);
    let decodeData = decodeBytes.toString(this.di.crypto.enc.Utf8);
    this.scope.username = JSON.parse(decodeData).user_name;
    /*if (JSON.parse(useraccount).groups.indexOf(this.CONST_ADMIN_GROUP) === -1) {
      //this.scope.userConfig.splice(0, 1);
      let index = this.di._.findIndex(this.scope.groups.menu, (menu)=> {
        return menu.group === 'Account';
      });
      this.scope.groups.menu.splice(index, 1);
    }*/
  }
}

headerController.$inject = headerController.getDI();
headerController.$$ngIsClass = true;