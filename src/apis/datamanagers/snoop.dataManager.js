export class SnoopDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    SnoopDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getDeviceSnoopList() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDHCPSnoopUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  createDeviceSnoop(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDHCPSnoopUrl('vlans'), params).then(
      () => {
        defer.resolve();
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
  
SnoopDataManager.$inject = SnoopDataManager.getDI();
SnoopDataManager.$$ngIsClass = true;