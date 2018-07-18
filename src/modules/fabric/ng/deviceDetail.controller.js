export class DeviceDetailController {
  static getDI() {
    return [
      '$scope',
      '$routeParams',
      '$log',
      '$q',
      '$filter',
      'appService',
      'deviceService',
      'deviceDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args){
    this.di = {};
    DeviceDetailController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let deviceId = this.di.$routeParams['deviceId'];
    this.di.$log.info('device detail controller constructor, deviceId=' + deviceId);
    this.scope = this.di.$scope;

  }
}
DeviceDetailController.$inject = DeviceDetailController.getDI();
DeviceDetailController.$$ngIsClass = true;