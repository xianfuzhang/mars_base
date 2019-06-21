
export class Topo {
  static getDI () {
    return [
      '$rootScope',
      '$window',
      '$timeout',
      'localStoreService',
      '$document',
      '_',
      'd3',
      'easingService',
      'switchService'
    ];
  }

  constructor (...args) {
    this.di = [];
    Topo.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/topo');

    this.scope = {
      spines: '=',
      leafs: '=',
      others:'=',
      links:'=',
      logicalPorts:'=',
      topoSetting:'='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      let unsubscribers = [];

      let DI = this.di;

      this.di.$window.requestAnimFrame = (function(callback) {
        return this.di.$window.requestAnimationFrame
          || this.di.$window.webkitRequestAnimationFrame
          || this.di.$window.mozRequestAnimationFrame
          || this.di.$window.oRequestAnimationFrame
          || this.di.$window.msRequestAnimationFrame
          || (function(callback) {
            this.di.$window.setTimeout(callback, 1000 / 60);
          }).call(this);
      }).call(this);

      this.height = 0;
      this.width = 0;
      // this.spineContainer = null;
      // this.leafContainer = null;
      // this.otherContainer = null;
      // this.spineContainerLeftNode = null;
      // this.spineContainerRightNode = null;
      // this.spineContainerText = null;
      //
      // this.leafContainerLeftNode = null;
      // this.leafContainerRightNode = null;
      // this.leafContainerText = null;
      //
      // this.otherContainerLeftNode = null;
      // this.otherContainerRightNode = null;
      // this.otherContainerText = null;

      this.paths = [];
      this.pathNodes = {};

      this.hosts = [];
      this.hostNodes = {};


      scope.selectedDeviceId = null;

      let DeviceType = {
        'leaf':'leaf',
        'spine':'spine',
        'other':'other'
      };
      this.stage = null;
      this.scene = null;

      this.spines = {};
      this.leafs = {};
      this.others = {};

      this.links = {};
      this.switchLocation = {};
      this.hostLocation = {};

      this.switch_width = 16;
      this.switch_height = 108;
      this.leaf_group_interval = 15;
      this.leaf_group_str = 'leaf_group_name';
      // this.leaf_group_str = 'id';
      this.resizeTimeout = null;
      this.active_status = "ACTIVE";
      this.LINE_WIDTH = 1;
      this.LINE_SELECTED = '136,234,136';
      this.LINE_NORMAL = '240,240,240';
      this.LINE_ERROR = "255,0,0";
      this.oldWidth = null;

      this.arrowDistance = 10;
      this.host_width = 48;
      this.host_height = 48;
      this.host_min_interval = 10;
      this.PATH_LINE_WIDTH = 3;
      this.PATH_LINE_SELECTED = '236,234,136';

      const EDGE_TYPE = 'EDGE';
      const DIRECT_TYPE = 'DIRECT';
      const LINK_ACTIVE_STATE = 'ACTIVE';


      let easingService = this.di.easingService;
      let switchLocation = this.switchLocation;


      // TEST Code START  ======= 此处代码是用来测试distance算法是否合理
      /*let devices = [{"available":true,"community":null,"id":"rest:192.168.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.168.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:192.168.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"192.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"192.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.168.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.168.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:292.168.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"292.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"292.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.169.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"192.169.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.169.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:192.169.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"192.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"192.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.169.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.169.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:292.169.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"292.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"292.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"}];
      let links = [{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.225:80","port":"49"},"src":{"device":"rest:192.168.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.230:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.229:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.227:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.226:80","port":"51"},"src":{"device":"rest:192.168.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.226:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.229:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.226:80","port":"49"},"src":{"device":"rest:192.168.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.227:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.225:80","port":"51"},"src":{"device":"rest:192.168.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.225:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.168.40.230:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"49"},"src":{"device":"rest:292.168.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.230:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.229:80","port":"50"},"src":{"device":"rest:292.168.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.227:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"51"},"src":{"device":"rest:292.168.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.229:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"49"},"src":{"device":"rest:292.168.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.227:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"51"},"src":{"device":"rest:292.168.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"52"},"src":{"device":"rest:292.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.230:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.225:80","port":"49"},"src":{"device":"rest:192.169.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.230:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.229:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.227:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.226:80","port":"51"},"src":{"device":"rest:192.169.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.226:80","port":"52"},"src":{"device":"rest:192.169.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.229:80","port":"49"},"src":{"device":"rest:192.169.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.226:80","port":"49"},"src":{"device":"rest:192.169.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.227:80","port":"49"},"src":{"device":"rest:192.169.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.225:80","port":"51"},"src":{"device":"rest:192.169.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.225:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:192.169.40.230:80","port":"49"},"src":{"device":"rest:192.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.225:80","port":"49"},"src":{"device":"rest:292.169.40.227:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.230:80","port":"50"},"src":{"device":"rest:192.169.40.226:80","port":"52"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.229:80","port":"50"},"src":{"device":"rest:292.168.40.226:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.227:80","port":"50"},"src":{"device":"rest:192.168.40.226:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.226:80","port":"51"},"src":{"device":"rest:292.169.40.229:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.226:80","port":"52"},"src":{"device":"rest:192.168.40.230:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.229:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"51"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.226:80","port":"49"},"src":{"device":"rest:292.169.40.227:80","port":"50"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.227:80","port":"49"},"src":{"device":"rest:292.169.40.225:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.168.40.225:80","port":"51"},"src":{"device":"rest:292.168.40.229:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.225:80","port":"52"},"src":{"device":"rest:292.168.40.230:80","port":"49"},"state":"ACTIVE","type":"DIRECT"},{"annotations":{"Key":"Value","protocol":"LINKDISCOVERY"},"dst":{"device":"rest:292.169.40.230:80","port":"49"},"src":{"device":"rest:292.168.40.225:80","port":"52"},"state":"ACTIVE","type":"DIRECT"}];

      // let len = 45;
      scope.devices = [];
      scope.links = links

      this.di._.forEach(scope.links, (link) => {
        let device1 = this.di._.find(devices, {"id": link.src.device});
        let device2 = this.di._.find(devices, {"id": link.dst.device});
        if (!this.di._.find(scope.devices, {"id": device1.id})) {
          scope.devices.push(device1)
        }

        if (!this.di._.find(scope.devices, {"id": device2.id})) {
          scope.devices.push(device2)
        }
      });*/
      // TEST Code END ======
      let BOUNDARY_SIZE = 36;
      let NODE_SIZE = 36;
      let ICON_SIZE = 24;
      let SVG_LINE_LENGTH = 120;

      this.source_devices = scope.devices;
      this.formated_devices = scope.devices;


      this.source_links = scope.links;
      this.formated_links = [];
      this.linkIds = [];


      // let getLinkId = (deviceIds, ports) => {
      //   let newDeviceIds = this.di._.sortBy(deviceIds);
      //   if (newDeviceIds[0] !== deviceIds[0]) {
      //     let tmp = ports[0];
      //     ports[0] = ports[1];
      //     ports[1] = tmp;
      //   }
      //   return newDeviceIds[0] + ':' + ports[0] + '_' + newDeviceIds[1] + ':' + ports[1];
      // };

      scope.deviceLinkDict = {};
      let formatLinks = (links) => {
        let formatted_links = [];
        scope.deviceLinkDict = {};
        this.di._.forEach(links, (link) => {
          // let newDeviceIds = this.di._.sortBy([link.src.device, link.dst.device]);
          // let linkId = newDeviceIds.join('-');

          let linkId = getLinkId([link.src.device, link.dst.device], [link.src.port, link.dst.port]);
          if (this.di._.findIndex(formatted_links, linkId) === -1 && isDeviceLink(link.src.device, link.dst.device)){
            let _link = angular.copy(link);
            _link['id'] = linkId;
            formatted_links.push(_link);

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
        });
        return formatted_links;
      };

      let drag = () => {
        let self = this;
        let d3 = this.di.d3;
        let originMouseX = null;
        let originMouseY = null;

        function dragstarted(d) {
          // d3.select(this).style('transition', null);
          originMouseX = d3.event.x;
          originMouseY = d3.event.y;
        }


        function dragged(d) {
          // console.log(d3.event)
          let pos = self.switchLocation[d.id];
          d3.select(this).attr('transform', 'translate(' + (pos[0] + d3.event.x - originMouseX) + ', ' +  (pos[1] + d3.event.y - originMouseY) + ')');

          // let swtThis = this;
          // let linkIds = scope.deviceLinkDict[d.id];
          // console.log('================')
          // console.log(linkIds)
          // self.linkNode.attr('d', link => {
          //   let pos1 = self.switchLocation[link.src.device];
          //   let pos2 = self.switchLocation[link.dst.device];
          //
          //   console.log(link.id);
          //   console.log(linkIds)
          //   if(linkIds.indexOf(link.id) !== -1){
          //     console.log('=-=-=-=-=--=-')
          //     if(d.id === link.src.device){
          //       pos1 = [pos[0] + d3.event.x - originMouseX, pos[1] + d3.event.y - originMouseY];
          //     } else {
          //       pos2 = [pos[0] + d3.event.x - originMouseX, pos[1] + d3.event.y - originMouseY];
          //     }
          //   }
          //   let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] + 170:pos1[1] + 170];
          //   if( Math.abs(pos2[0] - pos1[0]) < 20){
          //     return 'M ' + pos1[0] + ' ' + pos1[1] +  ' ' + pos2[0] + ' ' + pos2[1];
          //   }
          //   return 'M ' + pos1[0] + ' ' + pos1[1] + ' Q ' + middleP[0] + ' ' +  middleP[1] + ' ' + pos2[0] + ' ' + pos2[1];
          //
          // });
        }

        function dragended(d) {
          // d3.select(this).style('transition', '0.3s cubic-bezier(0.215, 0.61, 0.355, 1) transform');
          let pos = self.switchLocation[d.id];
          d3.select(this).attr('transform', 'translate(' +  pos[0] + ', ' +  pos[1] + ')');

          originMouseX = null;
          originMouseY = null;

          // self.linkNode.attr('d',null);
          //
          // self.di.$timeout(()=>{
          //   self.linkNode.attr('d', link => {
          //     let pos1 = self.switchLocation[link.src.device];
          //     let pos2 = self.switchLocation[link.dst.device];
          //     let middleP = [(pos1[0] + pos2[0]) / 2, pos2[1] > pos1[1] ? pos2[1] + 170 : pos1[1] + 170];
          //     if (Math.abs(pos2[0] - pos1[0]) < 50) {
          //       return 'M ' + pos1[0] + ' ' + pos1[1] + ' ' + pos2[0] + ' ' + pos2[1];
          //     }
          //     return 'M ' + pos1[0] + ' ' + pos1[1] + ' Q ' + middleP[0] + ' ' + middleP[1] + ' ' + pos2[0] + ' ' + pos2[1];
          //   });
          // }, 300)

        }

        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      };

      let initialize = () => {

        this.svg = this.di.d3.select('.topo > svg')
          .on('click', function () {
            DI.$rootScope.$emit('topo_unselect');
            scope.curSelectedDeviceId = null;
            removeSelectEffect();


          })
          .on('contextmenu',function () {
            DI.d3.event.preventDefault();
            // DI.$rootScope.$emit('topo_unselect');
          });

        this.defs = this.svg.append('defs');
        // 3.1 添加箭头

        this.marker = this.defs
          .append("marker")
          .attr('id', "marker")
          .attr("markerWidth", 20)    //marker视窗的宽
          .attr("markerHeight", 20)   //marker视窗的高
          .attr("refX", this.arrowDistance)
          .attr("refY", 8)
          .attr("orient", "auto")     //orient="auto"设置箭头的方向为自动适应线条的方向
          .attr("markerUnits", "userSpaceOnUse")  //marker是否进行缩放 ,默认值是strokeWidth,会缩放
          .append("path")
          .attr("d", "M 0 0 16 8 0 16Z")    //箭头的路径 从 （0,0） 到 （8,4） 到（0,8）
          .attr("fill", "rgb(255,124,9)");
        // .attr("refX", scope.distance/3)            //refX和refY，指的是图形元素和marker连接的位置坐标


        this.start_marker = this.defs
          .append("marker")
          .attr('id', "start_marker")
          .attr("markerWidth", 20)    //marker视窗的宽
          .attr("markerHeight", 20)   //marker视窗的高
          .attr("refX",  -this.arrowDistance)            //refX和refY，指的是图形元素和marker连接的位置坐标
          .attr("refY", 8)
          .attr("orient", "auto")     //orient="auto"设置箭头的方向为自动适应线条的方向
          .attr("markerUnits", "userSpaceOnUse")  //marker是否进行缩放 ,默认值是strokeWidth,会缩放
          .append("path")
          .attr("d", "M 0 0 16 8 0 16Z")    //箭头的路径 从 （0,0） 到 （8,4） 到（0,8）
          .attr("fill", "rgb(255,124,9)");

        setTimeout(delayInit,200);
      };

      function addPort(d) {
        let len = 2.5;
        let port_width = 3;
        let padding_x = 4;
        let height = self.switch_height;
        let width = self.switch_width;
        let status_normal = '#81FF1A';
        let status_error = 'rgb(255,0,0)';
        let top = 8;
        let bottom = 4;

        let x_left = - width/2 + padding_x;
        let x_right = width/2 - padding_x - port_width;

        let ports = d.ports;
        if(Array.isArray(ports) && ports.length > 0){
          let curNode = DI.d3.select(this);
          let port_height = (height - top - bottom) / (parseInt(ports.length / 2)) - 1;

          ports.forEach((port, i)=>{
            let x = i % 2 === 0? x_left: x_right;
            let y = parseInt(i/2) * (port_height + 1) - (height/2 - top);
            if(ports.length > 60){
              len = 1.8;
            }

            let colorClass = port.isEnabled?'status_normal':'status_error';
            curNode.append('rect')
              .attr('x', x)
              .attr('y', y)
              .attr('width', port_width)
              .attr('height', port_height)
              .classed(colorClass, true)
          })
        }
      }

      let addAllPorts = () =>{
        this.spinesNode.each(addPort);
        this.leafsNode.each(addPort);
      }


      let crushAllPorts = () =>{
        this.spinesNode.selectAll('rect:not(.topo__node-outline)').remove();
        this.leafsNode.selectAll('rect:not(.topo__node-outline)').remove();
      }

      let delayInit = () =>{
        genSpine();
        genLeaf();
        genOther();

        // if(scope.topoSetting.show_links === 2){
        //   genLinks()
        // }

        if(scope.topoSetting.show_ports){
          addAllPorts();
        }
        resize(true);
      };


      let addHostSelectEffect = (node) => {
        // this.di.d3.select(node).select('rect').attr('fill','#d5f6ff')
        this.di.d3
          .select(node)
          .select('rect')
          .classed('host-select', true)
      };

      let addSelectEffect = (node, deviceId) => {
        this.di.d3.select(node).select('rect').classed('node_select', true);

        if(scope.topoSetting.show_links === 1){

          showDeviceLinks(deviceId);
          /*crushLinks();
          let _links = [];
          this.di._.forEach(scope.links, (link, key) => {
            if(deviceId == link.src.device){
              _links.push(link)
              /!*let deviceIds = [link.src.device, link.dst.device];
              let ports = [link.src.port, link.dst.port];
              let linkId = getLinkId(deviceIds, ports);
              if(this.links[linkId]){
                return;
              }
              this.links[linkId] = genLinkNode(deviceIds, linkId);
              this.links[linkId].strokeColor = this.LINE_SELECTED;
              if(link.state != this.active_status){
                this.links[linkId].strokeColor = this.LINE_ERROR;
              }*!/
            }
          });

          scope._links = formatLinks(_links);
          this.linkNode = this.svg.append("g").attr('id', 'origin_link')
            .selectAll('g')
            .data(scope._links)
            .join("path")
            .attr('fill','none')
            .attr('stroke','green');
          relocatePath();*/
        } else if(scope.topoSetting.show_links === 2) {
          let linkIds = scope.deviceLinkDict[deviceId];
          self.linkNode
            .classed('line_unselect', link => {
              if(!linkIds || linkIds.indexOf(link.id) !== -1){
                return false;
              } else {
                return true;
              }
            })
            .classed('line_select', link => {
              if(linkIds && linkIds.indexOf(link.id) !== -1){
                return true;
              } else {
                return false;
              }
            });
        }
      };

      let removeSelectEffect = () => {

        this.spinesNode.select('rect').classed('node_select', false);
        this.leafsNode.select('rect').classed('node_select', false);
        this.othersNode.select('rect').classed('node_select', false);

        if(scope.topoSetting.show_links === 1){
          crushLinks();
        } else if(scope.topoSetting.show_links === 2) {
          this.linkNode
            .classed('line_unselect', false)
            .classed('line_select', false);
        }

        if(this.hostsNode){
          this.hostsNode
            .select('rect')
            .classed('host-select', false)
        }
        // this.deviceNode
        //   .select('rect')
        //   .classed('node-select', false)
        //   .classed('node-unselect', true);


      };

      let self = this;
      function switchClick(d) {

        DI.d3.event.stopPropagation();
        removeSelectEffect();

        let swtThis = this;

        addSelectEffect(this, d.id);

        let deviceId =  d.id;
        let deviceType = d.type;
        let showArray= [];
        scope.selectedDeviceId  = deviceId;
        // showDeviceLinks(deviceId);


        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("hide_tooltip");
        }


        if(deviceType == DeviceType.spine){
          let sw = DI._.find(scope.spines,{'id':deviceId});
          showArray = DI.switchService.getSpineShowInfo(sw);
        } else if(deviceType == DeviceType.leaf){
          let sw = DI._.find(scope.leafs,{'id':deviceId});
          showArray = DI.switchService.getLeafShowInfo(sw);
        } else {
          let sw = DI._.find(scope.others,{'id':deviceId});
          showArray = DI.switchService.getOtherShowInfo(sw);
        }
        DI.$rootScope.$emit("switch_select",{event: DI.d3.event, id: deviceId, type: deviceType, value: showArray});

      }

      function switchMouseOver(d){
        DI.d3.event.stopPropagation();
        let deviceId =  d.id;
        let deviceType = d.type;

        let showArray= [];

        if(deviceType == DeviceType.spine){
          let sw = DI._.find(scope.spines,{'id':deviceId});
          showArray = DI.switchService.getSpineShowInfo(sw);
        } else if(deviceType == DeviceType.leaf){
          let sw = DI._.find(scope.leafs,{'id':deviceId});
          showArray = DI.switchService.getLeafShowInfo(sw);
        } else {
          let sw = DI._.find(scope.others,{'id':deviceId});
          showArray = DI.switchService.getOtherShowInfo(sw);
        }

        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("show_tooltip",{event: calc_mouse_location(this), value: showArray});
        }
      }

      function switchMouseOut() {
        DI.d3.event.stopPropagation();
        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("hide_tooltip");
        }
      }

