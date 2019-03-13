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
        //error返回格式没有data字段导致console报错
        //this.di.$log.error("Url: " + this.di.appService.getDevicesUrl() + " has no response with error(" + error.data.message +"）")
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
        //this.di.$log.error("Url: " + this.di.appService.getDeviceConfigsUrl() + " has no response with error(" + error.data.message +"）");
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

  getEndpoints(params, type) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getEndPointsUrl(type), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'hosts': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  createEndpoint(params, type) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getEndPointsUrl(type), params).then(
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

  deleteEndpoint(params, type) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteEndpointUrl(type, params))
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

  getDeviceDiskAnalyzer(deviceId, startTime, endTime, resolutionSecond) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceDiskAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond)).then(
      (res) => {
        defer.resolve(res.data.disk);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getClusterInteraceAnalyzer(deviceId, startTime, endTime, resolutionSecond) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getClusterInterfaceAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond)).then(
      (res) => {
        defer.resolve(res.data.portstats);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDeviceInteraceAnalyzer(deviceId, startTime, endTime, resolutionSecond) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDeviceInterfaceAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond)).then(
      (res) => {
        defer.resolve(res.data.portstats);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDevicePortsAnalyzer(deviceId, startTime, endTime, resolutionSecond) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDevicePortsAnalyzerUrl(deviceId, startTime, endTime, resolutionSecond)).then(
      (res) => {
        defer.resolve(res.data.portstats);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getDevicePortAnalyzer(deviceId, port, startTime, endTime, resolutionSecond) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDevicePortAnalyzerUrl(deviceId, port, startTime, endTime, resolutionSecond)).then(
      (res) => {
        defer.resolve(res.data.portstats);
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
        defer.resolve(res.data.temps);
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
        defer.resolve(res.data.psus);
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
        defer.resolve(res.data.fans);
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

  getAllHostSegment() {
    // let defer = this.di.$q.defer();
    // let testValue = [
    //   {"segment_name":"server1","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"serve2r","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"server3","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"server4","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"server5","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    // ];
    //
    // this.di.$http.get(this.di.appService.getDeviceConfigsUrl()).then(
    //   (res) => {
    //     defer.resolve(testValue);
    //   },
    //   (error) => {
    //     this.di.$log.error("Url: " + this.di.appService.getDeviceConfigsUrl() + " has no response with error(" + error +"）")
    //     defer.resolve([]);
    //   }
    // );
    // return defer.promise;


    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getHostSegmentUrl(true)).then(
      (res) => {
        defer.resolve(res.data.segments);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getHostSegmentByDeviceId(device_id) {
    // let defer = this.di.$q.defer();
    // let testValue = [
    //   {"segment_name":"server1","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"serve2r","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"server3","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"server4","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    //   {"segment_name":"server5","device_id":"rest:192.168.40.240:80","vlan":10,"ip_address":"192.168.100.1","prefix_len":24,"ports": ["1/tag", "2/untag"]},
    // ];
    //
    // this.di.$http.get(this.di.appService.getHostSegmentByDeviceUrl(device_id)).then(
    //   (res) => {
    //     defer.resolve(testValue);
    //   },
    //   (error) => {
    //     this.di.$log.error("Url: " + this.di.appService.getDeviceConfigsUrl() + " has no response with error(" + error +"）")
    //     defer.resolve([]);
    //   }
    // );
    // return defer.promise;
    //
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getHostSegmentByDeviceUrl(device_id)).then(
      (res) => {
        defer.resolve(res.data.segments);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getHostSegmentByDeviceAndName(device_id, seg_name) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getHostSegmentByNameAndDeviceUrl(device_id, seg_name)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }



  postHostSegment(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getHostSegmentUrl(), params)
      .then((res) => {
          defer.resolve(res.data);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  deleteHostSegment(device_id, seg_name) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getHostSegmentByNameUrl(seg_name)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }



  getDHCPRelayDefault() {

    // let defer = this.di.$q.defer();
    // let testValue = [
    //   {
    //     "dhcpServerConnectPoint": "rest:192.168.40.240:80/5",
    //     "serverIps": ["10.0.3.252", "2002:4::253"],
    //     "gatewayIps": ["10.0.3.100", "2001:3::100"],
    //     "relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.2", "ipv6": "2001:2::254"}}
    //   },
    //   {
    //     "dhcpServerConnectPoint": "rest:192.168.40.240:80/6",
    //     "serverIps": ["10.0.3.252", "2002:4::253"],
    //     "gatewayIps": ["10.0.3.100", "2001:3::100"],
    //     "relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.3", "ipv6": "2001:2::254"}}
    //   },
    //   {
    //     "dhcpServerConnectPoint": "rest:192.168.40.240:80/7",
    //     "serverIps": ["10.0.3.252", "2002:4::253"],
    //     "gatewayIps": ["10.0.3.100", "2001:3::100"],
    //     "relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.4", "ipv6": "2001:2::254"}}
    //   },
    //   {
    //     "dhcpServerConnectPoint": "rest:192.168.40.240:80/8",
    //     "serverIps": ["10.0.3.252", "2002:4::253"],
    //     "gatewayIps": ["10.0.3.100", "2001:3::100"],
    //     "relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.6", "ipv6": "2001:2::254"}}
    //   },
    //   {
    //     "dhcpServerConnectPoint": "rest:192.168.40.240:80/9",
    //     "serverIps": ["10.0.3.252", "2002:4::253"],
    //     "gatewayIps": ["10.0.3.100", "2001:3::100"],
    //     "relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.5", "ipv6": "2001:2::254"}}
    //   },
    // ];

    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDHCPRelayDefaultUrl()).then(
      (res) => {
        defer.resolve(res.data.default);
      },
      (error) => {
        defer.reject(error.data);
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
          defer.resolve({'data': {'uplinkSegments': []}});
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

  getAllStorm(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getStormControlUrl())
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  getLogicalPortsList() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getLogicalPortUrl())
      .then((res) => {
          defer.resolve(res.data.logical_ports);
        },
        (err) => {
          defer.resolve([]);
        }
      );
    return defer.promise;
  }

  getStormControl(deviceId){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getStormControlUrlByDeviceId(deviceId))
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  postStormControl(deviceId, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getStormControlUrlByDeviceId(deviceId), param)
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  deleteStormControl(deviceId){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getStormControlUrlByDeviceId(deviceId))
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  getAllMonitor(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getMonitorUrl())
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.resolve(err);
        }
      );
    return defer.promise;
  }

  getMonitor(session_id){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getMonitorUrlBySessionId(session_id))
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  postMonitor(param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getMonitorUrl(), param)
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  deleteMonitor(session_id) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getMonitorUrlBySessionId(session_id))
      .then((res) => {
          defer.resolve(res);
        },
        (err) => {
          defer.reject(err);
        }
      );
    return defer.promise;
  }

  getHostSegmentByDeviceId(device_id) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getHostSegmentByDeviceId(device_id)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }



  postDHCPRelayDefault(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDHCPRelayDefaultUrl(), params)
      .then((res) => {
          defer.resolve(res.data);
        },
        (err) => {
          defer.reject(err.data);
        }
      );
    return defer.promise;
  }

  deleteDHCPRelayDefault(device_id, port) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDHCPRelayDefaultByDeviceAndPortUrl(device_id, port)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.reject(error.data);
      }
    );
    return defer.promise;
  }

  getDHCPRelayIndirect() {

    // let defer = this.di.$q.defer();
    // let testValue = [
    //   {"dhcpServerConnectPoint": "rest:192.168.40.240:80/10","serverIps": ["10.0.3.252", "2002:4::253"],"gatewayIps": ["10.0.3.100","2001:3::100"],"relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.2","ipv6": "2001:2::254"}}},
    //   {"dhcpServerConnectPoint": "rest:192.168.40.240:80/1221","serverIps": ["10.0.3.252", "2002:4::253"],"gatewayIps": ["10.0.3.100","2001:3::100"],"relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.3","ipv6": "2001:2::254"}}},
    //   {"dhcpServerConnectPoint": "rest:192.168.40.240:80/12","serverIps": ["10.0.3.252", "2002:4::253"],"gatewayIps": ["10.0.3.100","2001:3::100"],"relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.4","ipv6": "2001:2::254"}}},
    //   {"dhcpServerConnectPoint": "rest:192.168.40.240:80/14","serverIps": ["10.0.3.252", "2002:4::253"],"gatewayIps": ["10.0.3.100","2001:3::100"],"relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.6","ipv6": "2001:2::254"}}},
    //   {"dhcpServerConnectPoint": "rest:192.168.40.240:80/122","serverIps": ["10.0.3.252", "2002:4::253"],"gatewayIps": ["10.0.3.100","2001:3::100"],"relayAgentIps": {"rest:192.168.40.240:80": {"ipv4": "10.0.2.5","ipv6": "2001:2::254"}}},
    // ];
    //
    // this.di.$http.get(this.di.appService.getDeviceConfigsUrl()).then(
    //   (res) => {
    //     defer.resolve(testValue);
    //   },
    //   (error) => {
    //     this.di.$log.error("Url: " + this.di.appService.getDeviceConfigsUrl() + " has no response with error(" + error +"）")
    //     defer.resolve([]);
    //   }
    // );
    // return defer.promise;


    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDHCPRelayIndirectUrl()).then(
      (res) => {
        defer.resolve(res.data.indirect);
      },
      (error) => {
        defer.reject(error.data);
      }
    );
    return defer.promise;
  }



  postDHCPRelayIndirect(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDHCPRelayIndirectUrl(), params)
      .then((res) => {
          defer.resolve(res.data);
        },
        (err) => {
          defer.reject(err.data);
        }
      );
    return defer.promise;
  }

  createLogicalPort(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getLogicalPortUrl(), params)
      .then(() => {
        defer.resolve(null);
      }, (err) => {
        defer.reject(err.data.message);
      });
    return defer.promise;  
  }

  deleteLogicalPort(name) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteLogicalPortUrl(name))
      .then((res) => {
          defer.resolve(null);
        },
        (err) => {
          defer.reject(err.data.message);
        }
      );
    return defer.promise;
  }

  postPathCalc(src, dst, latency) {
    let defer = this.di.$q.defer();
    let param = {"host1": src, "host2": dst};
    if(latency !== '' && latency !== null && latency !== undefined){
      param['latency'] = latency;
    }
    this.di.$http.post(this.di.appService.getPathUrl(), param)
      .then((res) => {
        defer.resolve(res);
      }, (err) => {
        defer.reject(err.data.message);
      });
    return defer.promise;
  }

  getLogicalPortMapping() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getLogicalPortMappingUrl())
      .then((res) => {
          defer.resolve(res.data.ports);
        },
        (err) => {
          defer.resolve([]);
        }
      );
    return defer.promise;
  }

  getAllSFlows() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getSFlowsUrl())
      .then((res) => {
          defer.resolve(res.data.sflows);
        },
        (err) => {
          defer.resolve([]);
        }
      );
    return defer.promise;
  }

  createDeviceSFlow(device_id, params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getSFlowsUrl(device_id), params)
      .then((res) => {
        defer.resolve(res);
      }, (err) => {
        defer.reject(err.data.message);
      });
    return defer.promise;
  }

  deleteSFlowByDeviceId(device_id) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getSFlowsUrl(device_id))
      .then((res) => {
          defer.resolve(null);
        },
        (err) => {
          defer.reject(err.data.message);
        }
      );
    return defer.promise;
  }
  // deleteHostSegment(device_id, seg_name) {
