export class DeviceDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      '$log',
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

  rebootDevice(deviceId){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDeviceRebootUrl(deviceId))
      .then((res) => {
          defer.resolve(null);
        },
        () => {
          defer.reject(null);
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
        this.di.$log.error("Url: " + this.di.appService.getDevicesUrl() + " has no response with error(" + error.data.message +"）")
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
        defer.reject(null);
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
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }
  
  putDeviceDetail(params) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getDeviceDetailUrl(params.id), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(err.data.message);
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
        defer.resolve({'data': {ports: [], total: 0}});
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

  getDeviceGroups(deviceId, params) {
    // TODO: complete get groups process
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceGroupsUrl(deviceId), {'params': params}).then(
      (res) => {
        res.data.groups.forEach((group) => {
          group.id = parseInt(group.id) // parse string to int
        })
        defer.resolve({data: res.data});
      },
      (error) => {
        defer.resolve({data: {'groups': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  getDeviceConfigs(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceConfigsUrl()).then(
      (res) => {
        defer.resolve(res['data']['configs']);
      },
      (error) => {
        this.di.$log.error("Url: " + this.di.appService.getDeviceConfigsUrl() + " has no response with error(" + error.data.message +"）");
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDeviceConfig(deviceId) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceConfigUrl(deviceId)).then(
      (res) => {
        defer.resolve(res['data']);
      },
      (error) => {
        this.di.$log.error("Url: " + this.di.appService.getDeviceConfigUrl(deviceId) + " has no response with error(" + error.data.message + "）")
        defer.resolve(null);
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
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  addDeviceGroup(deviceId, params){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDeviceGroupsUrl(deviceId), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }


  deleteDeviceGroup(deviceId, appCookie){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeviceGroupDeleteUrl(deviceId, appCookie)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.data.message);
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

  getDeviceLinks(deviceId, param) {
    let defer = this.di.$q.defer();
    if(!param){
      param = {}
    }
    param['device'] = deviceId;
    this.di.$http.get(this.di.appService.getLinksUrl(), {'params': param}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {links: [], total: 0}});
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

  createEndpoint(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getEndPointsUrl(), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.data.message);
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

  deleteEndpoint(mac, segment) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteEndpointUrl(mac, segment))
      .then((res) => {
          defer.resolve(null);
        },
        (error) => {
          defer.reject(error.data.message);
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

  getDeviceCPUAnalyzer(deviceId, startTime, endTime, resolutionSecond) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceCPUAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond)).then(
      (res) => {
        defer.resolve(res.data.cpu);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDeviceMemoryAnalyzer(deviceId, startTime, endTime, resolutionSecond) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceMemoryAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond)).then(
      (res) => {
        defer.resolve(res.data.memory);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDeviceTemperatureSensors(deviceId) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTemperatureSensorsUrl(deviceId)).then(
      (res) => {
        defer.resolve(res.data.sensors);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDevicePsuSensors(deviceId) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPsuSensorsUrl(deviceId)).then(
      (res) => {
        defer.resolve(res.data.sensors);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDeviceFanSensors(deviceId) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getFanSensorsUrl(deviceId)).then(
      (res) => {
        defer.resolve(res.data.sensors);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  } 

  // get group detail by group id
  parseDeviceGroup(groupId) {
    let returnObj = {}
    let tmpIDStr = groupId.toString(2);
    let idStr = tmpIDStr;

    // 不足32位补0
    for(let i=0; i < 32 - tmpIDStr.length; i++) {
      idStr = '0' + idStr;
    }
    let typeInt = parseInt(idStr.slice(0, 4), 2);
    let groupType = `GROUP-Type-${typeInt}`;
  
    returnObj.nameId = groupType;
    switch(groupType) {
      case 'GROUP-Type-0':
        returnObj.name = 'L2 Interface'
        returnObj.vlan_id = parseInt(idStr.slice(4, 16), 2);
        returnObj.port = parseInt(idStr.slice(16, 32), 2);
        break;
      case 'GROUP-Type-1':
        returnObj.name = 'L2 Rewrite'
        returnObj.random_id = idStr.slice(4)
        break;
      case 'GROUP-Type-2':
        returnObj.name = 'L3 Unicast'
        returnObj.random_id = idStr.slice(4)
        break;
      case 'GROUP-Type-3':
        returnObj.name = 'L2 Multicast'
        returnObj.vlan_id = parseInt(idStr.slice(4, 16), 2);
        returnObj.random_id = idStr.slice(16)
        break;
      case 'GROUP-Type-4':
        returnObj.name = 'L2 Flood'
        returnObj.vlan_id = parseInt(idStr.slice(4, 16), 2);
        returnObj.random_id = idStr.slice(16)
        break;
      case 'GROUP-Type-5':
        returnObj.name = 'L3 Interface'
        returnObj.random_id = idStr.slice(4)
        break;
      case 'GROUP-Type-6':
        returnObj.name = 'L3 Multicast'
        returnObj.vlan_id = parseInt(idStr.slice(4, 16), 2);
        returnObj.random_id = idStr.slice(16)
        break;
      case 'GROUP-Type-7':
        returnObj.name = 'L3 ECMP'
        returnObj.random_id = idStr.slice(4)
        break;
      case 'GROUP-Type-11':
        returnObj.name = 'L2 Unfiltered Interface'
        break;
    }
  
    return returnObj;
  }
  
  getMacAndIpBindings() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDHCPServerUrl(true)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }


  getPFCListByDeviceId(deviceId){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPFCUrl(deviceId)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  postPFC(deviceId, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getPFCUrl(deviceId), param)
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  deletePFC(deviceId, port){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getPFCDeleteUrl(deviceId, port))
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }


  getUpLink(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getUpLinkUrl())
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  postUpLink(param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getUpLinkUrl(), param)
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  deleteUpLink(name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getUpLinkDeleteUrl(name))
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }
}
DeviceDataManager.$inject = DeviceDataManager.getDI();
DeviceDataManager.$$ngIsClass = true;