      let genSpine = () =>{
        this.spinesNode = this.svg.append("g").attr('id', 'spine_node')
          .selectAll("g")
          .data(scope.spines)
          .join('g')
          .style('cursor','pointer')
          .html(d => {
            let device_status_class = 'topo__node-normal';
            if (!d.available) {
              device_status_class = 'topo__node-error';
            }
            // return '<rect x="-8" y="-54" rx="3" ry="3" width="16" height="108" class="topo__node-outline ' + device_status_class +  '"/>'
            return '<rect x="' + (- this.switch_width/2 )+ '" y="' + (-this.switch_height/2)+'" rx="3" ry="3" width="' + this.switch_width + '" height="' + this.switch_height +'" class="topo__node-outline ' + device_status_class +  '" />'
          })
          .on('click', switchClick)
          .on('mouseover', switchMouseOver)
          .on('mouseout', switchMouseOut)
          .on('contextmenu',function (d) {
            DI.d3.event.preventDefault();
            DI.d3.select(this).select('rect').classed('node_select', true);
            DI.$rootScope.$emit("switch_opt",{event: calc_mouse_location(this), id: d.id});
          });;

        // .call(drag())
      };

      let genLeaf = () =>{
        this.leafsNode = this.svg.append("g").attr('id', 'leaf_node')
          .selectAll("g")
          .data(scope.leafs)
          .join('g')
          .style('cursor','pointer')
          .html(d => {
            let device_status_class = 'topo__node-normal';
            if (!d.available) {
              device_status_class = 'topo__node-error';
            }
            return '<rect x="' + (- this.switch_width/2 )+ '" y="' + (-this.switch_height/2)+'" rx="3" ry="3" width="' + this.switch_width + '" height="' + this.switch_height +'" class="topo__node-outline ' + device_status_class +  '" />'
          })
          .on('click', switchClick)
          .on('mouseover', switchMouseOver)
          .on('mouseout', switchMouseOut)
          .on('contextmenu',function (d) {
            DI.d3.event.preventDefault();
            DI.d3.select(this).select('rect').classed('node_select', true);
            DI.$rootScope.$emit("switch_opt",{event: calc_mouse_location(this), id: d.id});
          });;
        // .call(drag())


      };

