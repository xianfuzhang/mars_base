export class LoginDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      '$cookies',
      'appService'
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
    if(username === this.di.appService.CONST.MOCKED_USERNAME && password === this.di.appService.CONST.MOCKED_PASSWORD) {
      let result = {
        'user_name': this.di.appService.CONST.MOCKED_USERNAME,
        'groups': [this.di.appService.CONST.ADMIN_GROUP]
      };
      defer.resolve(result);
      this.di.$cookies.put('useraccount', JSON.stringify(result));
      return defer.promise;
    }
    this.di.$http.post(this.di.appService.getLoginUrl(), {'j_username': username, 'j_password': password}, {'headers':{'Content-Type': 'application/x-www-form-urlencoded'}})
      .then((result) => {
      console.log(result);
      if(result.status === 302){
        defer.resolve(true)
      } else {
        defer.resolve(false)
      }
        // this.di.$cookies.put('useraccount', JSON.stringify(result.data));
        // defer.resolve(result);
      }, (result) => {
        defer.reject(false);
      });
    return defer.promise;
  }

  doLogout() {
    let defer = this.di.$q.defer();

    this.di.$http.get(this.di.appService.getLogoutUrl())
      .then(() => {
        this.di.$cookies.remove('useraccount');
        defer.resolve();
      }, () => {
        this.di.$cookies.remove('useraccount');
        defer.resolve();
      });
    return defer.promise;
  }
}
LoginDataManager.$inject = LoginDataManager.getDI();
LoginDataManager.$$ngIsClass = true;