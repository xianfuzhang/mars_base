export class VlanDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }

  constructor(...args) {
    this.di = {};
    VlanDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  postVlanConfig(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getVlanConfigUrl(), params).then(
      () => {
        defer.resolve();
      },
      () => {
        defer.reject();
      }
    );
    return defer.promise;
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

  removeVlanIp(device_id, vlan_id) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getVlanIpDeleteUrl(device_id, vlan_id)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }


  createVlanIp(param) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getVlanConfigUrl(), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  postVlanDynamic(param) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getVlanConfigUrl(), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }
  
  getVlanMembers() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getVlanMembersUrl()).then(
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