// =======
  deleteDHCPRelayIndirect(device_id, port) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDHCPRelayIndirectByDeviceAndPortUrl(device_id, port)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.reject(error.data);
      }
    );
    return defer.promise;
  }

  getDHCPRelayCounters() {
    // let defer = this.di.$q.defer();
    // let testValue = [
    //   {"advertise":6,"host":"00:00:00:00:01:00/None","location":{"deviceId":"rest:192.168.40.240:80","port":3},"renew":7,"reply":8,"request":5,"solicit":4},
    //   {"advertise":6,"host":"00:00:00:00:20:00/None","location":{"deviceId":"rest:192.168.40.240:80","port":3},"renew":7,"reply":8,"request":5,"solicit":4},
    //   {"advertise":6,"host":"00:00:00:00:30:00/None","location":{"deviceId":"rest:192.168.40.240:80","port":3},"renew":7,"reply":8,"request":5,"solicit":4},
    //   {"advertise":6,"host":"00:00:00:00:50:00/None","location":{"deviceId":"rest:192.168.40.240:80","port":3},"renew":7,"reply":8,"request":5,"solicit":4},
    // ];
    //
    // this.di.$http.get(this.di.appService.getDeviceConfigsUrl()).then(
    //   (res) => {
    //     defer.resolve(testValue);
    //   },
    //   (error) => {
    //     this.di.$log.error("Url: " + this.di.appService.getDeviceConfigsUrl() + " has no response with error(" + error +"）")
    //     defer.resolve([]);
    //   }
    // );
    // return defer.promise;

    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDHCPRelayCountersUrl()).then(
      (res) => {
        defer.resolve(res.data.couters);
      },
      (error) => {
        defer.reject(error.data);
      }
    );
    return defer.promise;
  }

}
DeviceDataManager.$inject = DeviceDataManager.getDI();
DeviceDataManager.$$ngIsClass = true;