      let genOther = () => {

        this.othersNode = this.svg.append("g").attr('id', 'other_node')
          .selectAll("g")
          .data(scope.others)
          .join('g')
          .style('cursor','pointer')
          .html(d => {
            let device_status_class = 'topo__node-error';
            if (!d.available) {
              device_status_class = 'topo__node-error';
            }
            return '<rect x="' + (- this.switch_width/2 )+ '" y="' + (-this.switch_height/2)+'" rx="3" ry="3" width="' + this.switch_width + '" height="' + this.switch_height +'" class="topo__node-outline ' + device_status_class +  '" />'
            // return '<rect x="-8" y="-54" rx="3" ry="3" width="16" height="108" class="topo__node-outline ' + device_status_class +  '" />'
          })
          .on('click', switchClick)
          .on('mouseover', switchMouseOver)
          .on('mouseout', switchMouseOut)
          .on('contextmenu',function (d) {
            DI.d3.event.preventDefault();
            DI.d3.select(this).select('rect').classed('node_select', true);
            DI.$rootScope.$emit("switch_opt",{event: calc_mouse_location(this), id: d.id});
          });;
        // .call(drag())
      };

      let genLinks = () => {
          if(scope.topoSetting.show_links === 2){
            crushLinks();

            scope._links = formatLinks(scope.links);

            // console.log('genLinks======>')
            let self = this;
            this.linkNode = this.svg.append("g").attr('id', 'origin_link')
              .selectAll('g')
              .data(scope._links)
              .join("path")
              .classed('topo_line', true);
              // .attr('fill','none')
              // .attr('stroke','green');

            // genPeerLinks();
            relocatePath();
          }
      };

      let genPeerLink = (devices, linkId, isOk) =>{
        let nodeA = this.leafs[devices[0]] || this.spines[devices[0]] || this.others[devices[0]];
        let nodeB = this.leafs[devices[1]] || this.spines[devices[1]] || this.others[devices[1]];

        let link = new JTopo.Link(nodeA, nodeB);
        link.zIndex = 20;
        link.linkId = linkId;
        link.dashedPattern = 5;
        link.lineWidth = this.LINE_WIDTH;
        link.strokeColor = this.LINE_SELECTED;
        link.dragable = false;
        if(!isOk){
          link.strokeColor = this.LINE_ERROR;
        }
        // link.mouseover(linkMouseOverHandler);
        // link.mouseout(linkMouseOutHandler);

        this.scene.add(link);
        return link;
      };

      let crushLinks =()=>{
        this.svg.select('#origin_link').remove();
        this.linkNode = null;
        // this.di._.forEach(this.links, (link, key) => {
        //   this.scene.remove(link);
        // });
        //
        // delete this.links;
        // this.links = {};
      };

      let getLinkId = (deviceIds, ports) =>{
        let newDeviceIds = this.di._.sortBy(deviceIds);
        if(newDeviceIds[0] !== deviceIds[0]){
          let tmp = ports[0];
          ports[0] = ports[1];
          ports[1] = tmp;
        }
        return newDeviceIds[0] + ':' + ports[0] + '_' + newDeviceIds[1] + ':' + ports[1];
      };


      let _checkPortState = (device, port)=>{
        let state = false;
        this.di._.forEach(scope.links, (link)=>{
          if((link.src.device === device.id && link.src.port === String(port)) || (link.dst.device === device.id && link.dst.port === String(port))){
            if(link.state === 'ACTIVE'){
              state = true;
              return false;
            }
          }
        });
        return state
      };

      let _checkPeerLinksState = (memberDict) =>{
        let keys = this.di._.keys(memberDict);
        let isOk = true;
        this.di._.forEach(keys, (key)=>{
          // let device = this.leafs[key] || this.spines[key] || this.others[key];
          let device = this.di._.find(scope.leafs,{'id':key});
          if(device){
            // TODO 目前用的是交换机 leafgroup中的port， 后面如果switch port 不起作用，那么要用memberDict中的port
            isOk = _checkPortState(device, device.leafGroup.switch_port);
            if(isOk === false){
              return false;
            }
          } else {
            console.log('[topo.js > _checkPeerLinksState()] Device '+ key + ' 找不到');
          }

        });
        return isOk;
      };

