export class headerController{
  static getDI() {
    return [
      '$log',
      '$scope',
      '$rootScope',
      '$cookies',
      '$location',
      '$window',
      '_',
      'crypto',
      'appService',
      'roleService',
      'localStoreService',
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
    //this.scope.alerts_acount = 0;
    this.scope.location = (url, event) => {
      event && event.stopPropagation();
      if (url === '/logout') {
        this.di.$cookies.remove('useraccount');
        this.di.localStoreService.getSyncStorage().del('menus');
        this.di.roleService.clearRole();
      }
      this.di.$location.path(url);
    };

    // handle theme
    const CONST_LOCAL_STORAGE_KEY = 'userPrefs__';
    const CONST_THEME = 'theme';
    let theme =  this.di.$window.localStorage.getItem(CONST_LOCAL_STORAGE_KEY + CONST_THEME);
    if(theme) {
      this.scope.theme = theme;
    } else {
      this.scope.theme = 'theme_default';
    }
    
    this.scope.changeTheme = () => {
      let theme = this.scope.theme == 'theme_default' ? 'theme_dark' : 'theme_default';
      this.di.$rootScope.$emit('change-theme', theme)
    }
    
    this.init();
  }

  init() {
    this.scope.userConfig = angular.copy(this.scope.groups.user.items);
    let useraccount = this.di.$cookies.get('useraccount'),
        menus = this.di.localStoreService.getSyncStorage().get('menus');
    if (!useraccount || !menus) {
      this.di.$location.path('/login');
      return;
    }
    let decodeBytes = this.di.crypto.AES.decrypt(useraccount.toString(), this.di.appService.CONST.CRYPTO_STRING);
    let decodeData = decodeBytes.toString(this.di.crypto.enc.Utf8);
    this.scope.username = JSON.parse(decodeData).user_name;

    this.scope.menues = menus.groups;
  }
}

headerController.$inject = headerController.getDI();
headerController.$$ngIsClass = true;