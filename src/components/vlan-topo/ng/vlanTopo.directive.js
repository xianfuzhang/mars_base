import {MDCRipple} from '@material/ripple';
export class VlanTopo {
  static getDI() {
    return [
      '$rootScope',
      '$window',
      '$timeout',
      'localStoreService',
      '$document',
      '$filter',
      '_',
      'd3',
      'd3-force',
      'easingService',
      'switchService'
    ];
  }

  constructor(...args) {
    this.di = [];
    VlanTopo.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/vlanTopo');
    this.translate = this.di.$filter('translate');

    this.scope = {
      links: '=',
      devices: '=',
      vlanConfig: '='
    };

    this.link = (...args) => this._link.apply(this, args);
  }


  _link(scope, element) {

    // scope.vlanTopoModel = {
    //   vlan: null,
    //   vlan_list_display: {
    //     'options': [
    //       {'label': 'TestVlan', 'value': 'vlan'},
    //       {'label': "Force", 'value': 'force'},
    //       {'label': 'Spine Leaf', 'value': 'spine_leaf'},
    //       {'label': 'Donut', 'value': 'donut'}
    //     ],
    //     'hint': 'MODULES.SWITCHES.TOPO.TYPE',
    //   }
    // }
    (function init() {
      let unsubscribers = [];

      let DI = this.di;
      let d3 = this.di.d3;

      this.height = 0;
      this.width = 0;

      this.paths = [];
      this.pathNodes = {};

      this.hosts = [];
      this.hostNodes = {};
      scope.hasBound = false;
      // scope.selectedDeviceId = null;

      // TEST Code START  ======= 此处代码是用来测试distance算法是否合理
      let devices = [{"available":true,"community":null,"id":"rest:192.168.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.168.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:192.168.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"192.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"192.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.168.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.168.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:292.168.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"292.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"292.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.169.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"192.169.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.169.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:192.169.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"192.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"192.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.169.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.169.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:292.169.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"292.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"292.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"}];
      let links =[{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.225:80","port":"49"},"src":{"device":"rest:192.168.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.230:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.229:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.227:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.226:80","port":"51"},"src":{"device":"rest:192.168.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.226:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.229:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.226:80","port":"49"},"src":{"device":"rest:192.168.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.227:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.225:80","port":"51"},"src":{"device":"rest:192.168.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.225:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.230:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"49"},"src":{"device":"rest:292.168.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.230:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.229:80","port":"50"},"src":{"device":"rest:292.168.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.227:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"51"},"src":{"device":"rest:292.168.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.229:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"49"},"src":{"device":"rest:292.168.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.227:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"51"},"src":{"device":"rest:292.168.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"52"},"src":{"device":"rest:292.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.230:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.225:80","port":"49"},"src":{"device":"rest:192.169.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.230:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.229:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.227:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.226:80","port":"51"},"src":{"device":"rest:192.169.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.226:80","port":"52"},"src":{"device":"rest:192.169.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.229:80","port":"49"},"src":{"device":"rest:192.169.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.226:80","port":"49"},"src":{"device":"rest:192.169.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.227:80","port":"49"},"src":{"device":"rest:192.169.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.225:80","port":"51"},"src":{"device":"rest:192.169.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.225:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.230:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.225:80","port":"49"},"src":{"device":"rest:292.169.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.230:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.229:80","port":"50"},"src":{"device":"rest:292.168.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.227:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"51"},"src":{"device":"rest:292.169.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.226:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.229:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.226:80","port":"49"},"src":{"device":"rest:292.169.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.227:80","port":"49"},"src":{"device":"rest:292.169.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"51"},"src":{"device":"rest:292.168.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.225:80","port":"52"},"src":{"device":"rest:292.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.230:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"}];

      let len = 30;
      scope.devices = [];
      scope.links = links.slice(0, len);

      this.di._.forEach(scope.links, (link) => {
        let device1 = this.di._.find(devices, {"id": link.src.device});
        let device2 = this.di._.find(devices, {"id": link.dst.device});
        if (!this.di._.find(scope.devices, {"id": device1.id})) {
          scope.devices.push(device1)
        }

        if (!this.di._.find(scope.devices, {"id": device2.id})) {
          scope.devices.push(device2)
        }
      });
      // TEST Code END ======


      this.source_devices = scope.devices;
      this.formated_devices = scope.devices;


      let _formatVlan = (config) =>{
        let res = {};
        config['devices'].forEach(deviceInfo=>{
          let deviceId = deviceInfo['device-id'];
          // if(!res[deviceInfo['device-id']]){
          //   res[deviceInfo['device-id']] = {};
          // }
          deviceInfo.ports.forEach(port => {
            // {"port":1,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag,1/tag,2/tag"]}
            port.vlans.forEach(vlanStr=>{
             let combinedArray = vlanStr.split('/');
             let vlanId = combinedArray[0];
             let vlanType = combinedArray[1];
              if(!res[vlanId]){
                res[vlanId] = {};
              }
              if(!res[vlanId][deviceId]){
                res[vlanId][deviceId] = {};
              }
              res[vlanId][deviceId][port['port']] = vlanType;
            })
          });
        });
        return res;
      };

      this.vlanConfig = scope.vlanConfig?_formatVlan(scope.vlanConfig):{};

      // scope.vlan_list_arr =
      //TEST
      // this.vlanConfig = _formatVlan({"devices":[{"device-id":"rest:192.168.40.225:80","ports":[{"port":1,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":2,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":3,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/untag"]},{"port":4,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/untag"]},{"port":5,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/tag","2/tag"]},{"port":6,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":7,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":8,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":9,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":13,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":14,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":15,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/tag","2/tag"]},{"port":16,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":17,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]}]},{"device-id":"rest:192.168.40.228:80","ports":[{"port":1,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":2,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":3,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":4,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":5,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/tag","2/tag"]},{"port":6,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":7,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":8,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":9,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":13,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":14,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/untag"]},{"port":15,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/tag","2/tag"]},{"port":16,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":17,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]}]},{"device-id":"rest:192.168.40.224:80","ports":[{"port":1,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":2,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":3,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":4,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":5,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/tag","2/tag"]},{"port":6,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":7,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":8,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":9,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/untag"]},{"port":13,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":14,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":15,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/tag","2/untag"]},{"port":16,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":17,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]}]},{"device-id":"rest:192.168.40.230:80","ports":[{"port":1,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":2,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":3,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/untag"]},{"port":4,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":5,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/tag","2/tag"]},{"port":6,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":7,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":8,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","1/tag","2/tag"]},{"port":9,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":13,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":14,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","3/tag","2/tag"]},{"port":15,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag","9/untag","2/untag"]},{"port":16,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]},{"port":17,"native":5,"mode":"access","dynamicVlan":"enable","guestVlan":25,"vlans":["5/untag"]}]}]})


      this.source_links = scope.links;
      this.formated_links = [];
      this.linkIds = [];


      const surfaces = document.querySelectorAll('.svg_revert');

      surfaces.forEach(surface=>new MDCRipple(surface));
      // const ripple = new MDCRipple(surface);

      let getLinkId = (deviceIds, ports) => {
        let newDeviceIds = this.di._.sortBy(deviceIds);
        if (newDeviceIds[0] !== deviceIds[0]) {
          let tmp = ports[0];
          ports[0] = ports[1];
          ports[1] = tmp;
        }
        return newDeviceIds[0] + ':' + ports[0] + '_' + newDeviceIds[1] + ':' + ports[1];
      };

      scope.deviceLinkDict = {};

      scope.revertPosition = (event) =>{
        // line.transition()
        //   .duration(200)
        let _svg = this.di.d3.select('.forceTopo > svg');
        let transform = this.di.d3.zoomTransform(_svg.node());
        transform.k = 1;
        transform.x = 0;
        transform.y = 0;

        _svg.transition().duration(200).attr('transform','translate(0,0) scale(1)');
        this.di.$timeout(()=>{
          scope.zoom.transform(_svg, transform);
          // // this.simulation.restart();
          // _svg.select('#origin_node').remove();
          // delete this.deviceNode;
          // this.deviceNode = null;
          //
          // add_origin_nodes()
        }, 200);

        event.preventDefault();
      };

      scope.resizeSvg = (event, change) =>{

        event.preventDefault();
        let _svg = this.di.d3.select('.forceTopo > svg');
        let transform = this.di.d3.zoomTransform(_svg.node());

        let k = change === 0?-0.1:0.1;
        console.log('resizeSvg:' + String(change))
        console.log(transform)
        let propertion = (transform.k + k)/transform.k;
        if(transform.k + k <= 0){
          _svg.transition().duration(100).attr('transform','translate('+ transform.x +',' + transform.y +') scale('+ transform.k +')');
          // this.di.$timeout(()=>{
          //   scope.zoom.transform(_svg, transform);
          // }, 100);
          return;
        }

        if(transform.k + k < 0.5){
          transform.k = 0.5;
          _svg.transition().duration(100).attr('transform','translate('+ transform.x +',' + transform.y +') scale('+ transform.k +')');
          // this.di.$timeout(()=>{
          //   scope.zoom.transform(_svg, transform);
          // }, 100);
          // return;
          return;
        }


        transform.k = transform.k + k;
        transform.x = transform.x * propertion;
        transform.y = transform.y * propertion;

        console.log(transform)
        _svg.transition().duration(100).attr('transform','translate('+ transform.x +',' + transform.y +') scale('+ transform.k +')');
        // scope.zoom.transform(_svg, transform);
        // this.di.$timeout(()=>{
        //   scope.zoom.transform(_svg, transform);
        // }, 100);

      };


      /*
      1 : left
      2: right
      3: up
      4: down
       */
      scope.svgDrag = (event, direction) => {
        event.preventDefault();
        let _svg = this.di.d3.select('.forceTopo > svg');
        let transform = this.di.d3.zoomTransform(_svg.node());
        let x = 0, y = 0;
        switch(direction){
          case 1:
            x = -100;
            break;
          case 2:
            x = 100;
            break;
          case 3:
            y = -100;
            break;
          case 4:
            y = 100;
            break;
          default:
            angular.noop();
        }

        // 这里操作2次是为了有过渡的动画效果
        _svg.transition()
          .duration(100)
          .attr('transform','translate('+ String(transform.x+ x)+',' + String(transform.y+ y) +') scale('+ String(transform.k) +')');
        this.di.$timeout(()=>{
          scope.zoom.translateBy(_svg, x, y)
        }, 100)
      }

      //this method only can used by device link to device !important
      let formatLinks = (links) => {
        this.formated_links = [];
        this.di._.forEach(links, (link) => {
          // let newDeviceIds = this.di._.sortBy([link.src.device, link.dst.device]);
          // let linkId = newDeviceIds.join('-');
          if(link.src.device.indexOf('rest') === -1 || link.dst.device.indexOf('rest') === -1){
            return;
          }
          let linkId = getLinkId([link.src.device, link.dst.device], [link.src.port, link.dst.port]);
          if (this.linkIds.findIndex(function (ele) {return ele == linkId}) === -1 && isDeviceLink(link.src.device, link.dst.device)) {
            this.linkIds.push(linkId);
            this.formated_links.push({
              'source': link.src.device,
              'target': link.dst.device,
              'id': linkId,
              'value': 1,
              'link': link
            });

            if(scope.deviceLinkDict[link.src.device]){
              scope.deviceLinkDict[link.src.device].push(linkId);
            } else {
              scope.deviceLinkDict[link.src.device] = [];
              scope.deviceLinkDict[link.src.device].push(linkId);
            }

            if(scope.deviceLinkDict[link.dst.device]){
              scope.deviceLinkDict[link.dst.device].push(linkId);
            } else {
              scope.deviceLinkDict[link.dst.device] = [];
              scope.deviceLinkDict[link.dst.device].push(linkId);
            }
          }
        })
      };

      let formatDevice = () => {
        //只显示rest类型的交换机
        this.formated_devices =  this.formated_devices.filter(device => device.id.toLocaleLowerCase().indexOf('rest') !== -1);
      }

      let getDeviceName = (deviceId) => {
        let device = this.di._.find(scope.devices, {"id": deviceId});
        if (device) return device['name'];
        else return deviceId;
      };


      this.active_status = "ACTIVE";
      this.LINE_WIDTH = 1;
      this.LINE_SELECTED = '136,234,136';
      this.LINE_NORMAL = '240,240,240';
      this.LINE_ERROR = "255,0,0";
      this.oldWidth = null;

      let BOUNDARY_SIZE = 36;
      let NODE_SIZE = 36;
      let ICON_SIZE = 24;
      let SVG_LINE_LENGTH = 120;


      this.PATH_LINE_WIDTH = 3;
      this.PATH_LINE_SELECTED = '236,234,136';


      let easingService = this.di.easingService;
      let switchLocation = this.switchLocation;

      let initialize = () => {
        formatDevice();
        formatLinks(this.source_links);
        genTopo();
      };

      //目前看 只要把所有节点都重新初始化一遍就可以
      this.simulation = null;
      this.linkNode = null;
      this.deviceNode = null;

      let svg = null;
      let color = (d) => {
        const scale = DI.d3.scaleOrdinal(DI.d3.schemeCategory10);
        return scale(d.group);
      };

      let isDrag = false;
      let drag = (simulation) => {
        let self = this;

        function dragstarted(d) {
          isDrag = true;
          // if (scope.topoSetting.show_tooltips) {
            DI.$rootScope.$emit("hide_tooltip");
          // }

          if (!DI.d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }


        function dragged(d) {
          // if (d3.event.x >= 36 && d3.event.x <= self.width - 36) {
          //   d.fx = d3.event.x;
          // }
          // if (d3.event.y >= 36 && d3.event.y <= self.height - 36) {
          //   d.fy = d3.event.y;
          // }
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
          isDrag = false;
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      };


      let _links;

      let reCenter = () => {
        let parentNode = element[0].parentNode;
        this.width = parentNode.offsetWidth;
        this.height = parentNode.offsetHeight;


        let distance = 100;
        if (scope.devices.length !== 0) {
          let _distance = Math.sqrt(this.width * this.height * 0.7 / scope.devices.length);
          // console.log(_distance)
          // console.log('*************');
          if (_distance > 500) distance = 500; else distance = _distance;
        }


        this.simulation
          .force("center", DI.d3.forceCenter(this.width / 2, this.height / 2))
        // .force("link", DI.d3.forceLink(_links).id(d => d.id).distance(d => {return distance}))
        // .force("charge", DI.d3.forceManyBody().strength(-30))
        // .force("collide", DI.d3.forceCollide(30));
      };

      scope.curSelectedDeviceId = null;

      let addHostSelectEffect = (node) => {
        // this.di.d3.select(node).select('rect').attr('fill','#d5f6ff')
        this.di.d3
          .select(node)
          .select('rect')
          .classed('host-select', true)
          .classed('host-unselect', false)
      };

      let addSelectEffect = (node) => {
        // this.di.d3.select(node).select('rect').attr('fill','#d5f6ff')
        this.di.d3
          .select(node)
          .select('rect')
          .classed('node-select', true)
          .classed('node-unselect', false);


        this.linkNode.attr('stroke-width', 1).style('opacity', .1);

        let deviceId = node.getAttribute('deviceId');
        let deviceLinks = scope.deviceLinkDict[deviceId];
        if(deviceLinks && Array.isArray(deviceLinks)){
          // console.log(deviceLinks);
          let self = this;
          deviceLinks.forEach((linkid)=>{
            // console.log('linkid==>' + linkid)
            self.linkNode.select(function(d, i) {
              return d.id === linkid?this:null;
            }).attr('stroke-width', 3).style('opacity', 1);
          })



        }
      };

      let removeSelectEffect = () => {
        // this.deviceNode.select('rect').attr('fill', 'gray');
        this.deviceNode
          .select('rect')
          .classed('node-select', false)
          .classed('node-unselect', true);

        this.linkNode.attr('stroke-width', 2).style('opacity', null);;

        if(this.hostNode){
          this.hostNode
            .select('rect')
            .classed('host-select', false)
            .classed('host-unselect', true)
        }
      };

      let _calcPoint_X = (point) => {

        if(scope.hasBound){
          if (point < BOUNDARY_SIZE) {
            return BOUNDARY_SIZE
          }
          if (point > this.width - BOUNDARY_SIZE) {
            return this.width - BOUNDARY_SIZE
          }
        }

        return point;
      }

      let _calcPoint_Y = (point) => {
        if(scope.hasBound) {
          if (point < BOUNDARY_SIZE) {
            return BOUNDARY_SIZE
          }
          if (point > this.height - BOUNDARY_SIZE) {
            return this.height - BOUNDARY_SIZE
          }
        }
        return point;
      };


      function clickHandler() {
        DI.d3.event.stopPropagation();
        removeSelectEffect();


        // if (scope.topoSetting.show_tooltips) {
          DI.$rootScope.$emit("hide_tooltip");
        // }
        let deviceId = this.getAttribute('deviceId');
        let sw = DI._.find(scope.devices, {'id': deviceId});
        let showArray = DI.switchService.getNormalShowInfo(sw);
        DI.$rootScope.$emit("switch_select", {event: null, id: deviceId, type: null, value: showArray});

        scope.curSelectedDeviceId = deviceId;
        addSelectEffect(this)
      };




      let mouseOutHandler = (evt) => {
        // if (scope.topoSetting.show_tooltips) {
          this.di.$rootScope.$emit("hide_tooltip");
        // }
      };



      function mouseOverHandler(d, i) {
        if (isDrag) {
          return;
        }
        let deviceId = this.getAttribute('deviceId');
        let sw = DI._.find(scope.devices, {'id': deviceId});
        let showArray = DI.switchService.getNormalShowInfo(sw);

        // if (scope.topoSetting.show_tooltips) {
          let evt = {
            'clientX': this.getBoundingClientRect().left + NODE_SIZE / 2,
            'clientY': this.getBoundingClientRect().top + NODE_SIZE / 2
          };
          DI.$rootScope.$emit("show_tooltip", {event: evt, value: showArray});
        // }
      }

      let parseLinkId = (linkId) =>{
        let res = [];
        let devicePortArray = linkId.split('_');
        let device1 = devicePortArray[0];
        let device2 = devicePortArray[1];
        var n1 = device1.lastIndexOf(':');
        let deviceId1 = device1.substring(0,n1);
        let port1 = device1.substring(n1 + 1);
        res.push({'deviceId': deviceId1, 'port': port1});

        var n2 = device2.lastIndexOf(':');
        let deviceId2 = device2.substring(0,n2);
        let port2 = device2.substring(n2 + 1);
        res.push({'deviceId': deviceId2, 'port': port2});
        return res;
      };

      let add_origin_link = () =>{
        let self = this;
        this.linkNode = svg.append("g").attr('id', 'origin_link')
          .classed('force-topo__line-normal', true)
          .selectAll("line")
          .data(scope._links)
          .join("line").attr('linkid', d => d.id)
          .on('mouseover', function (d) {
            let line = self.di.d3.select(this);
            // line.transition()
            //   .duration(200)
            line.attr('stroke-width', '4').attr('stroke','#ff7c09');

            let linkId = line.attr('linkid');
            let res = parseLinkId(linkId);

            let device1Ele = self.di.d3.select('g[deviceId=\'' + res[0]['deviceId']+'\']');
            device1Ele.select('text').text(d1=>{
              return getDeviceName(d1.id) + ': '+ self.translate('MODULES.TOPO.INFO.PORT')+' ' + res[0]['port']
            });
            device1Ele.select('.force-topo__node-outline').style('stroke', '#ff7c09')

            let device2Ele = self.di.d3.select('g[deviceId=\'' + res[1]['deviceId']+'\']');
            device2Ele.select('text').text(d1=>{
              return getDeviceName(d1.id) + ': '+ self.translate('MODULES.TOPO.INFO.PORT')+' ' + res[1]['port']
            });
            device2Ele.select('.force-topo__node-outline').style('stroke', '#ff7c09')

          })
          .on('mouseout', function () {
            let line = self.di.d3.select(this);
            line.attr('stroke-width', '2').attr('stroke', null);

            let linkId = line.attr('linkid');
            let res = parseLinkId(linkId);

            let device1Ele = self.di.d3.select('g[deviceId=\'' + res[0]['deviceId']+'\']');
            device1Ele.select('text').text(d1=>{
              return getDeviceName(d1.id)
            });
            device1Ele.select('.force-topo__node-outline').style('stroke', null);

            let device2Ele = self.di.d3.select('g[deviceId=\'' + res[1]['deviceId']+'\']');
            device2Ele.select('text').text(d1=>{
              return getDeviceName(d1.id)
            });
            device2Ele.select('.force-topo__node-outline').style('stroke', null)


          });
      };

      let remove_origin_link = () =>{
        svg.select('#origin_link').remove();
        delete this.linkNode;
        this.linkNode = null;
      }

      let remove_origin_node = () =>{
        svg.select('#origin_node').remove();
        delete this.deviceNode;
        this.deviceNode = null;
      }


      let add_origin_nodes = () =>{
        let self = this;

        this.deviceNode = svg.append("g").attr('id', 'origin_node')
          .classed('force-topo__node-normal', true)
          .selectAll("g")
          .data(scope._nodes)
          .join('g').attr("width", 126).attr("height", 64).attr('deviceId', d => d.id).style('cursor','pointer')
          .html(d => {
            let device_status_class = 'force-topo__path-normal';
            if (!d.available) {
              device_status_class = 'force-topo__path-error';
            }
            return '<rect x="-51" y="0" rx="3" ry="3" width="126" height="24" class="force-topo__node-outline" />'
          })
          .call(drag(this.simulation))
          .on('click', clickHandler)
          .on('mouseover', function () {
            let rect = self.di.d3.select(this).select('rect');
            rect.transition()
              .duration(200)
              .attr('x', '-53')
              .attr('y', '-2')
              .attr('width', '130')
              .attr('height', '28')
          })
          .on('mouseout', function () {
            let rect = self.di.d3.select(this).select('rect');
            rect.transition()
              .duration(200)
              .attr('x', '-51')
              .attr('y', '0')
              .attr('width', '126')
              .attr('height', '24')
          })
          .on('contextmenu',function () {
            d3.event.preventDefault();
            let deviceId = this.getAttribute('deviceId');
            // console.log(this.getBoundingClientRect())
            // console.log(DI.d3.clientPoint(this, 'contextmenu'))
            // console.log(DI.d3.mouse(this))
            DI.$rootScope.$emit("switch_opt",{event: calc_mouse_location(this), id: deviceId});
           });

        // this.deviceNode.append('rect')
        //   .attr('x', '-6')
        //   .attr('y', '-6')
        //   .attr('rx', '3')
        //   .attr('ry', '3')
        //   .attr('width', '36')
        //   .attr('height', '36')
        //   .attr('class', 'force-topo__node-outline')
      };

      let self = this;

      function addPort(d) {
        let len = 2.5;
        let port_height = 5;
        let padding_x = 5;
        let height = 24;
        let width = 126;
        let status_normal = '#81FF1A';
        let status_error = 'rgb(255,0,0)';
        let top = 8;
        let bottom = 4;

        let x_left = - height/2 + padding_x;
        let x_right = height/2 - padding_x - port_height;

        let ports = d.ports;
        if(Array.isArray(ports) && ports.length > 0){
          let curNode = DI.d3.select(this);
          let port_width = (width - top - bottom) / (parseInt(ports.length / 2)) - 3;

          ports.forEach((port, i)=>{
            let y = i % 2 === 0? x_left: x_right;
            let x = parseInt(i/2) * (port_width + 3) - (width/2 - top);
            if(ports.length > 60){
              len = 1.8;
            }
            curNode.append('rect')
              .attr('x', x + 12)
              .attr('y', y + 12)
              .attr('width', port_width)
              .attr('height', port_height)
              .attr('port_no', i+1)
              .classed('no_vlan_port', true)
              .on('mouseover', function () {
                let rect = self.di.d3.select(this);
                rect.style('stroke','#ff7c09').style('fill', '#ff7c09');

                curNode.select('text').text(d1=>{
                  return getDeviceName(d1.id) + ': '+ self.translate('MODULES.TOPO.INFO.PORT')+' '  + String(i + 1)
                });
              })
              .on('mouseout', function () {
                let rect = self.di.d3.select(this);
                rect.style('stroke',null).style('fill', null);

                curNode.select('text').text(d1=>{
                  return getDeviceName(d1.id)
                });
              });
          })
        }
      }

      let addAllPorts = () =>{
        this.deviceNode.each(addPort);
      }

      let addDeviceName =() =>{
        this.deviceNode
          .append('text')
          .attr('x', '-6')
          .attr('y', '-10')
          .classed('force-topo__text', true)
          .text(d => {
            return getDeviceName(d.id)
          })
      }


      let simulation_origin_tick_callback = () =>{
        this.simulation.on("tick", () => {
          this.linkNode
            .attr("x1", d => _calcPoint_X(d.source.x))
            .attr("y1", d => _calcPoint_Y(d.source.y))
            .attr("x2", d => _calcPoint_X(d.target.x))
            .attr("y2", d => _calcPoint_Y(d.target.y));

          this.deviceNode.attr('transform', d => {
            let x, y;
            x = _calcPoint_X(d.x);
            y = _calcPoint_Y(d.y);
            return 'translate(' + (x - ICON_SIZE / 2) + ',' + (y - ICON_SIZE / 2) + ')'
          });
        });
      }


      // let simulation_all_tick_callback = () =>{
      //   this.simulation.on("tick", () => {
      //     this.linkNode
      //       .attr("x1", d => _calcPoint_X(d.source.x))
      //       .attr("y1", d => _calcPoint_Y(d.source.y))
      //       .attr("x2", d => _calcPoint_X(d.target.x))
      //       .attr("y2", d => _calcPoint_Y(d.target.y));
      //
      //
      //     this.pathLinks
      //       .attr("x1", d => _calcPoint_X(d.source.x))
      //       .attr("y1", d => _calcPoint_Y(d.source.y))
      //       .attr("x2", d => _calcPoint_X(d.target.x))
      //       .attr("y2", d => _calcPoint_Y(d.target.y));
      //
      //     this.hostNode.attr('transform', d => {
      //       let x, y;
      //       x = _calcPoint_X(d.x);
      //       y = _calcPoint_Y(d.y);
      //       return 'translate(' + (x - ICON_SIZE / 2) + ',' + (y - ICON_SIZE / 2) + ')'
      //     });
      //
      //     this.deviceNode.attr('transform', d => {
      //       let x, y;
      //
      //       x = _calcPoint_X(d.x);
      //       y = _calcPoint_Y(d.y);
      //
      //       return 'translate(' + (x - ICON_SIZE / 2) + ',' + (y - ICON_SIZE / 2) + ')'
      //     });
      //   });
      // };

      function hostClickHandler(evt){
        let hostId = this.hostId;
        DI.$rootScope.$emit("host_select",{event:evt, id: hostId});
      }


      let calc_mouse_location = (self) =>{
        // let mouseEvent = DI.d3.mouse(self);
        let x = self.getBoundingClientRect();
        let evt = {
          'clientX': NODE_SIZE/2 + x.left,
          'clientY': NODE_SIZE/2 + x.top
        };
        return evt
      };

      let calc_linkmouse_location = (self) =>{
        let mouseEvent = DI.d3.mouse(self);
        let x = element[0].getBoundingClientRect();
        let evt = {
          'clientX': mouseEvent[0] + x.left,
          'clientY': mouseEvent[1] + x.top
        };
        return evt
      };

      function pathClickHandler() {
        DI.d3.event.stopPropagation();
        let data = DI.d3.select(this).datum();
        let param = { 'start':{id: data.__proto__.source}, 'end':{id: data.__proto__.target }};

        param.start['type'] = 'SWITCH';
        param.end['type'] = 'SWITCH';
        if(data.host){
          if(data.host === 'source'){
            param.start['type'] = 'HOST';
            param.end['port'] = data.target_port;
          } else {
            param.end['type'] = 'HOST';
            param.start['port'] = data.source_port;
          }
        } else {
          param.start['port'] = data.source_port;
          param.end['port'] = data.target_port;
        }
        DI.$rootScope.$emit("path_select", {event: calc_mouse_location(this), value: param});
      }


      this.pathLinks = null;
      this.hostNode = null;
      let genTopo = () => {

        let parentNode = element[0].parentNode;
        this.width = parentNode.offsetWidth;
        this.height = parentNode.offsetHeight;


        scope._links = this.formated_links.map(d => Object.create(d));
        scope._nodes = this.formated_devices.map(d => Object.create(d));

        scope.distance = SVG_LINE_LENGTH;
        scope.strength = -10;
        if (scope.devices.length !== 0) {
          let _distance = Math.sqrt(this.width * this.height * 0.7 / scope.devices.length);
          // console.log(_distance)
          // console.log('*************')
          if (_distance > 500) scope.distance = 500; else scope.distance = _distance;

          if (scope.devices.length >= 10 && scope.devices.length < 20) {
            scope.strength = -6;
          } else if (scope.devices.length >= 20 && scope.devices.length < 30) {
            scope.strength = -3;
          } else if (scope.devices.length > 30) {
            scope.strength = 0;
          }
        }


        this.simulation = DI.d3.forceSimulation(scope._nodes)
          .force("link", DI.d3.forceLink(scope._links).id(d => d.id).distance(d => {
            let sourceLinkCount = scope.deviceLinkDict[d.__proto__.source].length;
            let targetLinkCount = scope.deviceLinkDict[d.__proto__.target].length;

            // console.log('===========' + d.__proto__.source + ' ++++'+ d.__proto__.target);
            // console.log(sourceLinkCount)
            // console.log(sourceLinkCount)
            if(sourceLinkCount > 1 && targetLinkCount >1 ){
              return scope.distance;
            } else {
              return scope.distance/1.4;
            }
          }))
          .force("charge", DI.d3.forceManyBody().strength(scope.strength))
          .force("collide", DI.d3.forceCollide(60).strength(0.2).iterations(5));


        setTimeout(function(){
          reCenter();

        });


        scope.zoom = this.di.d3.zoom();


        svg = this.di.d3.select('.forceTopo > svg')
          .on('click', function () {
            DI.$rootScope.$emit('topo_unselect');
            scope.curSelectedDeviceId = null;
            removeSelectEffect();
          })
          .on('contextmenu',function () {
            DI.d3.event.preventDefault();
            // DI.$rootScope.$emit('topo_unselect');
          })
          .call(scope.zoom.scaleExtent([0.5, 4]).translateExtent([[-500, -500],[4000, 4000]])
            .on("zoom", zoomed))
          .on("dblclick.zoom", function (param) {
            let clientX = DI.d3.event.clientX;
            let clientY = DI.d3.event.clientY;
            let clientRect = element[0].getBoundingClientRect();
            let xDistance = clientX - clientRect.left - clientRect.width/2;
            let yDistance = clientY - clientRect.top - clientRect.height/2;


            let _svg = DI.d3.select('.forceTopo > svg');
            let transform = DI.d3.zoomTransform(_svg.node());

            let proportion = transform.k + 0.2/transform.k;
            transform.k = transform.k + 0.2;

            transform.x = (transform.x  - xDistance) * proportion;
            transform.y = (transform.y  - yDistance)* proportion;

            _svg.transition().duration(100).attr('transform','translate('+ transform.x +',' + transform.y +') scale('+ transform.k +')');


            return transform;
          });


        scope.portText1 = svg.append('text');
        scope.portText2 = svg.append('text');

        function zoomed() {
          svg.attr("transform",DI.d3.event.transform);
          // svg.attr("transform", ()=>{
          //   let transform = DI.d3.event.transform;
          //   if(transform.k <0.5){
          //     transform.k = 0.5
          //   }
          //   if(transform.x < -2000){
          //     transform.x  = -2000;
          //   }
          //
          //   if(transform.x > 4000){
          //     transform.x  = 4000;
          //   }
          //
          //   if(transform.y < -2000){
          //     transform.y  = -2000;
          //   }
          //
          //   if(transform.y > 4000){
          //     transform.y  = 4000;
          //   }
          //
          //   return transform;
          // });
        }

        this.defs = svg.append('defs');
        // 3.1 添加箭头

        // this.marker = this.defs
        //   .append("marker")
        //   .attr('id', "marker")
        //   .attr("markerWidth", 20)    //marker视窗的宽
        //   .attr("markerHeight", 20)   //marker视窗的高
        //   .attr("refX", scope.distance/3)            //refX和refY，指的是图形元素和marker连接的位置坐标
        //   .attr("refY", 8)
        //   .attr("orient", "auto")     //orient="auto"设置箭头的方向为自动适应线条的方向
        //   .attr("markerUnits", "userSpaceOnUse")  //marker是否进行缩放 ,默认值是strokeWidth,会缩放
        //   .append("path")
        //   .attr("d", "M 0 0 16 8 0 16Z")    //箭头的路径 从 （0,0） 到 （8,4） 到（0,8）
        //   .attr("fill", "rgb(255,124,9)");
        //
        //
        // this.start_marker = this.defs
        //   .append("marker")
        //   .attr('id', "start_marker")
        //   .attr("markerWidth", 20)    //marker视窗的宽
        //   .attr("markerHeight", 20)   //marker视窗的高
        //   .attr("refX", -scope.distance/3)            //refX和refY，指的是图形元素和marker连接的位置坐标
        //   .attr("refY", 8)
        //   .attr("orient", "auto")     //orient="auto"设置箭头的方向为自动适应线条的方向
        //   .attr("markerUnits", "userSpaceOnUse")  //marker是否进行缩放 ,默认值是strokeWidth,会缩放
        //   .append("path")
        //   .attr("d", "M 0 0 16 8 0 16Z")    //箭头的路径 从 （0,0） 到 （8,4） 到（0,8）
        //   .attr("fill", "rgb(255,124,9)");

        add_origin_link();
        add_origin_nodes();
        addAllPorts();
        addDeviceName();


        simulation_origin_tick_callback();
      };



      let highlightPortVlan = (vlanId) =>{
        let curVlanConfig = this.vlanConfig[vlanId];
        this.deviceNode.each(function (d) {
          let swtNode = DI.d3.select(this);
          let deviceId = swtNode.attr('deviceId');
          if(curVlanConfig[deviceId]){
            swtNode.selectAll('rect').each(function (d1) {
              // console.log(DI.d3.select(this).attr('port_no'))
              let portNode = DI.d3.select(this);
              let port_no = portNode.attr('port_no');
              let port_type = curVlanConfig[deviceId][port_no];
              if(port_type === 'untag'){
                portNode.classed('port_vlan_untag', true);
              } else if (port_type === 'tag'){
                portNode.classed('port_vlan_tag', true);
              }
            });
          }
        })
      }









      unsubscribers.push(this.di.$rootScope.$on('resize_summary', () => {
        console.log('receive resize_summary');
        reCenter();
        this.simulation.restart();
      }));

      unsubscribers.push(this.di.$rootScope.$on('resize_canvas', () => {
        console.log('receive resize_canvas');
        reCenter();
        this.simulation.restart();
      }));




      let showName = () => {
        // if(scope.topoSetting.show_tooltips){
          this.deviceNode
            .append('text')
            .attr('x', '-6')
            .attr('y', '-10')
            .classed('force-topo__text', true)
            .text(d => {
              return getDeviceName(d.id)
            })

          if(this.hostNode){
            this.hostNode
              .append('text')
              .attr('x', '-6')
              .attr('y', '-10')
              .classed('force-topo__text', true)
              .text(d => d.id)
          }
        // } else {
        //   this.deviceNode
        //     .select('text').remove();
        //
        //   if(this.hostNode){
        //     this.hostNode
        //       .select('text').remove();
        //   }
        // }
      };



      let isDeviceLink = (src, dst) =>{
        let src_sw = DI._.find(scope.devices, {'id': src});
        let dst_sw = DI._.find(scope.devices, {'id': dst});
        if(dst_sw && src_sw){
          return true;
        } else {
          return false;
        }
      }


      scope.$on('$destroy', () => {

        console.log('===<< vlantopp start to $destroy');


        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });

        this.simulation.on('tick', null);
        this.deviceNode.selectAll('g')
          .call(angular.noop)
          .on('click', angular.noop)
          .on('contextmenu',angular.noop);

        if(this.hostNode)
          this.hostNode
            .selectAll("g")
            .call(angular.noop)
            .on('click', angular.noop);

        if(this.pathLinks)
          this.pathLinks
            .selectAll("line")
            .on('click', angular.noop);



      });

      initialize();

    }).call(this);

  }
}


VlanTopo.$inject = VlanTopo.getDI();
VlanTopo.$$ngIsClass = true;