export class VlanDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    VlanDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getVlanConfig() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getVlanConfigUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': [], 'total': 0}});
      }
    );
    return defer.promise;
  }
}
VlanDataManager.$inject = VlanDataManager.getDI();
VlanDataManager.$$ngIsClass = true;