      let genPeerLinks = ()=> {
        this.di._.forEach(scope.logicalPorts, (logicalPort)=>{
          if(logicalPort.is_mlag){
            let memberDict = this.di._.groupBy(logicalPort.members, 'device_id');
            let isPeerLinkOk = _checkPeerLinksState(memberDict);

            let keys = this.di._.keys(memberDict);
            let newKeys = this.di._.sortBy(keys);
            let linkId =  newKeys[0] + '__' + newKeys[1];
            console.log('genPeerLinks  ====== >' + linkId);
            this.links[linkId] = genPeerLink(newKeys,linkId, isPeerLinkOk)
          }
        })
      };


      let genLinkNode = (devices, linkId) => {
        // let nodeA = this.leafs[devices[0]] || this.spines[devices[0]] || this.others[devices[0]];
        // let nodeB = this.leafs[devices[1]] || this.spines[devices[1]] || this.others[devices[1]];
        //
        // let link = new JTopo.Link(nodeA, nodeB);
        // link.zIndex = 20;
        // link.linkId = linkId;
        // link.lineWidth = this.LINE_WIDTH;
        // link.strokeColor = this.LINE_SELECTED;
        // link.dragable = false;
        //
        // link.mouseover(linkMouseOverHandler);
        // link.mouseout(linkMouseOutHandler);
        //
        // this.scene.add(link);
        // return link;
        return null;
      };

      let selectTransform = (originSelect) => {
        let targetSelect = originSelect;
        targetSelect = targetSelect.replace(/\./g, '\\\.');
        targetSelect = targetSelect.replace(/:/g, '\\\:');
        // console.log(targetSelect)
        return targetSelect;
      }

      let draw = (width) =>{

        let rect = element[0].getBoundingClientRect();

        let avgHeight = this.height/3;
        let spineInterval = calcInterval(scope.spines, width);
        //leaf有分组，需要特殊处理
        let leafInterval = calcLeafInterval(scope.leafs, width);
        let otherInterval = calcInterval(scope.others, width);

        this.spinesNode.attr('transform', (d,i) =>{
          let x = (i + 1) * spineInterval + i * this.switch_width;
          let y =  avgHeight/2;
          this.switchLocation[d.id] = [x, y];
          return 'translate(' + x + ',' + y + ')';
        });


        let leaf_group_str = this.leaf_group_str;
        let non_leafs = this.di._.filter(scope.leafs, function (leaf) {
          return leaf[leaf_group_str] === null;
        });

        let leaf_groups_t = this.di._.filter(scope.leafs, function (leaf) {
          return leaf[leaf_group_str] !== null;
        });

        let leaf_groups = this.di._.groupBy(leaf_groups_t, leaf_group_str);
        let orderKeys = this.di._.keys(leaf_groups);
        let last_x = 0;
        for(let i = 0; i< orderKeys.length; i++){
          let key = orderKeys[i];
          let leaf_group = leaf_groups[key]; //arr
          for(let j = 0; j < leaf_group.length; j ++){
            let y = avgHeight/2 + avgHeight;
            let x = last_x + leafInterval + j * (this.switch_width + this.leaf_group_interval);
            this.switchLocation[leaf_group[j].id] = [x, y];

          }
          last_x = last_x + leafInterval + this.switch_width* leaf_group.length + this.leaf_group_interval * (leaf_group.length-1) ;
        }
        if(non_leafs instanceof Array){
          for(let j = 0; j< non_leafs.length; j ++){
            let y = avgHeight/2 + avgHeight;
            let x = last_x + leafInterval;
            this.switchLocation[non_leafs[j].id] = [x, y];
            last_x = last_x + leafInterval + this.switch_width*1;
          }
        }
        // this.leafContainerText.setLocation(10, 10 + avgHeight);
        this.leafsNode.attr('transform', (d,i )=> {
          let pos = this.switchLocation[d.id];
          return 'translate(' + pos[0] + ',' + pos[1] + ')';
        });

        this.othersNode.attr('transform', (d,i )=> {
          let x = (i + 1) * otherInterval + i * this.switch_width;
          let y =  avgHeight/2 + avgHeight * 2 ;

          this.switchLocation[d.id] = [x, y];

          return 'translate(' + x + ',' + y + ')';
        });

        // let otherKeys = this.di._.keys(this.others);
        // otherKeys = this.di._.sortBy(otherKeys);
        // for(let i = 0; i< otherKeys.length; i++){
        //   let key = otherKeys[i];
        //   let node = this.others[key];
        //   let x = (i + 1) * otherInterval + i * this.switch_width;
        //   let y =  (avgHeight - this.switch_height)/2 + avgHeight * 2;
        //   node.setLocation(x, y);
        //   this.switchLocation[key] = [x, y];
        // }
        // this.otherContainerText.setLocation(10, 10 + avgHeight*2);



        relocatePath();
        if(this.paths){
          clearPath();
          showPath()
        }

      };

