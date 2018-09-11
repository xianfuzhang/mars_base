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

  getDetailDevices(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPortsUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': []}});
      }
    );
    return defer.promise;
  }

  getDeviceWithPorts(deviceId){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDevicePortsUrl(deviceId)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': [], 'total': 0}});
      }
    );
    return defer.promise;

  }

  getDevices(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDevicesUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'devices': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  deleteDevice(deviceId) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteDeviceUrl(deviceId))
      .then((res) => {
          defer.resolve(null);
        },
        () => {
          defer.reject(null);
        }
      );
    return defer.promise;
  }

  getDeviceDetail(deviceId) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceDetailUrl(deviceId)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve(null);
      }
    );
    return defer.promise;
  }

  // add by yazhou.miao
  postDeviceDetail(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDevicesUrl(), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve(null);
      }
    );
    return defer.promise;
  }
  
  putDeviceDetail(params) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getDeviceDetailUrl(params.deviceId), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve(null);
      }
    );
    return defer.promise;
  }
  
  getDevicePorts(deviceId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDevicePortsUrl(deviceId), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': []});
      }
    );
    return defer.promise;
  }

  getDevicePortsStatistics(deviceId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDevicePortsStatisticsUrl(deviceId), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'statistics': []}});
      }
    );
    return defer.promise;
  }

  getDeviceFlows(deviceId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceFlowsUrl(deviceId), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'flows': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  deleteDeviceFlow(deviceId, flowId) {
   let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteDeviceFlowUrl(deviceId, flowId)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise; 
  }

  getPorts(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPortsUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'ports': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  getLinks(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getLinksUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'links': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  getDeviceLinks(deviceId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceLinksUrl(deviceId), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': []});
      }
    );
    return defer.promise;
  }

  getEndpoints(params) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getEndPointsUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'hosts': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  changePortState(deviceId, portId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getChangePortStateUrl(deviceId, portId), params)
      .then((res) => {
          defer.resolve(null);
        },
        () => {
          defer.reject(null);
        }
      );
    return defer.promise;
  }

  deleteEndpoint(tenant, segment, mac) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteEndpointUrl(tenant, segment, mac))
      .then((res) => {
          defer.resolve(null);
        },
        () => {
          defer.reject(null);
        }
      );
    return defer.promise;
  }

  createFlow(deviceId, appId, params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getCreateFlowUrl(deviceId, appId), params)
      .then((res) => {
          defer.resolve(null);
        },
        () => {
          defer.reject(null);
        }
      );
    return defer.promise;
  }

}
DeviceDataManager.$inject = DeviceDataManager.getDI();
DeviceDataManager.$$ngIsClass = true;