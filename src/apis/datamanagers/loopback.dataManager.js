export class LoopbackDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    LoopbackDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getDeviceLoopbackDetectionList() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceLoopbackDetectionUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  getPortLoopbackDetectionList() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPortLoopbackDetectionUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'ports': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  updateDeviceLoopbackDetection(deviceId, params){
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getDeviceLoopbackDetectionUrl(deviceId), params).then(
      (res) => {
        defer.resolve();
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  updatePortLoopbackStatus(deviceId, port, params) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getPortLoopbackDetectionUrl(deviceId, port), params).then(
      (res) => {
        defer.resolve();
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
}
  
LoopbackDataManager.$inject = LoopbackDataManager.getDI();
LoopbackDataManager.$$ngIsClass = true;