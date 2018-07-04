export class switchDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    switchDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getSwitches(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getSwitchesUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }
}
switchDataManager.$inject = switchDataManager.getDI();
switchDataManager.$$ngIsClass = true;