export class ForceTopo {
  static getDI() {
    return [
      '$rootScope',
      '$window',
      '$timeout',
      'localStoreService',
      '$document',
      '_',
      'd3',
      'd3-force',
      'easingService',
      'switchService'
    ];
  }

  constructor(...args) {
    this.di = [];
    ForceTopo.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/forceTopo');

    this.scope = {
      links: '=',
      devices: '=',
      topoSetting: '='
    };

    this.link = (...args) => this._link.apply(this, args);
  }


  _link(scope, element) {
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
      // scope.selectedDeviceId = null;

      // TEST Code START  ======= 此处代码是用来测试distance算法是否合理
      /*let devices = [{"available":true,"community":null,"id":"rest:192.168.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.168.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:192.168.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"192.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"192.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.168.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.168.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.168.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:292.168.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"292.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"292.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.168.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.169.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"192.169.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:192.169.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:192.169.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"192.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"192.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"192.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:192.169.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"192.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.169.40.225:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:08:C0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.225","name":"spine0","port":80,"protocol":"rest","rack_id":"1","type":"spine"},{"available":true,"community":null,"id":"rest:292.169.40.228:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:FA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.228","name":"leaf1","port":80,"protocol":"rest","rack_id":"","type":"leaf"},{"available":true,"community":null,"id":"grpc:292.169.40.224:5001","leafGroup":{"name":null,"switch_port":0},"mac":"CC:37:AB:E0:AC:88","mfr":"Nocsys","mgmtIpAddress":"292.168.40.224","name":"leaf4","port":5001,"protocol":"grpc","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.227:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:09:E8","mfr":"Nocsys","mgmtIpAddress":"292.168.40.227","name":"leaf0","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.230:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0F:B0","mfr":"Nocsys","mgmtIpAddress":"292.168.40.230","name":"leaf3","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.229:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:11:39:50","mfr":"Nocsys","mgmtIpAddress":"192.168.40.229","name":"leaf2","port":80,"protocol":"rest","rack_id":"1","type":"leaf"},{"available":true,"community":null,"id":"rest:292.169.40.226:80","leafGroup":{"name":null,"switch_port":0},"mac":"8C:EA:1B:8D:0D:AA","mfr":"Nocsys","mgmtIpAddress":"292.168.40.226","name":"spine1","port":80,"protocol":"rest","rack_id":"1","type":"spine"}];
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
      });*/
      // TEST Code END ======


      this.source_devices = scope.devices;
      this.formated_devices = scope.devices;


      this.source_links = scope.links;
      this.formated_links = [];
      this.linkIds = [];


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

      //this method only can used by device link to device !important
      let formatLinks = (links) => {
        this.formated_links = [];
        this.di._.forEach(links, (link) => {
          // let newDeviceIds = this.di._.sortBy([link.src.device, link.dst.device]);
          // let linkId = newDeviceIds.join('-');

          let linkId = getLinkId([link.src.device, link.dst.device], [link.src.port, link.dst.port]);
          if (this.di._.findIndex(this.linkIds, linkId) === -1 && isDeviceLink(link.src.device, link.dst.device)) {
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

      let formatDevice = (devices) => {

      }

      let getDeviceName = (deviceId) => {
        let device = this.di._.find(scope.devices, {"id": deviceId});
        if (device) return device['name'];
        else return '';
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
        formatLinks(this.source_links);
        formatDevice(this.source_devices);
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
          if (scope.topoSetting.show_tooltips) {
            DI.$rootScope.$emit("hide_tooltip");
          }

          if (!DI.d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }


        function dragged(d) {
          if (d3.event.x >= 36 && d3.event.x <= self.width - 36) {
            d.fx = d3.event.x;
          }
          if (d3.event.y >= 36 && d3.event.y <= self.height - 36) {
            d.fy = d3.event.y;
          }
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

        let deviceId = node.getAttribute('deviceId');
        let deviceLinks = scope.deviceLinkDict[deviceId];
        if(deviceLinks && Array.isArray(deviceLinks)){
          // console.log(deviceLinks);
          let self = this;
          deviceLinks.forEach((linkid)=>{
            // console.log('linkid==>' + linkid)
            self.linkNode.select(function(d, i) {
              return d.id === linkid?this:null;
            }).attr('stroke-width', 4)
          })

        }
      };

      let removeSelectEffect = () => {
        // this.deviceNode.select('rect').attr('fill', 'gray');
        this.deviceNode
          .select('rect')
          .classed('node-select', false)
          .classed('node-unselect', true);

        this.linkNode.attr('stroke-width', 2);

        if(this.hostNode){
          this.hostNode
            .select('rect')
            .classed('host-select', false)
            .classed('host-unselect', true)
        }
      };

      let _calcPoint_X = (point) => {
        if (point < BOUNDARY_SIZE) {
          return BOUNDARY_SIZE
        }
        if (point > this.width - BOUNDARY_SIZE) {
          return this.width - BOUNDARY_SIZE
        }
        return point;
      }

      let _calcPoint_Y = (point) => {
        if (point < BOUNDARY_SIZE) {
          return BOUNDARY_SIZE
        }
        if (point > this.height - BOUNDARY_SIZE) {
          return this.height - BOUNDARY_SIZE
        }
        return point;
      };


      function clickHandler() {
        DI.d3.event.stopPropagation();
        removeSelectEffect();


        if (scope.topoSetting.show_tooltips) {
          DI.$rootScope.$emit("hide_tooltip");
        }
        let deviceId = this.getAttribute('deviceId');
        let sw = DI._.find(scope.devices, {'id': deviceId});
        let showArray = DI.switchService.getNormalShowInfo(sw);
        DI.$rootScope.$emit("switch_select", {event: null, id: deviceId, type: null, value: showArray});

        scope.curSelectedDeviceId = deviceId;
        addSelectEffect(this)
      };




      let mouseOutHandler = (evt) => {
        if (scope.topoSetting.show_tooltips) {
          this.di.$rootScope.$emit("hide_tooltip");
        }
      };



      function mouseOverHandler(d, i) {
        if (isDrag) {
          return;
        }
        let deviceId = this.getAttribute('deviceId');
        let sw = DI._.find(scope.devices, {'id': deviceId});
        let showArray = DI.switchService.getNormalShowInfo(sw);

        if (scope.topoSetting.show_tooltips) {
          let evt = {
            'clientX': this.getBoundingClientRect().left + NODE_SIZE / 2,
            'clientY': this.getBoundingClientRect().top + NODE_SIZE / 2
          };
          DI.$rootScope.$emit("show_tooltip", {event: evt, value: showArray});
        }
      }

      let add_origin_link = () =>{
        let self = this;
        this.linkNode = svg.append("g").attr('id', 'origin_link')
          .classed('force-topo__line-normal', true)
          .selectAll("line")
          .data(scope._links)
          .join("line").attr('linkid', d => d.id)
          // .on('mouseover', function () {
          //   let line = self.di.d3.select(this);
          //   line.transition()
          //     .duration(200)
          //     .attr('stroke-width', '3')
          // })
          // .on('mouseout', function () {
          //   let line = self.di.d3.select(this);
          //   line.transition()
          //     .duration(200)
          //     .attr('stroke-width', '2')
          // });
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
          .join('g').attr("width", ICON_SIZE).attr("height", ICON_SIZE).attr('deviceId', d => d.id).style('cursor','pointer')
          .html(d => {
            let device_status_class = 'force-topo__path-normal';
            if (!d.available) {
              device_status_class = 'force-topo__path-error';
            }
            return '<rect x="-6" y="-6" rx="3" ry="3" width="36" height="36" class="force-topo__node-outline" /><path class="' + device_status_class + '" style="pointer-events: none" d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>'
          })
          .call(drag(this.simulation))
          .on('click', clickHandler)
          .on('mouseover', function () {
            let rect = self.di.d3.select(this).select('rect');
            rect.transition()
              .duration(200)
              .attr('x', '-8')
              .attr('y', '-8')
              .attr('width', '40')
              .attr('height', '40')
          })
          .on('mouseout', function () {
            let rect = self.di.d3.select(this).select('rect');
            rect.transition()
              .duration(200)
              .attr('x', '-6')
              .attr('y', '-6')
              .attr('width', '36')
              .attr('height', '36')
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


      let simulation_all_tick_callback = () =>{
        this.simulation.on("tick", () => {
          this.linkNode
            .attr("x1", d => _calcPoint_X(d.source.x))
            .attr("y1", d => _calcPoint_Y(d.source.y))
            .attr("x2", d => _calcPoint_X(d.target.x))
            .attr("y2", d => _calcPoint_Y(d.target.y));


          this.pathLinks
            .attr("x1", d => _calcPoint_X(d.source.x))
            .attr("y1", d => _calcPoint_Y(d.source.y))
            .attr("x2", d => _calcPoint_X(d.target.x))
            .attr("y2", d => _calcPoint_Y(d.target.y));

          this.hostNode.attr('transform', d => {
            let x, y;
            x = _calcPoint_X(d.x);
            y = _calcPoint_Y(d.y);
            return 'translate(' + (x - ICON_SIZE / 2) + ',' + (y - ICON_SIZE / 2) + ')'
          });

          this.deviceNode.attr('transform', d => {
            let x, y;

            x = _calcPoint_X(d.x);
            y = _calcPoint_Y(d.y);

            return 'translate(' + (x - ICON_SIZE / 2) + ',' + (y - ICON_SIZE / 2) + ')'
          });
        });
      };

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
            return scope.distance
          }))
          .force("charge", DI.d3.forceManyBody().strength(scope.strength))
          .force("collide", DI.d3.forceCollide(40).strength(0.2).iterations(5));


        reCenter();

        svg = this.di.d3.select('.forceTopo > svg')
          .on('click', function () {
            DI.$rootScope.$emit('topo_unselect');
            scope.curSelectedDeviceId = null;
            removeSelectEffect();
          })
          .on('contextmenu',function () {
            d3.event.preventDefault();
            // DI.$rootScope.$emit('topo_unselect');
          });;


        this.defs = svg.append('defs');
        // 3.1 添加箭头

        this.marker = this.defs
          .append("marker")
          .attr('id', "marker")
          .attr("markerWidth", 20)    //marker视窗的宽
          .attr("markerHeight", 20)   //marker视窗的高
          .attr("refX", scope.distance/3)            //refX和refY，指的是图形元素和marker连接的位置坐标
          .attr("refY", 8)
          .attr("orient", "auto")     //orient="auto"设置箭头的方向为自动适应线条的方向
          .attr("markerUnits", "userSpaceOnUse")  //marker是否进行缩放 ,默认值是strokeWidth,会缩放
          .append("path")
          .attr("d", "M 0 0 16 8 0 16Z")    //箭头的路径 从 （0,0） 到 （8,4） 到（0,8）
          .attr("fill", "rgb(255,124,9)");


        this.start_marker = this.defs
          .append("marker")
          .attr('id', "start_marker")
          .attr("markerWidth", 20)    //marker视窗的宽
          .attr("markerHeight", 20)   //marker视窗的高
          .attr("refX", -scope.distance/3)            //refX和refY，指的是图形元素和marker连接的位置坐标
          .attr("refY", 8)
          .attr("orient", "auto")     //orient="auto"设置箭头的方向为自动适应线条的方向
          .attr("markerUnits", "userSpaceOnUse")  //marker是否进行缩放 ,默认值是strokeWidth,会缩放
          .append("path")
          .attr("d", "M 0 0 16 8 0 16Z")    //箭头的路径 从 （0,0） 到 （8,4） 到（0,8）
          .attr("fill", "rgb(255,124,9)");
        // .on('resize',reCenter);

        add_origin_link();
        add_origin_nodes();

        simulation_origin_tick_callback();
      };

      // let getLinkId = (deviceIds, ports) => {
      //   let newDeviceIds = this.di._.sortBy(deviceIds);
      //   if (newDeviceIds[0] !== deviceIds[0]) {
      //     let tmp = ports[0];
      //     ports[0] = ports[1];
      //     ports[1] = tmp;
      //   }
      //   return newDeviceIds[0] + ':' + ports[0] + '_' + newDeviceIds[1] + ':' + ports[1];
      // };


      let _checkPeerLinksState = (memberDict) => {
        let keys = this.di._.keys(memberDict);
        let isOk = true;
        this.di._.forEach(keys, (key) => {
          // let device = this.leafs[key] || this.spines[key] || this.others[key];
          let device = this.di._.find(scope.leafs, {'id': key});
          if (device) {
            // TODO 目前用的是交换机 leafgroup中的port， 后面如果switch port 不起作用，那么要用memberDict中的port
            isOk = _checkPortState(device, device.leafGroup.switch_port);
            if (isOk === false) {
              return false;
            }
          } else {
            console.log('[topo.js > _checkPeerLinksState()] Device ' + key + ' cannot find');
          }

        });
        return isOk;
      };

      let genPeerLinks = () => {
        this.di._.forEach(scope.logicalPorts, (logicalPort) => {
          if (logicalPort.is_mlag) {
            let memberDict = this.di._.groupBy(logicalPort.members, 'device_id');
            let isPeerLinkOk = _checkPeerLinksState(memberDict);

            let keys = this.di._.keys(memberDict);
            let newKeys = this.di._.sortBy(keys);
            let linkId = newKeys[0] + '__' + newKeys[1];
            // console.log('genPeerLinks  ====== >' + linkId);
            this.links[linkId] = genPeerLink(newKeys, linkId, isPeerLinkOk)
          }
        })
      };

      // this.di.$timeout(()=> {
      //   console.log('===> FORCETOPO start to bind resize');
      //   angular.element(this.di.$window).bind('resize', () => {
      //     console.log('exec resize in force topo');
      //     reCenter();
      //     this.simulation.restart();
      //   });
      // });

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

      // unsubscribers.push(this.di.$rootScope.$on('show_links', () => {
      //   if (scope.topoSetting.show_links === 2) {
      //     genLinks()
      //   } else if (scope.topoSetting.show_links === 0) {
      //     crushLinks();
      //   } else {
      //     crushLinks();
      //     if (scope.selectedDeviceId) {
      //       showDeviceLinks(scope.selectedDeviceId);
      //     }
      //   }
      //
      // }));

      let showPath = (paths) => {
        svg.select('#path_link').remove();

        let switchLinks = [];
        this.di._.forEach(paths, path=>{
          if(path.type !== 'EDGE'){
            switchLinks.push({
              source: path.src.split('/')[0],
              target: path.dst.split('/')[0],
              id: path.src.split('/')[0] + '-' + path.dst.split('/')[0],
              host:null,
              source_port: path.src.split('/')[1],
              target_port:  path.dst.split('/')[1]})
          }
          if(path.type === 'EDGE'){
            let host = {};
            let src_arr = path['src'].split('/');
            let dst_arr = path['dst'].split('/');
            if(src_arr.length === 3){
              let host_id = src_arr[0] + '/' + src_arr[1];
              switchLinks.push({source: host_id, target: path.dst.split('/')[0], id: host_id + '-' + path.dst.split('/')[0], host: 'source', source_port: null, target_port:  path.dst.split('/')[1]})
            }
            if(dst_arr.length === 3){
              let host_id = dst_arr[0] + '/' + dst_arr[1];
              switchLinks.push({source: path.src.split('/')[0], target: host_id, id: path.src.split('/')[0] + '-' + host_id, host: 'target', source_port: path.src.split('/')[1], target_port:  null})
            }
          }
        })
        let _p_links = switchLinks.map(d => Object.create(d));

        return _p_links

      };


      let genPathHost = (paths) => {
        svg.select('#path_host').remove();
        let hosts = [];
        this.di._.forEach(paths, path=>{
          if(path['type'] === 'EDGE'){
            let host = {};
            let src_arr = path['src'].split('/');
            let dst_arr = path['dst'].split('/');
            if(src_arr.length === 3){
              // host['id'] =  src_arr[0] + '/' +src_arr[1];
              host['id'] =  src_arr[0] + '/' + src_arr[1];
            }
            if(dst_arr.length === 3){
              // host['id'] =  dst_arr[0] + '/' +dst_arr[1];
              host['id'] =  dst_arr[0] + '/' + dst_arr[1];
            }
            hosts.push(host);
          }
        });
        const hostObjs = hosts.map(d => Object.create(d));

        return hostObjs;


      }


      let clearPathAll = () =>{
        if(this.pathLinks == null && this.hostNode == null){
          return;
        }
        this.simulation.stop();


        this.simulation = DI.d3.forceSimulation(scope._nodes)
          .force("link", DI.d3.forceLink(scope._links).id(d => d.id).distance(d => {
            return scope.distance;
          }))
          .force("charge", DI.d3.forceManyBody().strength(scope.strength))
          .force("collide", DI.d3.forceCollide(40).strength(0.2).iterations(5));
        reCenter();

        remove_origin_link();
        remove_origin_node();


        add_origin_link();
        add_origin_nodes();
        simulation_origin_tick_callback();

        svg.select('#path_link').remove();
        svg.select('#path_host').remove();
        this.pathLinks = null;
        this.hostNode = null;


        showName();
        // this.simulation.stop();
        // this.simulation.tick();
        // this.simulation.restart();

      };

      unsubscribers.push(this.di.$rootScope.$on('show_path', ($event, params) => {
        // clearPath();
        let paths = params;
        let hostObjs = genPathHost(paths);
        let pLinks = showPath(paths);

        svg.select('#origin_node').remove();
        svg.select('#origin_link').remove();
        remove_origin_link();
        remove_origin_node();

        let _path_all_nodes = scope._nodes.concat(hostObjs);
        let _path_all_links = scope._links.concat(pLinks);

        this.simulation.stop();
        this.simulation = DI.d3.forceSimulation(_path_all_nodes)
          .force("link", DI.d3.forceLink(_path_all_links).id(d => d.id).distance(d => {
            return scope.distance;
          }))
          .force("charge", DI.d3.forceManyBody().strength(scope.strength))
          .force("collide", DI.d3.forceCollide(40).strength(0.2).iterations(5));
        reCenter();

        simulation_all_tick_callback();

        add_origin_link();
        add_origin_nodes();


        this.pathLinks = svg.append("g").attr('id','path_link')
          .style('marker-end','url(#marker)')
          .style('marker-start','url(#start_marker)')
          .style('stroke-width','5')
          .style('stroke','rgb(255,124,9)')
          .style('cursor','pointer')
          .selectAll("line")
          .data(pLinks)
          .join("line")
          .on('click', pathClickHandler);

        this.hostNode = svg.append("g").attr('id','path_host')
          .selectAll("g")
          .data(hostObjs)
          .join('g').attr("width", ICON_SIZE).attr("height", ICON_SIZE).attr('host_mac', d => d.id).style('cursor','pointer')
          .html(d => {
            return '<rect x="-6" y="-6" rx="3" ry="3" width="36" height="36" class="force-topo__node-outline" /><path class="force-topo__host" style="pointer-events: none" xmlns="http://www.w3.org/2000/svg" d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>'
          })
          .call(drag(this.simulation))
          .on('click', function clickHandler(d, i) {
            DI.d3.event.stopPropagation();

            removeSelectEffect();
            DI.$rootScope.$emit('topo_unselect');

            let mac = this.getAttribute('host_mac');

            DI.$rootScope.$emit("host_select",{event:calc_mouse_location(this), id: mac});
            // DI.$rootScope.$emit("switch_select", {event: null, id: deviceId, type: null, value: showArray});

            scope.curSelectedDeviceId = null;
            addHostSelectEffect(this)
          });

        showName();
      }));


      let showName = () => {
        if(scope.topoSetting.show_tooltips){
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
        } else {
          this.deviceNode
            .select('text').remove();

          if(this.hostNode){
            this.hostNode
              .select('text').remove();
          }
        }
      };

      let _completeDeviceName4FlowInfo = (detail) => {
        let res = angular.copy(detail);
        let src = detail.src.device;
        let dst = detail.dst.device;

        let src_sw = DI._.find(scope.devices, {'id': src});
        let dst_sw = DI._.find(scope.devices, {'id': dst});
        res.src.device_name = src_sw.name;
        res.dst.device_name = dst_sw.name;
        return res;
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

      unsubscribers.push(this.di.$rootScope.$on('changeLinksColor', ($event, params) => {
        let self = this;
        let links_color = params;
        this.linkNode.classed('force-topo__line-normal', false);
        this.linkNode
          .attr('stroke-width', 2)
          .attr('stroke', d => {
            let _link = d.link;
            let linkId = getLinkId([_link.src.device, _link.dst.device], [_link.src.port, _link.dst.port]);
            return 'rgb(' + links_color[linkId].color + ')';
          })
          .on('mouseover', function () {
            let line = self.di.d3.select(this);
            // console.log(line.attr('stroke-width'));
            if (line.attr('stroke-width') !== '4'){
              line.transition()
                .duration(200)
                .attr('stroke-width', '3');
            }
            let linkid = this.getAttribute('linkid');
            if (scope.topoSetting.show_monitor) {
              let res = _completeDeviceName4FlowInfo(links_color[linkid]);
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


      unsubscribers.push(this.di.$rootScope.$on('clearLinksColor', ($event) => {
        this.linkNode.classed('force-topo__line-normal', true).attr('stroke-width', null).attr('stroke', null);
      }));

      unsubscribers.push(scope.$watch('topoSetting.show_tooltips', (newValue, oldValue) => {
        if (newValue === true) {
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

          // .attr('stroke','black')
          // .attr('stroke-width','1')
        } else {
          this.deviceNode
            .select('text').remove();

          if(this.hostNode){
            this.hostNode
              .select('text').remove();
          }
        }
      }));


      unsubscribers.push(this.di.$rootScope.$on('hide_path', () => {
        clearPathAll();
      }));


      scope.$on('$destroy', () => {

        console.log('===<< forcetopo start to $destroy');
        // angular.element(this.di.$window).off('resize');
        // element = null;


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

  getColor() {
    let theme = window.localStorage['userPrefs__theme'];
    if (theme && theme === 'theme_dark') {
      return {
        "CONTAINER_FILL": "40,40,40",
      };
    } else {
      return {
        "CONTAINER_FILL": "255,255,255",
      }
    }

  }

  getNodeColor() {
    let theme = window.localStorage['userPrefs__theme'];
    if (theme && theme === 'theme_dark') {
      return 'rgb(100,100,100)';
    } else {
      return 'rgb(0,0,0)';
    }
  }
}


ForceTopo.$inject = ForceTopo.getDI();
ForceTopo.$$ngIsClass = true;