export class LoginDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      '$cookies',
      'appService',
      'localStoreService',
      'crypto'
    ];
  }
  constructor(...args){
    this.di = {};
    LoginDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  doLogin(username, password) {
    let defer = this.di.$q.defer();
    //mock
    if(this.di.appService.isMocked) {
      let result = {
        'user_name': this.di.appService.CONST.MOCKED_USERNAME,
        'password': this.di.appService.CONST.MOCKED_PASSWORD
        //'groups': [this.di.appService.CONST.ADMIN_GROUP]
      };
      defer.resolve(result);
      this.di.$cookies.put('useraccount', this.di.crypto.AES.encrypt(JSON.stringify(result), this.di.appService.CONST.CRYPTO_STRING));
      return defer.promise;
    }
    let base64 = window.btoa(username + ':' + password);
    this.di.$http.get(this.di.appService.getLoginUrl(),{'headers':{'Authorization': "Basic " + base64}})
      .then((result) => {
        if(result.status === 200){
          this.di.$cookies.put('useraccount', this.di.crypto.AES.encrypt(JSON.stringify({
            'user_name': username, 
            'password': password
          }), this.di.appService.CONST.CRYPTO_STRING));
          defer.resolve(result);
        } else {
          this.di.$cookies.remove('useraccount');
          this.di.localStoreService.getSyncStorage().del('menus');
          defer.resolve(false);
        }
      }, (result) => {
        this.di.$cookies.remove('useraccount');
        this.di.localStoreService.getSyncStorage().del('menus');
        defer.reject(result);
      });
    return defer.promise;
  }
}
LoginDataManager.$inject = LoginDataManager.getDI();
LoginDataManager.$$ngIsClass = true;