export class DeviceDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    DeviceDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getDevices(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDevicesUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res.data.devices);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getPorts(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPortsUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res.data.ports);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }
}
DeviceDataManager.$inject = DeviceDataManager.getDI();
DeviceDataManager.$$ngIsClass = true;