      let relocatePath = () =>{
        if(scope.topoSetting.show_links === 2 || scope.topoSetting.show_links === 1) {
          if(this.linkNode){
            this.linkNode.attr('d', d=>{
              let deviceIds = [d.src.device, d.dst.device];
              let ports = [d.src.port, d.dst.port];
              let linkId = getLinkId(deviceIds, ports);
              // let pos1 = angular.copy(this.switchLocation[d.src.device]);
              // let pos2 = angular.copy(this.switchLocation[d.dst.device]);
              // let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] + 170:pos1[1] + 170];
              //新的布局方式 START
              let pos1 = angular.copy(this.switchLocation[d.src.device]);
              if(DI._.find(scope.spines,{'id':d.src.device})){
                pos1[1] = pos1[1] + this.switch_height/2;
              } else if(DI._.find(scope.leafs,{'id':d.src.device})){
                pos1[1] = pos1[1] - this.switch_height/2;
              } else {
                return '';
              }
              let pos2 = angular.copy(this.switchLocation[d.dst.device]);
              if(DI._.find(scope.spines,{'id':d.dst.device})){
                pos2[1] = pos2[1] + this.switch_height/2;
              } else if(DI._.find(scope.leafs,{'id':d.dst.device})){
                pos2[1] = pos2[1] - this.switch_height/2;
              } else {
                return '';
              }
              let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] :pos1[1]];
              //新的布局方式 END
              if( Math.abs(pos2[0] - pos1[0]) < 20){
                return 'M ' + pos1[0] + ' ' + pos1[1] +  ' ' + pos2[0] + ' ' + pos2[1];
              }
              return 'M ' + pos1[0] + ' ' + pos1[1] + ' Q ' + middleP[0] + ' ' +  middleP[1] + ' ' + pos2[0] + ' ' + pos2[1];
              // if(d.state != this.active_status){
              //   this.links[linkId].strokeColor = this.LINE_ERROR;
              // }
            });
          }
        }
      }

      let calcInterval = (nodes, width) =>{
        return (width - this.switch_width * nodes.length)/(nodes.length + 1)
      };

      let calcLeafInterval = (leafs, width) =>{
        // let remainWidth = width - this.switch_width * leafs.length;
        // let null_length = 0;
        // let leaf_group_str = this.leaf_group_str;
        // let non_leafs = this.di._.filter(leafs, function (leaf) {
        //   return leaf[leaf_group_str] === null;
        // });
        //
        // if(non_leafs instanceof  Array) null_length = non_leafs.length;
        //
        // let c_leafs = this.di._.filter(leafs, function (leaf) {
        //   return leaf[leaf_group_str] !== null;
        // });

        // let group = this.di._.groupBy(c_leafs, this.leaf_group_str);
        // let groupLen = this.di._.keys(group).length + null_length;
        // remainWidth = remainWidth - groupLen * this.leaf_group_interval;
        // return remainWidth/ (groupLen + 1);
        return (width - this.switch_width * leafs.length)/(leafs.length + 1)
      };

      let genAnchorNode = () =>{
        let node = new JTopo.Node();
        node.dragable = false ;
        node.width = 0;
        node.showSelected =false;
        node.fillColor = "rgba(0,0,0,.2)";

        this.scene.add(node);
        return node;
      };

      let genTextNode = (text) =>{
        let node = new JTopo.Node(text);
        node.dragable = false ;
        node.showSelected =false;
        node.font = '16px 微软雅黑';
        node.fontColor = "255,255,255";
        node.fillColor = "rgba(0,0,0,.2)";
        node.textPosition = 'Middle_Center';
        node.borderRadius = 3;
        node.width = 100;
        node.height = 25;
        this.scene.add(node);
        return node;
      };

      let genNormalNode = (deviceId, type, ports, status) =>{
        let node = new JTopo.Node();
        node.dragable = true ;
        node.width = this.switch_width;
        node.height = this.switch_height;
        node.showSelected =true;
        node.deviceId = deviceId;
        node.deviceType = type;
        node.move = false;
        node.status = status;

        node.mouseup(mouseUpHandler);
        node.mousedrag(mouseDragHandler);
        node.mouseover(mouseOverHandler);
        node.mouseout(mouseOutHandler);
        node.click(clickHandler);

        //根据实际的端口数来
        // let count = ports.length;
        //超过48个端口len为2，根据实际情况来
        let len = 2.5;
        let height = this.switch_height;
        let width = this.switch_width;
        let status_normal = '#81FF1A';
        let status_error = 'rgb(255,0,0)';
        let top = 4;

        let self = this;
        node.paint = function(g){
          g.beginPath();
          g.rect(-width/2, -height/2, width, height);

          if(node.status === false){
            g.fillStyle ='rgb(255,0,0)';
          } else {
            g.fillStyle = self.getNodeColor();
          }
          g.fill();
          g.closePath();

          if(scope.topoSetting.show_ports && ports && ports instanceof Array && ports.length > 0){
            if(ports.length > 60){
              len = 1.8;
            }
            let padding = (width - len * 2)/3;
            let left = - width/2 + padding;
            let right = width/2 -padding - len;
            // top = 8;
            for(let i = 0; i< ports.length ; i++){
              let port = ports[i];
              g.beginPath();
              if(i % 2 === 0){
                g.rect(left, -height/2 +  top + parseInt(i/2) * (len + 1), len , len);
              } else {
                g.rect(right, -height/2 + top + parseInt(i/2) * (len + 1), len , len);
              }
              g.fillStyle = status_normal;
              if(!port.isEnabled){
                g.fillStyle = status_error;
              }
              g.fill();
              g.closePath();
            }
          }

          this.paintText(g);
        };

        this.scene.add(node);
        return node;
      };

      let genHostNode = (host) =>{
        let node = new JTopo.Node();
        node.dragable = true ;
        node.width = this.host_width;
        node.height = this.host_height;
        node.showSelected =true;
        // node.ip_address = ipAddresses;
        node.hostId = host['id'];
        node.connect_swt = host['connect_swt'];
        node.move = false;
        let hostImageUrl = require('../../../assets/images/compute.png');
        node.setImage(hostImageUrl, true);

        node.click(hostClickHandler);

        this.scene.add(node);

        return node;
      };

      // let genHostSwitchLink = (hostId, deviceId,devicePort, isActive,isAgainst) =>{
      //   let swt = this.leafs[deviceId] || this.spines[deviceId] || this.others[deviceId];
      //   let host = this.hostNodes[hostId];
      //   let link;
      //   if(isAgainst){
      //     link = new JTopo.Link(swt, host);
      //     link.src_port = devicePort;
      //   } else {
      //     link = new JTopo.Link(host, swt);
      //     link.dst_port = devicePort;
      //   }
      //   link.arrowsRadius = 15;
      //
      //   link.zIndex = 100;
      //   link.lineWidth = this.PATH_LINE_WIDTH;
      //
      //   if(isActive)
      //     link.strokeColor = this.PATH_LINE_SELECTED;
      //   else
      //     link.strokeColor = this.LINE_ERROR;
      //
      //   // link.strokeColor = this.PATH_LINE_SELECTED;
      //   link.dragable = false;
      //
      //   // node.mouseover(pathMouseOverHandler);
      //   // node.mouseout(pathMouseOverHandler);
      //   link.click(pathClickHandler);
      //
      //
      //   this.scene.add(link);
      //   return link;
      // };

      // function pathClickHandler(evt) {
      //   let startNode = this.nodeA;
      //   let endNode = this.nodeZ;
      //   let param = {'start':{}, 'end':{}};
      //   if(startNode.hostId){
      //     param.start['type'] = 'HOST';
      //     param.start['id'] = startNode.hostId;
      //   } else {
      //     param.start['type'] = 'SWITCH';
      //     param.start['id'] = startNode.deviceId;
      //     param.start['port'] = this.src_port;
      //   }
      //
      //   if(endNode.hostId){
      //     param.end['type'] = 'HOST';
      //     param.end['id'] = endNode.hostId;
      //   } else {
      //     param.end['type'] = 'SWITCH';
      //     param.end['id'] = endNode.deviceId;
      //     param.end['port'] = this.dst_port;
      //   }
      //
      //   DI.$rootScope.$emit("path_select",{event:evt, value: param});
      // }

      // let pathMouseOutHandler = (evt) => {
      //   // console.log('node mouse out');
      //     this.di.$rootScope.$emit("hide_path_tooltip");
      // };

      let relocateHost = () =>{
        let avgHeight = this.height/3;
        let y = avgHeight/2 + avgHeight * 2;
        let lastX = -1;


        if(this.hostsNode){
          this.hostsNode.attr('transform', (d,i)=>{
            let swtX = this.switchLocation[d.connect_swt][0];
            if(i%2 === 0){
              this.hostLocation[d.id] = [swtX - this.host_width, y];
              return 'translate(' + (swtX - this.host_width) + ',' + y + ')';
            } else {
              this.hostLocation[d.id] = [swtX + this.host_width, y];
              return 'translate(' + (swtX + this.host_width) + ',' + y + ')';
            }
          });
        }

        // this.di._.forEach(this.hosts, (hostDict)=>{
        //   let hostNode = this.hostNodes[hostDict['id']];
        //   let swtId = hostNode.connect_swt;
        //   let swtX = this.switchLocation[swtId][0];
        //   if(lastX !== -1){
        //     if(swtX - lastX < this.host_width + this.host_min_interval){
        //       lastX = lastX + this.host_width + this.host_min_interval;
        //     } else {
        //       lastX = swtX + this.host_width;
        //     }
        //   } else {
        //     lastX = swtX - this.host_width;
        //   }
        //   hostNode.setLocation(lastX, y);
        // })
      };

      let genAllHosts = () =>{

        this.hostsNode = this.svg.append("g").attr('id', 'host_node')
          .selectAll("g")
          .data(this.hosts)
          .join('g')
          .attr("width", ICON_SIZE)
          .attr("height", ICON_SIZE)
          .style('cursor','pointer')
          .html(d => {
            return '<rect x="-12" y="-12" rx="3" ry="3" width="48" height="48" class="topo__node-outline" /><path class="topo__host" style="pointer-events: none" xmlns="http://www.w3.org/2000/svg" d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>'
          })
          .on('click', function clickHandler(d, i) {
            DI.d3.event.stopPropagation();

            removeSelectEffect();
            DI.$rootScope.$emit('topo_unselect');

            let mac = d.id;

            DI.$rootScope.$emit("host_select",{event:calc_mouse_location(this), id: mac});
            // DI.$rootScope.$emit("switch_select", {event: null, id: deviceId, type: null, value: showArray});

            scope.curSelectedDeviceId = null;
            addHostSelectEffect(this);
          });
      };

      let genPathLinkNode = (devices, ports, isActive) => {
        let nodeA = this.leafs[devices[0]] || this.spines[devices[0]] || this.others[devices[0]];
        let nodeB = this.leafs[devices[1]] || this.spines[devices[1]] || this.others[devices[1]];

        let link = new JTopo.Link(nodeA, nodeB);
        link.arrowsRadius = 15;
        link.zIndex = 100;
        link.lineWidth = this.PATH_LINE_WIDTH;
        if(isActive)
          link.strokeColor = this.PATH_LINE_SELECTED;
        else
          link.strokeColor = this.LINE_ERROR;
        link.dragable = false;
        link.src_port =ports[0];
        link.dst_port =ports[1];

        link.click(pathClickHandler);

        // node.mouseover(pathMouseOverHandler);
        // node.mouseout(pathMouseOverHandler);
        this.scene.add(link);
        return link;
      };

      let genAllPathLinks = () =>{
        this.pathNode = this.svg.append("g").attr('id', 'path_link')
          .style('marker-end','url(#marker)')
          .selectAll('g')
          .data(this.paths)
          .join("path")
          .attr('fill','none')
          .attr('stroke-width','3px')
          .attr('stroke','orange')
          .style('cursor','pointer')
          .on('click', pathClickHandler);

        this.pathNode.append('animate')
          .attr('attributeName', 'd')
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite')
          .attr('values', (path, i)=>{
            let src_arr = path['src'].split('/');
            let dst_arr = path['dst'].split('/');
            // let pos1 = this.switchLocation[deviceIds[0]];
            // let pos2 = this.switchLocation[deviceIds[1]];
            if(src_arr.length === 2 && dst_arr.length === 2){
              let deviceIds = [src_arr[0], dst_arr[0]];
              let pos1 = this.switchLocation[deviceIds[0]];
              let pos2 = this.switchLocation[deviceIds[1]];
              // let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] + 170:pos1[1] + 170];
              return 'M ' + pos1[0] + ' ' + pos1[1] + ' ' + pos2[0] + ' ' + pos2[1] + ' ' + pos1[0] + ' ' + pos1[1] + ' ' + pos1[0] + ' ' + pos1[1] +
                ';M ' + pos1[0] + ' ' + pos1[1] + ' ' + pos2[0] + ' ' + pos2[1] + ' ' + pos1[0] + ' ' + pos1[1] + ' ' + pos2[0] + ' ' + pos2[1];
            } else {

              let hostId = null, deviceId = null, devicePort = null;
              if(src_arr.length === 3){
                hostId = src_arr[0] + '/' +src_arr[1];
                deviceId = dst_arr[0];
                devicePort = dst_arr[1];
                let pos1 = this.hostLocation[hostId];
                let pos2 = this.switchLocation[deviceId];
                // let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] + 170:pos1[1] + 170];
                return 'M ' + (pos1[0] + 12) + ',' + (pos1[1] + 12) + ' ' + pos2[0] + ' ' + pos2[1] + ' ' + (pos1[0] + 12) + ',' + (pos1[1] + 12)  + ' ' + (pos1[0] + 12) + ',' + (pos1[1] + 12) +
                  ';M ' + (pos1[0] + 12) + ' ' + (pos1[1] + 12) + ' ' + pos2[0] + ' ' + pos2[1] + ' ' + (pos1[0] + 12) + ',' + (pos1[1] + 12)  + ' ' +  pos2[0] + ' ' + pos2[1];
              }
              if(dst_arr.length === 3){
                hostId = dst_arr[0] + '/' +dst_arr[1];
                deviceId = src_arr[0];
                devicePort = src_arr[1];

                let pos1 = this.switchLocation[deviceId];
                let pos2 = this.hostLocation[hostId];
                return 'M ' + pos1[0] + ',' + pos1[1] + ' ' + (pos2[0] + 12) + ',' + (pos2[1]+ 12) + ' ' + pos1[0] + ',' + pos1[1] + ' ' + pos1[0] + ',' + pos1[1] +
                  ';M ' + pos1[0] + ',' + pos1[1]  + ' ' + (pos2[0] + 12) + ',' + (pos2[1]+ 12) + ' ' + pos1[0] + ',' + pos1[1] + ' ' +(pos2[0] + 12) + ',' + (pos2[1]+ 12);
              }
            }
          });

        //无动画的时候用如下代码//不可删除噢~~~~~~
        /*this.pathNode.attr('d', (path, i)=>{
          let src_arr = path['src'].split('/');
          let dst_arr = path['dst'].split('/');
          // let pos1 = this.switchLocation[deviceIds[0]];
          // let pos2 = this.switchLocation[deviceIds[1]];
          if(src_arr.length === 2 && dst_arr.length === 2){
            let deviceIds = [src_arr[0], dst_arr[0]];
            let pos1 = this.switchLocation[deviceIds[0]];
            let pos2 = this.switchLocation[deviceIds[1]];
            // let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] + 170:pos1[1] + 170];
            return 'M ' + pos1[0] + ' ' + pos1[1] + ' ' + pos2[0] + ' ' + pos2[1];
          } else {

            let hostId = null, deviceId = null, devicePort = null;
            if(src_arr.length === 3){
              hostId = src_arr[0] + '/' +src_arr[1];
              deviceId = dst_arr[0];
              devicePort = dst_arr[1];
              let pos1 = this.hostLocation[hostId];
              let pos2 = this.switchLocation[deviceId];
              // let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] + 170:pos1[1] + 170];
              return 'M ' + (pos1[0] + 12) + ' ' + (pos1[1] + 12) + ' ' + pos2[0] + ' ' + pos2[1];
            }
            if(dst_arr.length === 3){
              hostId = dst_arr[0] + '/' +dst_arr[1];
              deviceId = src_arr[0];
              devicePort = src_arr[1];

              let pos1 = this.switchLocation[deviceId];
              let pos2 = this.hostLocation[hostId];
              // let middleP = [(pos1[0] + pos2[0])/2, pos2[1] > pos1[1]?pos2[1] + 170:pos1[1] + 170];
              return 'M ' + pos1[0] + ' ' + pos1[1]  + ' ' + (pos2[0] + 12) + ' ' + (pos2[1]+ 12);
            }
            // this.pathNodes[hostId+'_'+deviceId] = genHostSwitchLink(hostId, deviceId,devicePort, path.state === LINK_ACTIVE_STATE)
          }
        });*/


      };


      function pathClickHandler(d) {
        DI.d3.event.stopPropagation();
        // console.log(d)
        let param = { 'start':{}, 'end':{}};
        // dst: "8C:EA:1B:8D:0F:B0/10/0"
        // isExpected: "false"
        // src: "rest:192.168.40.230:80/0"
        // state: "ACTIVE"
        // type: "EDGE"
        if(d.type === EDGE_TYPE){
          let src_arr = d['src'].split('/');
          let dst_arr = d['dst'].split('/');
          if(src_arr.length === 3){
            param.start['type'] = 'HOST';
            param.start['port'] = null;
            param.start['id'] = src_arr[0] + '/' +src_arr[1];

            param.end['type'] = 'SWITCH';
            param.end['port'] = dst_arr[1];
            param.end['id'] = dst_arr[0];

          }
          if(dst_arr.length === 3){

            param.start['type'] = 'SWITCH';
            param.start['port'] = src_arr[1];
            param.start['id'] = src_arr[0];

            param.end['type'] = 'HOST';
            param.end['port'] = null;
            param.end['id'] = dst_arr[0] + '/' +dst_arr[1];
          }
        } else {
          param.start['type'] = 'SWITCH';
          param.start['port'] = d.src.split('/')[1];
          param.start['id'] = d.src.split('/')[0];

          param.end['type'] = 'SWITCH';
          param.end['port'] = d.dst.split('/')[1];
          param.end['id'] = d.dst.split('/')[0];
        }
        DI.$rootScope.$emit("path_select", {event: calc_mouse_location(this), value: param});
      }

      let showPath = () =>{
        let hosts = [];
        this.di._.forEach(this.paths, (path)=>{
          if(path['type'] === EDGE_TYPE){
            let host = {};
            let src_arr = path['src'].split('/');
            let dst_arr = path['dst'].split('/');
            if(src_arr.length === 3){
              host['id'] =  src_arr[0] + '/' +src_arr[1];
              host['connect_swt'] = dst_arr[0];
              host['swt_x'] = this.switchLocation[dst_arr[0]]?this.switchLocation[dst_arr[0]][0]:0;
            }
            if(dst_arr.length === 3){
              host['id'] =  dst_arr[0] + '/' +dst_arr[1];
              host['connect_swt'] = src_arr[0];
              host['swt_x'] = this.switchLocation[src_arr[0]]?this.switchLocation[src_arr[0]][0]:0;
            }
            hosts.push(host);
          }
        });
        this.hosts = this.di._.sortBy(hosts, ['swt_x']);
        genAllHosts();
        relocateHost();

        genAllPathLinks();


      };

      let clearPath= ()=>{
        this.svg.select('#host_node').remove();
        this.svg.select('#path_link').remove();

        this.pathNode = null;
        this.hostsNode = null;
      };


      function hostClickHandler(evt){
        let hostId = this.hostId;
        DI.$rootScope.$emit("host_select",{event:evt, id: hostId});
      }

      function mouseUpHandler(evt){
        if(this.move){
          // console.log("move");
          let oldLocation = switchLocation[this.deviceId];
          let curLocation = this.getLocation();
          let node = this;
          let starttime = (new Date()).getTime();
          setTimeout(goBack_Animate(oldLocation, curLocation.x, curLocation.y,starttime, node))
        } else {
          // console.log("click");
          // console.log(this.deviceId);
          if(evt.button == 2){// 右键

            if(scope.topoSetting.show_tooltips){
              DI.$rootScope.$emit("hide_tooltip");
            }

            // unSelectNode();
            scope.selectedDeviceId  = null;
            if(scope.topoSetting.show_links !== 2){
              crushLinks();
            }

            DI.$rootScope.$emit("switch_opt",{event: evt, id: this.deviceId});
          }

        }
        this.move = false;
      }
      function goBack_Animate(oldLocation, nowX, nowY,starttime, node){
        let time = (new Date()).getTime() - starttime;
        if(time > 1000) {
          node.setLocation(oldLocation[0], oldLocation[1]);
          return;
        }
        let percentage = time/1000;
        let nP = easingService.easeInOutCubic(percentage);
        let curX = (oldLocation[0] - nowX) * nP + nowX;
        let curY = (oldLocation[1] - nowY) * nP+ nowY;
        node.setLocation(curX, curY);
        requestAnimFrame(function () {
          goBack_Animate(oldLocation, nowX, nowY, starttime, node);
        })
      }

      function mouseDragHandler(data){
        this.move = true;
      }

      function genHtml() {
        
      }

      function mouseOverHandler(evt) {
        let deviceId =  this.deviceId;
        let deviceType = this.deviceType;

        let showArray= [];

        if(deviceType == DeviceType.spine){
          let sw = DI._.find(scope.spines,{'id':deviceId});
          showArray = DI.switchService.getSpineShowInfo(sw);
        } else if(deviceType == DeviceType.leaf){
          let sw = DI._.find(scope.leafs,{'id':deviceId});
          showArray = DI.switchService.getLeafShowInfo(sw);
        } else if(deviceType == DeviceType.other){
          let sw = DI._.find(scope.others,{'id':deviceId});
          showArray = DI.switchService.getOtherShowInfo(sw);
        } else {
          return;
        }
        // console.log('node mouse over');
        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("show_tooltip",{event:evt, value: showArray});
        }
      }

      let mouseOutHandler = (evt) => {
        // console.log('node mouse out');
        if(scope.topoSetting.show_tooltips){
          this.di.$rootScope.$emit("hide_tooltip");
        }
      };

      let _completeDeviceName4FlowInfo = (detail) =>{
        let res = angular.copy(detail);
        let src = detail.src.device;
        let dst = detail.dst.device;

        let src_sw = DI._.find(scope.spines,{'id':src}) || DI._.find(scope.leafs,{'id':src})||DI._.find(scope.others,{'id':src});
        let dst_sw = DI._.find(scope.spines,{'id':dst}) || DI._.find(scope.leafs,{'id':dst})||DI._.find(scope.others,{'id':dst});
        res.src.device_name = src_sw.name;
        res.dst.device_name = dst_sw.name;
        return res;
      };

      let isDeviceLink = (src, dst) =>{
        let src_sw = DI._.find(scope.spines,{'id':src}) || DI._.find(scope.leafs,{'id':src})||DI._.find(scope.others,{'id':src});
        let dst_sw = DI._.find(scope.spines,{'id':dst}) || DI._.find(scope.leafs,{'id':dst})||DI._.find(scope.others,{'id':dst});
        if(dst_sw && src_sw){
          return true;
        } else {
          return false;
        }
      }

      function linkMouseOverHandler(evt) {
        if(scope.topoSetting.show_monitor){
          if(this._flow_detail){
            let res = _completeDeviceName4FlowInfo(this._flow_detail);
            DI.$rootScope.$emit("show_link_tooltip",{event:evt, value: res});
          }
        }
      }

      let  linkMouseOutHandler = (evt) => {
        // console.log('node mouse out');
        if(scope.topoSetting.show_monitor){
          this.di.$rootScope.$emit("hide_link_tooltip");
        }
      };

      function clickHandler(evt) {
        let deviceId =  this.deviceId;
        let deviceType = this.deviceType;
        let showArray= [];
        scope.selectedDeviceId  = deviceId;
        showDeviceLinks(deviceId);


        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("hide_tooltip");
        }


        if(deviceType == DeviceType.spine){
          let sw = DI._.find(scope.spines,{'id':deviceId});
          showArray = DI.switchService.getSpineShowInfo(sw);
        } else if(deviceType == DeviceType.leaf){
          let sw = DI._.find(scope.leafs,{'id':deviceId});
          showArray = DI.switchService.getLeafShowInfo(sw);
        } else if(deviceType == DeviceType.other){
          let sw = DI._.find(scope.others,{'id':deviceId});
          showArray = DI.switchService.getOtherShowInfo(sw);
        } else {
          return;
        }
        DI.$rootScope.$emit("switch_select",{event:evt, id: this.deviceId, type: deviceType, value: showArray});
      }

      let showDeviceLinks = (deviceId) =>{
        if(scope.topoSetting.show_links === 1){
          crushLinks();
          let _links = [];
          this.di._.forEach(scope.links, (link, key) => {
            if(deviceId == link.src.device){
              _links.push(link)
            }
          });
          scope._links = formatLinks(_links);
          this.linkNode = this.svg.append("g").attr('id', 'origin_link')
            .selectAll('g')
            .data(scope._links)
            .join("path")
            .classed('topo_line', true);

          relocatePath();
        }
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

      let calc_mouse_location = (self) =>{
        let x = self.getBoundingClientRect();
        let evt = {
          'clientX': this.switch_width/2 + x.left,
          'clientY': this.switch_height/2 + x.top
        };
        return evt
      };

      /*
      负责给container加上两个隐藏的node，用来固定整个容器
       */
      let layout = () =>{
        let avgHeight = this.height/3;

        // this.spineContainerLeftNode.setLocation(0,0);
        // this.spineContainerRightNode.setLocation(this.width,0);
        //
        // this.spineContainerLeftNode.height = avgHeight;
        // this.spineContainerRightNode.height = avgHeight;
        //
        // this.leafContainerLeftNode.setLocation(0, avgHeight);
        // this.leafContainerRightNode.setLocation(this.width, avgHeight);
        //
        // this.leafContainerLeftNode.height = avgHeight;
        // this.leafContainerRightNode.height = avgHeight;
        //
        // this.otherContainerLeftNode.setLocation(0, avgHeight*2);
        // this.otherContainerRightNode.setLocation(this.width, avgHeight*2);
        //
        // this.otherContainerLeftNode.height = avgHeight;
        // this.otherContainerRightNode.height = avgHeight;
      };

      let resize = (isInit) => {

        let parentNode = element[0].parentNode;
        this.width = parentNode.offsetWidth;
        this.height = parentNode.offsetHeight;

        // let canvas = document.getElementById('canvas');
        //
        // if(this.oldWidth === null ||  this.oldWidth === undefined){
        //   this.oldWidth = canvas.width;
        // }

        // canvas.width = this.width;
        // canvas.height = this.height;

        // let context = canvas.getContext('2d');
        // context.shadowColor = 'rgba(0, 0, 0, 0.2)';
        // context.shadowOffsetX = 2;
        // context.shadowOffsetY = 5;
        // context.shadowBlur = 5;
        layout();
        let starttime = (new Date()).getTime();
        if(this.resizeTimeout){
          // console.log(this.di.$timeout.cancel(this.resizeTimeout));
          this.di.$timeout.cancel(this.resizeTimeout);
        }
        if(isInit){
          delayDraw();
        } else{
          this.resizeTimeout = this.di.$timeout(function () {
            delayDraw()
          }, 200);
        }
      };

      let delayDraw =()=> {
        let oldWidth = this.oldWidth;
        this.oldWidth =  null;
        let starttime = (new Date()).getTime();
        dynamicDraw(starttime, oldWidth);
      };

      let dynamicDraw = (starttime, oldWidth) => {
        let testT = (new Date()).getTime();
        let time = (new Date()).getTime() - starttime;
        if(time > 1000) {
          draw(this.width);
          this.di.$rootScope.$emit('show_links');
          this.oldWidth = this.width;
          return;
        }
        let percentage = time/1000;
        let nP = easingService.easeInOutQuad(percentage);
        let width = (this.width - oldWidth) * nP + oldWidth;
        draw(width);
        requestAnimFrame(function () {
          dynamicDraw(starttime, oldWidth);
        });
      };

      initialize();

      let unSelectNode = () => {
        this.di.$rootScope.$emit("topo_unselect");
        scope.selectedDeviceId  = null;

        // this.di._.forEach(scope.links, (link, key) => {
        //   if(this.selectedDeviceId == link.src.device){
        //     let deviceIds = [link.src.device, link.dst.device];
        //     let linkId = getLinkId(deviceIds);
        //     if(!this.links[linkId]){
        //       return;
        //     }
        //     this.links[linkId].lineWidth = 1;
        //     this.links[linkId].strokeColor = this.LINE_NORMAL;
        //   }
        // });
        // this.selectedDeviceId  = null;
        if(scope.topoSetting.show_links !== 2){
          crushLinks();
        }
      };

      // let crushAllPorts = () =>{
      //   this.di._.forEach(scope.spines, (spine, key) => {
      //     crushPorts(this.spines[spine.id])
      //   });
      //
      //   this.di._.forEach(scope.leafs, (leaf, key) => {
      //     crushPorts(this.leafs[leaf.id])
      //   });
      //
      //   this.di._.forEach(scope.others, (other, key) => {
      //     crushPorts(this.others[other.id])
      //   });
      // };

      // let genAllPorts = () =>{
      //   this.di._.forEach(scope.spines, (spine, key) => {
      //     genPorts(this.spines[spine.id], spine.ports)
      //   });
      //
      //   this.di._.forEach(scope.leafs, (leaf, key) => {
      //     genPorts(this.leafs[leaf.id], leaf.ports)
      //   });
      //
      //   this.di._.forEach(scope.others, (other, key) => {
      //     genPorts(this.others[other.id], other.ports)
      //   });
      // };

      // let crushPorts = (node) =>{
      //   let height = this.switch_height;
      //   let width = this.switch_width;
      //
      //   let self = this;
      //   node.paint = function(g) {
      //     g.beginPath();
      //     g.rect(-width / 2, -height / 2, width, height);
      //     if(node.status === false){
      //       g.fillStyle ='rgb(255,0,0)';
      //     } else {
      //       g.fillStyle = self.getNodeColor();
      //     }
      //     g.fill();
      //     g.closePath();
      //     this.paintText(g);
      //   }
      // };


      // let genPorts = (node, ports) => {
      //   //根据实际的端口数来
      //   //超过48个端口len为2，根据实际情况来
      //   let len = 2.5;
      //   let height = this.switch_height;
      //   let width = this.switch_width;
      //   let status_normal = '#81FF1A';
      //   let status_error = 'rgb(255,0,0)';
      //   let top = 4;
      //
      //   let self = this;
      //   node.paint = function(g){
      //     g.beginPath();
      //     g.rect(-width/2, -height/2, width, height);
      //     if(node.status === false){
      //       g.fillStyle ='rgb(255,0,0)';
      //     } else {
      //       g.fillStyle = self.getNodeColor();
      //     }
      //     g.fill();
      //     g.closePath();
      //
      //     if(scope.topoSetting.show_ports && ports && ports instanceof Array && ports.length > 0) {
      //       if(ports.length > 60){
      //         len = 1.8;
      //       }
      //
      //       let padding = (width - len * 2) / 3;
      //       let left = -width / 2 + padding;
      //       let right = width / 2 - padding - len;
      //       // top = 8;
      //       for (let i = 0; i < ports.length; i++) {
      //         let port = ports[i];
      //         g.beginPath();
      //         if (i % 2 === 0) {
      //           g.rect(left, -height / 2 + top + parseInt(i / 2) * (len + 1), len, len);
      //         } else {
      //           g.rect(right, -height / 2 + top + parseInt(i / 2) * (len + 1), len, len);
      //         }
      //         g.fillStyle = status_normal;
      //         if (!port.isEnabled) {
      //           g.fillStyle = status_error;
      //         }
      //         g.fill();
      //         g.closePath();
      //       }
      //     }
      //     this.paintText(g);
      //     // g.save();
      //     // g.restore();
      //   }
      // };


      // this.di.$timeout(()=>{
      //   console.log('===> TOPO start to bind resize');
      //   angular.element(this.di.$window).bind('resize', () => {
      //     console.log('exec resize in topo');
      //     resize(false);
      //     // if(this.resizeTimeout){
      //     //   this.di.$timeout.cancel(this.resizeTimeout);
      //     // }
      //     // self.resizeTimeout = this.di.$timeout(resize, 500);
      //   });
      // })


      unsubscribers.push(this.di.$rootScope.$on('resize_summary', () => {
        resize(false);
      }));


      unsubscribers.push(this.di.$rootScope.$on('resize_canvas',() =>{
        console.log('receive resize_canvas');
        resize(false)
      }));

      // unsubscribers.push(this.di.$rootScope.$on('show_tooltips',()=>{
      //   if(scope.topoSetting.show_tooltips){
      //   } else {
      //   }
      // }));

      unsubscribers.push(this.di.$rootScope.$on('show_links',()=>{
        if(scope.topoSetting.show_links === 2){
          genLinks()
        } else if(scope.topoSetting.show_links === 0) {
          crushLinks();
        } else {
          crushLinks();
          if(scope.selectedDeviceId){
            showDeviceLinks(scope.selectedDeviceId);
          }
        }

      }));

      unsubscribers.push(this.di.$rootScope.$on('show_path',($event, params)=>{
        clearPath();
        this.paths = params;
        showPath();

      }));

      unsubscribers.push(this.di.$rootScope.$on('changeLinksColor',($event, params)=>{
        let self = this;
        let links_color = params;
        this.linkNode.classed('topo_line', false);
        this.linkNode
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('stroke', d => {
            let _link = d;
            let linkId = getLinkId([_link.src.device, _link.dst.device], [_link.src.port, _link.dst.port]);
            // console.log(linkId)

            return 'rgb(' + links_color[linkId].color + ')';
          })
          .on('mouseover', function (d) {
            let line = self.di.d3.select(this);
            // console.log(line.attr('stroke-width'));
            if (line.attr('stroke-width') !== '4'){
              line.transition()
                .duration(200)
                .attr('stroke-width', '3');
            }
            let linkId = getLinkId([d.src.device, d.dst.device], [d.src.port, d.dst.port]);
            if (scope.topoSetting.show_monitor) {
              let res = _completeDeviceName4FlowInfo(links_color[linkId]);
              DI.$rootScope.$emit("show_link_tooltip", {event: calc_linkmouse_location(this), value: res});
            }
          })
          .on('mouseout', function () {
            let line = self.di.d3.select(this);
            if (line.attr('stroke-width') !== '4'){
              line.transition()
                .duration(200)
                .attr('stroke-width', '2');
            }


            DI.$rootScope.$emit("hide_link_tooltip");
          });
      }));

      unsubscribers.push(this.di.$rootScope.$on('clearLinksColor',($event)=>{
        this.linkNode
          .attr('stroke-width', null)
          .attr('stroke', null)
          .attr('fill', null)
          .classed('topo_line', true);
      }));



      unsubscribers.push(this.di.$rootScope.$on('hide_path',()=>{
        clearPath();
        this.paths = null;
      }));

      unsubscribers.push(this.di.$rootScope.$on('show_ports',()=>{
        if(scope.topoSetting.show_ports){
          // genAllPorts()
          addAllPorts()
        } else {
          crushAllPorts()
        }
      }));

      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });
        // console.log('===<< topo start to un bind resize');
        // angular.element(this.di.$window).off('resize');
        // element = null;
      });

    }).call(this);

  }



  getColor(){
    let theme = window.localStorage['userPrefs__theme'];
    if(theme && theme === 'theme_dark'){
      return {
        "CONTAINER_FILL": "40,40,40",
      };
    } else {
      return {
        "CONTAINER_FILL": "255,255,255",
      }
    }

  }


  getNodeColor(){
    let theme = window.localStorage['userPrefs__theme'];
    if(theme && theme === 'theme_dark'){
      return 'rgb(100,100,100)';
    } else {
      return 'rgb(0,0,0)';
    }
  }
}


Topo.$inject = Topo.getDI();
Topo.$$ngIsClass = true;