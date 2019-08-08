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

  postVlanConfigByDeviceId(deviceId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getVlanConfigUrl(deviceId), params).then(
      () => {
        defer.resolve();
      },
      () => {
        defer.reject();
      }
    );
    return defer.promise;
  }

  putVlanConfigByDeviceId(deviceId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getVlanConfigUrl(deviceId), params).then(
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

  getVlanConfigByDeviceId(deviceId) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getVlanConfigUrl(deviceId)).then(
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

  putVlanConfig(params) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getVlanConfigUrl(), params).then(
      (res) => {
        defer.resolve(null);
      },
      (error) => {
        defer.reject(JSON.stringify(error));
      }
    );
    return defer.promise;
  }

  getVoiceVlanConfig() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getVoiceVlanUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  postVoiceVlanConfig(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getVoiceVlanUrl(), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  postVoiceVlanConfigByDeviceId(device_id, params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getVoiceVlanUrl(device_id), params).then(
      () => {
        defer.resolve();
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  putVoiceVlanConfigByDeviceId(device_id, params) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getVoiceVlanUrl(device_id), params).then(
      () => {
        defer.resolve();
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteVoiceVlanConfigByDeviceId(device_id) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getVoiceVlanUrl(device_id)).then(
      () => {
        defer.resolve();
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
}
VlanDataManager.$inject = VlanDataManager.getDI();
VlanDataManager.$$ngIsClass = true;