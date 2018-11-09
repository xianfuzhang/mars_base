export class AccountDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    AccountDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getUsers(params) {
    let defer = this.di.$q.defer();

    this.di.$http.get(this.di.appService.getUserAccountUrl(), params)
      .then((res) => {
        defer.resolve(res);
      }, () => {
        defer.resolve({'data': {"users": []}});
      });
    return defer.promise;
  }

  createUser(jsonData) {
    let defer = this.di.$q.defer();

    this.di.$http.post(this.di.appService.getUserAccountUrl(), jsonData)
      .then((res) => {
        defer.resolve(res);
      }, (res) => {
        defer.reject(res.data.message);
      });
    return defer.promise;
  }

  deleteUser(username) {
    let defer = this.di.$q.defer();

    this.di.$http.delete(this.di.appService.getDeleteUserAccountUrl(username))
      .then((res) => {
        defer.resolve(res);
      }, (res) => {
        defer.reject(res.data.message);
      });
    return defer.promise;
  }
}
AccountDataManager.$inject = AccountDataManager.getDI();
AccountDataManager.$$ngIsClass = true;