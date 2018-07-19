export class StormDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    StormDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getStormProfiles(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getStormProfilesUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'links': [], 'total': 0}});
      }
    );
    return defer.promise;
  }
}

StormDataManager.$inject = StormDataManager.getDI();
StormDataManager.$$ngIsClass = true;