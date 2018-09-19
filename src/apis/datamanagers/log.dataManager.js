export class LogDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    LogDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getLogs(params) {
    let defer = this.di.$q.defer();
    let url = this.di.appService.getLogsUrl();
    
    this.di.$http.get(url, {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'logs': [], 'total': 0}});
      }
    );
    
    return defer.promise;
  }
}

LogDataManager.$inject = LogDataManager.getDI();
LogDataManager.$$ngIsClass = true;