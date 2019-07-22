/**
 * Created by wls on 2018/7/17.
 */
import {MDCMenu} from '@material/menu';
import {Corner} from '@material/menu';

export class FabricSummaryController {
  static getDI() {
    return [
      '$filter',
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$q',
      '$document',
      '$window',
      '$timeout',
      'localStoreService',
      'appService',
      'deviceDataManager',
      'manageDataManager',
      'tableProviderFactory',
      'deviceService',
      'switchService',
      'notificationService',
      'dialogService',
      'commonService',
      'applicationService',
      'roleService',
      'flowCacheService',
      'modalManager'
    ];
  }

  constructor(...args) {
    this.di = {};

    FabricSummaryController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

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

    this.translate = this.di.$filter('translate');

    let fabric_storage_ns = "storage_farbic_";
    let unsubscribers = [];


    this.resizeTimeout = null;
    this.di.$scope.resize_right_plus = {};
    this.di.$scope.resize_right = {};
    this.di.$scope.resize_length = {};


    this.di.$scope.defaultRightLength = 300;
    this.di.$scope.showLeftDiv = false;

    let scope = this.di.$scope;
    scope.role = this.di.roleService.getRole();

    scope.licenseModel = {
      isOpenflowEnable: false,
      isQosEnable: false,
      isSwtManageEnable: false,
      isLogicalPortEnable: false,
      isCalcPathEnable: false
    };

    // scope.isOpenflowEnable= false;
    // scope.isQosEnable= false;
    // scope.isSwtManageEnable= false;
    // scope.isLogicalPortEnable = false;
    // scope.isCalcPathEnable = false;


    let initializeTransitionFlag = false;
    scope.monitorInterval = null;
    let monitorStateInterval = null;
    let flowCalcData = {};
    let linkFlowDict = {};

    let distributeSwitches = (allSwitches) => {
      let distributeSwt = {'spine':[], 'leaf':[], 'other':[]};
      this.di._.forEach(allSwitches, (swt, index)=>{
        // this.di._.forEach()
        if(swt.type == 'leaf'){
          distributeSwt.leaf.push(swt);
        } else if(swt.type == 'spine'){
          distributeSwt.spine.push(swt);
        } else{
          distributeSwt.other.push(swt);
        }
      });
      return distributeSwt;
    };


    let checkRealtimeUnknown = (configSwitches, realtimeSwitches) => {
      let unknowns = [];
      this.di._.forEach(realtimeSwitches, (realtimeSwt)=>{
        let hasSame = false;
        this.di._.forEach(configSwitches, (configSwt)=>{
          if(realtimeSwt.id === configSwt.id){
            hasSame = true;
            return false;
          }
        });
        if(!hasSame){
          unknowns.push(angular.copy(realtimeSwt))
        }
      });
      let curTime = new Date().getTime();
      unknowns.map((swt)=>{
        swt.lastUpdate = this.di.commonService.calcRunningDate(curTime - swt.lastUpdate) ;
        swt.type = 'unknown';
        swt.mgmtIpAddress = swt.annotations.managementAddress;
      });


      return unknowns;
    };

    this.di.$scope.displayLabel = {
      hosts: {'options':[{'label': this.translate('MODULES.SWITCHES.TOPO.DISPLAY.SELECT_ENDPOINT'), 'value':null}]},
      srcHosts: {'options':[{'label':  this.translate('MODULES.SWITCHES.TOPO.DISPLAY.SELECT_ENDPOINT'), 'value':null}], 'hint':this.translate('MODULES.TOPO.PATH.START')},
      dstHosts: {'options':[{'label':  this.translate('MODULES.SWITCHES.TOPO.DISPLAY.SELECT_ENDPOINT'), 'value':null}], 'hint':this.translate('MODULES.TOPO.PATH.END')},
      fluxUnits: {
        'options': [
          {'label': 'Bps', 'value': 'Bps'},
          {'label': 'KBps', 'value': 'KBps'},
          {'label': 'MBps','value': 'MBps'},
          {'label': 'GBps', 'value': 'GBps'}],
        'hint':  this.translate('MODULES.SWITCHES.TOPO.DISPLAY.UNIT'),
      },
      topoTypes: {
        'options': [
          {'label': this.translate('MODULES.SWITCHES.TOPO.TYPE.FORCE'), 'value': 'force'},
          {'label': 'Spine Leaf', 'value': 'spine_leaf'},
          {'label': 'Donut', 'value': 'donut'}
        ],
        'hint': this.translate('MODULES.SWITCHES.TOPO.TYPE'),
      }
    };

    this.di.$scope.fabricModel = {
      showSwitchDetail: false,
      showHostDetail: false,
      isShowTopo: false,
      portsSchema: this.di.deviceService.getSummaryPortsTableSchema(),
      endpointsSchema: this.di.deviceService.getSummaryEndpointsTableSchema(),
      linksSchema: this.di.deviceService.getSummaryLinkTableSchema(),
      switchContextMenu: {
        location:{'x':0, 'y':1},
        isShow : false,
        data:this.di.deviceService.getSummarySwitchMenu(),
        back_data: null
      },
      srcHost:null,
      dstHost: null,
      srcHost_select: true,
      dstHost_select: true,
      busyMetric: 500,
      congestionMetric: 2000,
      latency: '',
      monitorState: this.translate('MODULES.TOPO.MONITOR.STATE_STOP'),
      busyMetricUnit: scope.displayLabel.fluxUnits.options[2],
      congestionMetricUnit: scope.displayLabel.fluxUnits.options[2]
    };



    let portsDefer = this.di.$q.defer(),
      devicesDefer = this.di.$q.defer(),
      endpointsDefer = this.di.$q.defer(),
      deviceConfigsDefer = this.di.$q.defer(),
      logicalPortDefer = this.di.$q.defer(),
      appDefer = this.di.$q.defer();
    let promises = [];
    let portGroups = {};
    this.devices = [];
    this.realtimeDevices = [];

    let initializeTransition = () =>{
      let line_space = angular.element(document.getElementsByClassName('line_space'));
      let right_div = angular.element(document.getElementsByClassName('right_div'));
      line_space.css('transition','right .4s ease-in-out');
      right_div.css('transition','right .4s ease-in-out');
      initializeTransitionFlag = true;
    };


    let unInitializeTransition = () => {
      let line_space = angular.element(document.getElementsByClassName('line_space'));
      let right_div = angular.element(document.getElementsByClassName('right_div'));
      line_space.css('transition','');
      right_div.css('transition','');
      initializeTransitionFlag = false;
    };

    let _show_div = (isFirst) =>{
      scope.showLeftDiv =  true;
      if(!initializeTransitionFlag && !isFirst){
        initializeTransition();
      }
      let data = this.di.localStoreService.getSyncStorage(fabric_storage_ns).get('resize_db');
      let win_width = this.di.$window.innerWidth;
      if(data){

        this.di.$scope.resize_right = data['resize_right'];
        this.di.$scope.resize_length = data['resize_length'];

        let rightLenStr = data['resize_length']['width'];
        let rightLen = Number(rightLenStr.substr(0, rightLenStr.length - 2 ));
        this.di.$scope.resize_right_plus = {'right': (rightLen + 5) +'px','width': ( win_width - rightLen - 5)+ 'px'};
      } else {

        this.di.$scope.resize_right_plus = {'right': this.di.$scope.defaultRightLength + 'px','width': (win_width - this.di.$scope.defaultRightLength)+ 'px'};
        this.di.$scope.resize_right = {'right':+ (this.di.$scope.defaultRightLength - 5) +'px'};
        this.di.$scope.resize_length = {'width':+ (this.di.$scope.defaultRightLength - 5) +'px', 'right':'0px'};

        let data = {
          'resize_right':angular.copy(this.di.$scope.resize_right),
          'resize_length':angular.copy(this.di.$scope.resize_length),
        };
        this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("resize_db", data);
      }
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("hide_right_div", false);
    };

    let _hide_div = (isFirst) =>{
      scope.showLeftDiv = false;
      if(!initializeTransitionFlag && !isFirst){
        initializeTransition();
      }

      let win_width = this.di.$window.innerWidth;
      this.di.$scope.resize_right_plus = {'right': '0px','width': win_width + 'px'};
      this.di.$scope.resize_right = {'right': '-5px'};


      let data = this.di.localStoreService.getSyncStorage(fabric_storage_ns).get('resize_db');
      if(data){
        let rightLenStr = data['resize_length']['width'];
        let rightLen = Number(rightLenStr.substr(0, rightLenStr.length - 2 ));
        this.di.$scope.resize_length = {'width':data['resize_length']['width'], 'right': '-' + data['resize_length']['width']};
      }
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("hide_right_div", true);
    };

    let init = () => {
      this.di.$scope.fabricModel.isShowTopo = false;

      let hide_div = this.di.localStoreService.getSyncStorage(fabric_storage_ns).get('hide_right_div');
      if(hide_div === true){
        _hide_div(true);
      } else {
        _show_div(true);
      }

      this.di.$rootScope.$emit('start_loading');

      this.di.deviceDataManager.getPorts().then((res)=>{
        if(res.data.ports){
          portGroups = this.di._.groupBy(res.data.ports , "element");
        }
        portsDefer.resolve();
        // let dstSwt = distributeSwitches(res.data.ports);
        // this.di.$scope.fabricModel['deSpines'] = dstSwt.spine;
        // this.di.$scope.fabricModel['deLeafs'] =dstSwt.leaf;
        // this.di.$scope.fabricModel['deOthers'] = dstSwt.other;
        // this.di.$scope.fabricModel.isShowTopo = true;
      });

      promises.push(portsDefer.promise);


      this.di.deviceDataManager.getDevices().then((res)=>{
        if(res.data.devices){
          this.realtimeDevices = res.data.devices;

        }
        devicesDefer.resolve();
      });
      promises.push(devicesDefer.promise);

      this.di.deviceDataManager.getDeviceConfigs().then((res)=>{
        if(res){
          this.devices = res;
        }
        deviceConfigsDefer.resolve();
      });
      promises.push(deviceConfigsDefer.promise);


      this.di.deviceDataManager.getEndpoints(null, 'host').then((res) => {
        this.endpoints = res.data.hosts;

        endpointsDefer.resolve();
      });
      promises.push(endpointsDefer.promise);

      this.logicalPorts = [];
      if(scope.licenseModel.isLogicalPortEnable){
        this.di.deviceDataManager.getLogicalPortsList().then((ports)=>{
          this.logicalPorts = ports;
          logicalPortDefer.resolve();
        },(err)=>{
          logicalPortDefer.resolve();
        });
        promises.push(logicalPortDefer.promise);
      }

      Promise.all(promises).then(()=>{

        let DI = this.di;
        let devices = this.devices;
        formatLeafGroupData(devices, this.realtimeDevices);
        DI.$rootScope.$emit('stop_loading');
        DI._.forEach(devices, (device)=>{
          device.ports = portGroups[device.id];
        });
        let dstSwt = distributeSwitches(devices);
        let unknownSwt = checkRealtimeUnknown(devices, this.realtimeDevices);
        DI.$scope.fabricModel['deSpines'] = dstSwt.spine;
        DI.$scope.fabricModel['deLeafs'] =dstSwt.leaf;
        DI.$scope.fabricModel['deOthers'] = unknownSwt.concat(dstSwt.other);
        DI.$scope.fabricModel['deLogicalPorts'] = angular.copy(this.logicalPorts);
        DI.$scope.fabricModel['deHosts'] = angular.copy(this.endpoints);

        DI.$scope.fabricModel.isShowTopo = true;

        DI.$scope.fabricModel.devices = angular.copy(devices);

        if(DI.$scope.fabricModel.topoSetting.show_path){
          _render_path_select(this.endpoints);
        }
        DI.$scope.$apply();
      });
    };



    // this.di.deviceDataManager.getPorts().then((res)=>{
    //   if(res.data.ports){
    //     portGroups = this.di._.groupBy(res.data.ports , "element");
    //   }
    //   portsDefer.resolve();
    //   // let dstSwt = distributeSwitches(res.data.ports);
    //   // this.di.$scope.fabricModel['deSpines'] = dstSwt.spine;
    //   // this.di.$scope.fabricModel['deLeafs'] =dstSwt.leaf;
    //   // this.di.$scope.fabricModel['deOthers'] = dstSwt.other;
    //   // this.di.$scope.fabricModel.isShowTopo = true;
    // });
    //
    // promises.push(portsDefer.promise);
    //
    //
    // this.di.deviceDataManager.getDevices().then((res)=>{
    //   if(res.data.devices){
    //     this.devices = res.data.devices;
    //
    //   }
    //   devicesDefer.resolve();
    // });
    // promises.push(devicesDefer.promise);
    //
    // Promise.all(promises).then(()=>{
    //   this.di._.forEach(this.devices, (device)=>{
    //     device.ports = portGroups[device.id];
    //   });
    //   let dstSwt = distributeSwitches(this.devices);
    //   this.di.$scope.fabricModel['deSpines'] = dstSwt.spine;
    //   this.di.$scope.fabricModel['deLeafs'] =dstSwt.leaf;
    //   this.di.$scope.fabricModel['deOthers'] = dstSwt.other;
    //   this.di.$scope.fabricModel.isShowTopo = true;
    //   this.di.$scope.$apply();
    // });

    this.di.deviceDataManager.getLinks().then((res)=>{
      this.di.$scope.fabricModel['deLinks'] = res.data.links;
    });

    let formatLeafGroupData=(devices, realtimeDevices)=> {
      let curTime = new Date().getTime();
      this.di._.forEach(devices, (device)=>{
        if(device.type.toLowerCase() === 'leaf' && device.leaf_group){
          device['leaf_group_name'] = (device.leaf_group.name === '' ||device.leaf_group.name === null) ? null: device.leaf_group.name;
          device['leaf_group_port'] = device.leaf_group.switch_port?device.leaf_group.switch_port:null;
        }

        this.di._.forEach(realtimeDevices, (rDevice)=>{
          if(rDevice.id === device.id){
            device.lastUpdate = this.di.commonService.calcRunningDate(curTime - rDevice.lastUpdate) ;
            return false;
          }
        });
      })
    };
    this.di.localStoreService.getStorage(fabric_storage_ns).get('topo_set').then((data)=>{
      if(data === undefined){
        this.di.$scope.fabricModel.topoSetting = {
          "show_links": 0,
          "show_tooltips":false,
          "show_ports":false,
          "show_path":false,
          "show_monitor": false
        }
      } else {
        this.di.$scope.fabricModel.topoSetting = data;
      }
    });

    this.di.$scope.topoRefresh = (event) => {
      init();

    };
    this.di.$scope.tooltipSetting = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_tooltips = !this.di.$scope.fabricModel.topoSetting.show_tooltips;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

    };
    this.di.$scope.lineSetting = (event) => {
      this.di.modalManager.open({
        template: require('../template/showlinks_select.html'),
        controller: 'showLinksSelectController',
        windowClass: 'show-links-selected-modal',
        resolve: {
          dataModel: () => {return {}}
        }
      }).result.then((data) => {
        if (data && !data.canceled) {
          this.di.$scope.fabricModel.topoSetting.show_links = data.data.mode;
          this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

          this.di.$rootScope.$emit('show_links');
        }});

    };


    this.di.$scope.portSettings = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_ports = !this.di.$scope.fabricModel.topoSetting.show_ports;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);
      this.di.$rootScope.$emit('show_ports');

    };

    this.di.$scope.pathSettings = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_path = !this.di.$scope.fabricModel.topoSetting.show_path;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

      if(this.di.$scope.fabricModel.topoSetting.show_path){
        this.di.deviceDataManager.getEndpoints(null, 'host').then((res)=>{
          if(res.data.hosts.length === 0){
            this.di.notificationService.renderWarning(scope, this.translate('MODULES.TOPO.NO_VALID_HOST'));
            return;
          } else {
            this.endpoints = res.data.hosts;
            _render_path_select(res.data.hosts);
          }
        },(err)=>{
          this.di.notificationService.renderWarning(scope, err.message)
        });
      } else {
        this.di.$rootScope.$emit('hide_path');
        hidePathDetail();
        hideHostDetail();
      }
    };



    this.di.$scope.monitorSettings = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_monitor = !this.di.$scope.fabricModel.topoSetting.show_monitor;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);


      if(!this.di.$scope.fabricModel.topoSetting.show_monitor){
        scope.stopMonitor();
      }
    };

    let congestionMetric = null,
        busyMetric = null;

    let FLOW_UNITS_CONSTRAINT = {
      'bps': 1,
      'kbps': 1024,
      'mbps': 1024*1024,
      'gbps': 1024*1024*1024,
    }
    scope.startMonitor = () =>{
      this.di.flowCacheService.clear();
      this.di.$rootScope.$emit('topo_monitor_metric');
      if(!validCurrentDom('topo_monitor')){
        return;
      }

      linkFlowDict = {};
      flowCalcData = {};

      busyMetric = FLOW_UNITS_CONSTRAINT[scope.fabricModel.busyMetricUnit.value.toLowerCase()] * parseInt(scope.fabricModel.busyMetric);
      congestionMetric = FLOW_UNITS_CONSTRAINT[scope.fabricModel.congestionMetricUnit.value.toLowerCase()] * parseInt(scope.fabricModel.congestionMetric);
      if(busyMetric >= congestionMetric){
        this.di.notificationService.renderWarning(scope,this.translate('MODULES.SWITCHES.TOPO.MONITOR.VALUE_VALIDATE'));
        return;
      }

      loop_monitor();
      loop_monitor_state();
    };

    scope.stopMonitor = () =>{
      // clearInterval(monitorInterval);
      clearTimeout(scope.monitorInterval);
      scope.monitorInterval = null;
      clearTimeout(monitorStateInterval);
      monitorStateInterval = null;
      scope.fabricModel.monitorState = this.translate('MODULES.TOPO.MONITOR.STATE_STOP');

      this.di.$rootScope.$emit('clearLinksColor');
    };

    let loop_monitor = () =>{
      this.di.deviceDataManager.getDevicePortsStatistics().then((res)=>{
        this.di.flowCacheService.setFlowData(res.data['statistics']);
        let _flowCalculate = this.di.flowCacheService.getCalcFlow();
        if(_flowCalculate){
          flowCalcData = _flowCalculate;
          linkFlowDict = {};
          changeLinkData();
          // console.log(linkFlowDict);
        }
      }, (err)=>{
        console.log(JSON.stringify(err))
      });
      scope.monitorInterval = setTimeout(loop_monitor,30000)
    };

    let loop_monitor_state = () =>{
      if(scope.fabricModel.monitorState === this.translate('MODULES.TOPO.MONITOR.STATE_STOP')){
        scope.fabricModel.monitorState = this.translate('MODULES.TOPO.MONITOR.STATE_RUNNING');
      } else {
        let baseStr = this.translate('MODULES.TOPO.MONITOR.STATE_RUNNING');
        if(scope.fabricModel.monitorState.length - baseStr.length < 12){
          scope.fabricModel.monitorState = scope.fabricModel.monitorState + '·';
        } else {
          scope.fabricModel.monitorState = this.translate('MODULES.TOPO.MONITOR.STATE_RUNNING');
        }
        scope.$apply();
      }
      monitorStateInterval = setTimeout(loop_monitor_state,200)
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

    let changeLinkData = ()=> {

      // let linkFlowDict = {};
      this.di._.forEach(scope.fabricModel.deLinks, (link)=>{
        let linkId = getLinkId([link.src.device,link.dst.device], [link.src.port,link.dst.port]);
        if(!linkFlowDict[linkId] && flowCalcData[link.src.device]){
          linkFlowDict[linkId] = {'src':angular.copy(link.src), 'dst':angular.copy(link.dst)};
          let flow = angular.copy(flowCalcData[link.src.device][link.src.port]);
          linkFlowDict[linkId]['flow'] = flow;

          // console.log(linkId + " : " + flow['bytesReceived'] +';' + flow['bytesSent']);

          let colorRes = _calcLinkColor(flow['bytesReceived'] + flow['bytesSent']);
          linkFlowDict[linkId]['color'] = colorRes[0];
          linkFlowDict[linkId]['__color_code'] = colorRes[1];

        }
      });

      this.di.$rootScope.$emit('changeLinksColor', linkFlowDict)
    };

    let _calcLinkColor = (bytesFlux) =>{
      let LINE_NORMAL = '136,234,136';
      let LINE_BUSY = '252,212,104';
      let LINE_CONGESTION = "255,0,0";
      if(bytesFlux >= busyMetric && bytesFlux < congestionMetric){
        return [LINE_BUSY, 'busy'];
      } else if(bytesFlux >= congestionMetric){
        return [LINE_CONGESTION, 'congestion'];
      } else {
        return [LINE_NORMAL,'normal'];
      }
    };




    let _render_path_select = (hosts) =>{
      scope.displayLabel.hosts.options = [{'label': this.translate('MODULES.SWITCHES.TOPO.DISPLAY.SELECT_ENDPOINT'), 'value':null}];
      this.di._.forEach(hosts, (host)=>{
        scope.displayLabel.hosts.options.push({'label':host.id, 'value':host.id})
      });

      scope.displayLabel.srcHosts.options = angular.copy(scope.displayLabel.hosts.options);
      scope.displayLabel.dstHosts.options = angular.copy(scope.displayLabel.hosts.options);

      scope.fabricModel.srcHost = scope.displayLabel.srcHosts.options[0];
      scope.fabricModel.dstHost = scope.displayLabel.dstHosts.options[0];
    };


    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if(out && out.length === 1){
        let invalidDoms = out[0].getElementsByClassName('mdc-text-field--invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }

    scope.findPath = () =>{
      if(scope.fabricModel.srcHost.value === null ||
        scope.fabricModel.dstHost.value === null ||
        scope.fabricModel.dstHost.value === scope.fabricModel.srcHost.value){
        if(scope.fabricModel.srcHost.value === null){
          scope.fabricModel.srcHost_select = false;
          setTimeout(function () {
            scope.fabricModel.srcHost_select = true;
            scope.$apply()
          },500)
        }

        if(scope.fabricModel.dstHost.value === null){
          scope.fabricModel.dstHost_select = false;
          setTimeout(function () {
            scope.fabricModel.dstHost_select = true;
            scope.$apply()
          },500)
        }

        return ;
      }


      this.di.$rootScope.$emit('topo_path_search');
      if(!validCurrentDom('topo_path_search')){
        return;
      }

      this.di.$rootScope.$emit('start_loading');
      this.di.deviceDataManager.postPathCalc(scope.fabricModel.srcHost.value, scope.fabricModel.dstHost.value, scope.fabricModel.latency).then((res)=>{
        this.di.$rootScope.$emit('show_path', res.data.links);
        this.di.$rootScope.$emit('stop_loading');
      },(err)=>{
        this.di.$rootScope.$emit('stop_loading');
        this.di.notificationService.renderWarning(scope, err)
      })
    };

    scope.clearPath = () =>{
      this.di.$rootScope.$emit('hide_path');
      hideHostDetail();
      hidePathDetail();
    };




    this.di.$scope.resize_div = (event) => {
      // console.log(event);
      event.preventDefault();
      // console.log(self);
      unInitializeTransition();

      this.di.$document.on("mouseup", mouseup);
      this.di.$document.on("mousemove", mousemove);
    };

    this.di.$scope.hide_right_div = (event) => {
      event.preventDefault();
      this.di.localStoreService.getStorage(fabric_storage_ns).get('hide_right_div').then((data)=>{
        if(data === true){
          _show_div();
          setTimeout(function () {
            send_resize_msg();
          });

          // this.di.localStoreService.getStorage(fabric_storage_ns).get('resize_db').then((data)=>{
          //   if(data){
          //     let win_width = this.di.$window.innerWidth;
          //     this.di.$scope.resize_right = data['resize_right'];
          //     this.di.$scope.resize_length = data['resize_length'];
          //
          //     let rightLenStr = data['resize_length']['width'];
          //     let rightLen = Number(rightLenStr.substr(0, rightLenStr.length - 2 ));
          //     this.di.$scope.resize_right_plus = {'right': (rightLen + 5) +'px','width': ( win_width - rightLen - 5)+ 'px'};
          //   }
          // });
          //
          // this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("hide_right_div", false);
        } else {

          _hide_div();
          // _show_div();
          // let win_width = this.di.$window.innerWidth;
          // this.di.$scope.resize_right_plus = {'right': '0px','width': win_width + 'px'};
          // this.di.$scope.resize_right = {'display':'none'};
          // this.di.$scope.resize_length = {'display':'none'};
          // this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("hide_right_div", true);
          setTimeout(function () {
            send_resize_msg();
          });
        }

      })





    };


    let mouseup = (event) =>{
      // console.log('mouseup');
      send_resize_msg();
      this.di.$document.off('mousemove', mousemove);
      this.di.$document.off('mouseup', mouseup);
    };

    let mousemove = (event) => {
      var x = event.pageX;
      let win_width = this.di.$window.innerWidth;
      //控制拖拉的最大最小宽度
      if(win_width - x > 500){
        return;
      }
      if(win_width - x < 300){
        return;
      }
      this.di.$scope.resize_right_plus = {'right': (win_width - x + 2.5) +'px','width': (x - 2.5)+ 'px'};
      this.di.$scope.resize_right = {'right':+ (win_width - x - 2.5) +'px'};
      this.di.$scope.resize_length = {'width':+ (win_width - x - 2.5) +'px', 'right':'0px'};

      let data = {
        // 'resize_right_plus':angular.copy(this.di.$scope.resize_right_plus),
        'resize_right':angular.copy(this.di.$scope.resize_right),
        'resize_length':angular.copy(this.di.$scope.resize_length),
      }
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("resize_db", data);
      this.di.$scope.$apply();

      // if(this.resizeTimeout){
      //   this.di.$timeout.cancel(this.resizeTimeout);
      // }
      // this.resizeTimeout = this.di.$timeout(send_resize_msg, 500);
      // send_resize_msg();
    };

    let send_resize_msg = () => {
      this.di.$rootScope.$emit('resize_canvas');
    };

    angular.element(this.di.$window).bind('resize', () => {
      let win_width = this.di.$window.innerWidth;
      let rightStr = this.di.$scope.resize_right_plus['right'];
      let right = Number(rightStr.substr(0, rightStr.indexOf("px")));
      this.di.$scope.resize_right_plus['width'] = (win_width - right) + 'px';
      this.di.$rootScope.$emit('resize_summary');
      this.di.$scope.$apply();
    });


    // this.di.$timeout(function () {
    //   // initTop()
    // },200);

    // let initTop = () =>{
    //   this.di.$rootScope.$emit('resize_canvas');
    // };


    let win_width = this.di.$window.innerWidth;
    this.di.$scope.resize_right_plus = {'width': (win_width - 300)+ 'px','right':'300px'};


    let showHostDetail = (id) =>{
      if(this.di.$scope.fabricModel.showHostDetail){
        this.di.$scope.fabricModel.showHostDetail = false;
        this.di.$scope.$apply();
      }

      this.di.$scope.fabricModel.showHostId = id;
      this.di.$scope.fabricModel.showHostDetail = true;
      showHost();
    };



    let showHost = () =>{
      let host = this.di._.find(this.endpoints,{id: scope.fabricModel.showHostId});
      let trStart = '<tr>';
      let trEnd= '</tr>';
      let tdStart = '<td>';
      let tdEnd = '</td>';

      let pathHost_detail = angular.element(document.getElementById('pathHost'));
      pathHost_detail.empty();

      let firstTdContent = '<div>'+ this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.MAC')+'</div>';
      let secondTdContent = '<div>'+ host.mac +'</div>';
      let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
      pathHost_detail.append(tr);

      firstTdContent = '<div>'+ this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.VLAN') +'</div>';
      secondTdContent = '<div>'+ host.vlan +'</div>';
      tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
      pathHost_detail.append(tr);

      firstTdContent = '<div>' + this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.IP') + '</div>';
      secondTdContent = '<div>'+ host.ipAddresses.join(',') +'</div>';
      tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
      pathHost_detail.append(tr);

      firstTdContent = '<div>'+ this.translate('MODULES.SWITCHES.ENDPOINT.COLUMN.LOCATION') +'</div>';
      secondTdContent = '<div>'+ host.locations.map(x=>this.di.switchService.getSwitchName( x.elementId, this.devices) + '/' + x.port).join(',') +'</div>';
      tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
      pathHost_detail.append(tr)

      firstTdContent = '<div>'+ this.translate('MODULES.ENDPOINT.CREATE.DESC') +'</div>';
      secondTdContent = '<div>'+ host.description +'</div>';
      tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
      pathHost_detail.append(tr);
    };


    let hideHostDetail = () =>{
      this.di.$scope.fabricModel.showHostDetail = false;
      this.di.$scope.fabricModel.showHostId = null;
    };

    let showSwitchDetail = (id, type, summaryList) => {

      //wls start: 此处是为了切换点击switch的时候能够切换右侧的详情
      if(this.di.$scope.fabricModel.showSwitchDetail){
        this.di.$scope.fabricModel.showSwitchDetail = false;
        this.di.$scope.$apply();
      }

      this.di.$scope.fabricModel.showSwitchId = id;
      this.di.$scope.fabricModel.showSwitchDetail = true;
      // this.di.$scope.$apply();
      //wls end

      showDetail(summaryList);
      showPorts();
      showLinks();
      showEndpoints();
      // showStatics();
      // showFlows();
      this.di.$scope.$apply();
    };

    let hideSwitchDetail = () =>{
      this.di.$scope.fabricModel.showSwitchDetail = false;
      this.di.$scope.fabricModel.showSwitchId = null;
      this.di.$scope.fabricModel.switchPorts = null;
      this.di.$scope.fabricModel.switchLinks = null;
      // this.di.$scope.$apply();
    };


    let showDetail = (summaryList) => {
      // let leftDom = angular.element(document.getElementsByClassName('detail_summary__body--left'));
      // let rightDom = angular.element(document.getElementsByClassName('detail_summary__body--right'));
      //
      // rightDom.empty();
      // leftDom.empty();
      // this.di._.forEach(summaryList, (item, key)=>{
      //   if(item.label === 'id'){
      //     return
      //   }
      //   leftDom.append('<div>'+ item.label +'</div>');
      //   if(item.value === "false" || item.value === false){
      //     rightDom.append('<div><svg  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"> <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="red"/> <path d="M0 0h24v24H0z" fill="none"/> </svg></div>');
      //   } else if(item.value === "true" || item.value === true) {
      //     rightDom.append("<div><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'><path fill='none' d='M0 0h18v18H0z'/><path d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' fill='green'/></svg></div>");
      //   } else {
      //     if(item.label === 'name'){
      //       rightDom.append('<div><a class="summary__link" target="_blank" href="/#!/devices/'+ this.di.$scope.fabricModel.showSwitchId +'">'+ item.value +'</a></div>');
      //     } else{
      //       rightDom.append('<div>'+ item.value +'</div>');
      //     }
      //   }
      // });
      //

      let trStart = '<tr>';
      let trEnd= '</tr>';
      let tdStart = '<td>';
      let tdEnd = '</td>';

      let topo_detail = angular.element(document.getElementById('topo_detail'));
      topo_detail.empty();

      this.di._.forEach(summaryList, (item, key)=>{
        if(item.label.toLowerCase() === 'id'){
          return
        }
        let firstTdContent = '<div>'+ item.label +'</div>';

        let secondTdContent = '';
        if(item.value === "false" || item.value === false){
          secondTdContent = '<div><svg  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"> <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="red"/> <path d="M0 0h24v24H0z" fill="none"/> </svg></div>';
        } else if(item.value === "true" || item.value === true) {
          secondTdContent = "<div><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'><path fill='none' d='M0 0h18v18H0z'/><path d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' fill='green'/></svg></div>";
        } else {
          if(item.label === this.translate('MODULES.COMMON.NAME')){
            if(item.value === undefined){
              item.value = ''
            }
            secondTdContent = '<div><a class="summary__link" target="_blank" href="/#!/devices/'+ this.di.$scope.fabricModel.showSwitchId +'">'+ item.value +'</a></div>';
          } else{
            secondTdContent = '<div>'+ item.value +'</div>';
          }
        }

        let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
        topo_detail.append(tr)
      });


    };

    let showPorts = () =>{
      for(let key in this.di.$scope.fabricModel['deSpines']){
        let sw = this.di.$scope.fabricModel['deSpines'][key];
        if(sw.id === this.di.$scope.fabricModel.showSwitchId){
          scope.fabricModel.switchPorts = this.getEntitiesPorts(sw.ports);
          return;
        }
      }


      for(let key in this.di.$scope.fabricModel['deLeafs']){
        let sw = this.di.$scope.fabricModel['deLeafs'][key];
        if(sw.id === this.di.$scope.fabricModel.showSwitchId){
          scope.fabricModel.switchPorts = this.getEntitiesPorts(sw.ports);
          return;
        }
      }

      for(let key in this.di.$scope.fabricModel['deOthers']){
        let sw = this.di.$scope.fabricModel['deOthers'][key];
        if(sw.id === this.di.$scope.fabricModel.showSwitchId){
          scope.fabricModel.switchPorts = this.getEntitiesPorts(sw.ports);
          return;
        }
      }

      // this.di.deviceDataManager.getDeviceWithPorts(this.di.$scope.fabricModel.showSwitchId).then((res) => {
      //   // let entities = this.getEntities(res.data.ports);
      //   if(res.data.ports && res.data.ports instanceof Array){
      //     scope.fabricModel.switchPorts = this.getEntitiesPorts(res.data.ports);
      //   } else {
      //     scope.fabricModel.switchPorts = [];
      //   }
      //
      //   // this.di.$scope.$apply();
      // }, () => {
      //   scope.fabricModel.switchPorts = [];
      // });
    };

    let showLinks = () =>{
      let links = [];

      this.di._.forEach(this.di.$scope.fabricModel['deLinks'], (link, key) => {
        if(link.src.device === this.di.$scope.fabricModel.showSwitchId || link.dst.device === this.di.$scope.fabricModel.showSwitchId){
          links.push(link);
        }
      });

      scope.fabricModel.switchLinks = this.getEntitiesLinks(links);

      // this.di.deviceDataManager.getLinks(this.di.$scope.fabricModel.showSwitchId).then((res) => {
      //   // let entities = this.getEntities(res.data.ports);
      //   scope.fabricModel.switchLinks = this.getEntitiesLinks(res.data.links);
      //   this.updateLinksByDeviceId(this.di.$scope.fabricModel.showSwitchId, res.data.links)
      //   // this.di.$scope.$apply();
      // }, (err) => { // add by yazhou.miao
      //   scope.fabricModel.switchLinks = [];
      // });
    };

    let showEndpoints = () => {
      let endpoints = [];
      this.di._.forEach(this.endpoints, (endpoint) => {
        this.di._.forEach(endpoint.locations, (location)=>{
          if(location.elementId === this.di.$scope.fabricModel.showSwitchId ){
            endpoints.push(angular.copy(endpoint));
            return false;
          }
        })
      });

      scope.fabricModel.endpoints = this.getEntitiesEndpoints(endpoints);
    };

    unsubscribers.push(this.di.$rootScope.$on('switch_select',(evt, data)=>{
      hideHostDetail();
      hidePathDetail();

      this.di.$scope.fabricModel.switchContextMenu.isShow = false;
      this.di.$scope.$apply();
      showSwitchDetail(data.id, data.type, data.value);
    }));


    unsubscribers.push(this.di.$rootScope.$on('host_select',(evt, data)=>{
      this.di.$scope.fabricModel.switchContextMenu.isShow = false;
      hideSwitchDetail();
      hidePathDetail();

      showHostDetail(data.id);
      this.di.$scope.$apply();

    }));

    let hidePathDetail = () =>{
      scope.fabricModel.showPathInfo = false;
    };


    let showPathInfo = (start, end)=>{
      let trStart = '<tr>';
      let trEnd= '</tr>';
      let tdStart = '<td>';
      let tdEnd = '</td>';

      let pathInfo_detail = angular.element(document.getElementById('pathInfo'));
      pathInfo_detail.empty();

      if(start.type === 'HOST'){
        let firstTdContent = '<div>'+ this.translate('MODULES.TOPO.PATH.SOURCE.HOST') +'</div>';
        let secondTdContent = '<div>'+ start.instance.mac +'</div>';
        let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
        pathInfo_detail.append(tr)
      } else {
        let firstTdContent = '<div>'+ this.translate('MODULES.TOPO.PATH.SOURCE.SWITCH') +'</div>';
        let secondTdContent = '<div>'+ start.instance.name +'</div>';
        let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
        pathInfo_detail.append(tr)

        firstTdContent = '<div>'+ this.translate('MODULES.TOPO.PATH.SOURCE.SWITCH_PORT') +'</div>';
        secondTdContent = '<div>'+ start.port +'</div>';
        tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
        pathInfo_detail.append(tr)
      }

      pathInfo_detail.append('</br>');

      if(end.type === 'HOST'){
        let firstTdContent = '<div>'+ this.translate('MODULES.TOPO.PATH.DST.HOST') +'</div>';
        let secondTdContent = '<div>'+ end.instance.mac +'</div>';
        let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
        pathInfo_detail.append(tr)
      } else {
        let firstTdContent = '<div>'+ this.translate('MODULES.TOPO.PATH.DST.SWITCH') +'</div>';
        let secondTdContent = '<div>'+ end.instance.name +'</div>';
        let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
        pathInfo_detail.append(tr)

        firstTdContent = '<div>'+ this.translate('MODULES.TOPO.PATH.DST.SWITCH_PORT') +'</div>';
        secondTdContent = '<div>'+ end.port +'</div>';
        tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
        pathInfo_detail.append(tr)
      }
    };

    unsubscribers.push(this.di.$rootScope.$on('path_select',(evt, data)=>{
      let param = data.value;
      let start = param.start;
      let end = param.end;

      if(start.type === 'HOST'){
        start['instance'] = this.di._.find(this.endpoints, {id: start.id})
      } else {
        start['instance'] = this.di._.find(this.devices, {id: start.id})
      }

      if(end.type === 'HOST'){
        end['instance'] = this.di._.find(this.endpoints, {id: end.id})
      } else {
        end['instance'] = this.di._.find(this.devices, {id: end.id})
      }

      hideHostDetail();
      hideSwitchDetail();

      scope.fabricModel.showPathInfo = true;
      showPathInfo(start, end);
      scope.$apply();

    }));




    unsubscribers.push(this.di.$rootScope.$on('switch_opt',(evt, data)=>{

      if(scope.role > 1){
        scope.fabricModel.switchContextMenu.data = angular.copy(scope.fabricModel.switchContextMenu.back_data)
        let device = this.devices.find((device)=>{
          return device.id === data.id
        })
        if(device){
          if(device.protocol !== 'of') {
            this.di._.remove(scope.fabricModel.switchContextMenu.data, (item)=>{
              return 'summary_switch_menu_show_group' === item['msg'] ||
                    'summary_switch_menu_create_group' === item['msg'] ||
                    'summary_switch_menu_show_flow' === item['msg'] ||
                    'summary_switch_menu_create_flow' === item['msg'];
            });
          }
        }

        if(this.di.$scope.fabricModel.switchContextMenu.data.length === 0){
          return;
        }
        if(this.di.$scope.fabricModel.switchContextMenu.isShow){
          this.di.$scope.fabricModel.switchContextMenu.isShow = false;
          setTimeout(()=>{
            this.di.$scope.fabricModel.switchContextMenu.location= {'x':data.event.clientX, 'y':data.event.clientY};
            this.di.$scope.fabricModel.switchContextMenu.isShow = true;
            this.di.$scope.$apply();
          },100);

        } else {
          this.di.$scope.fabricModel.switchContextMenu.location= {'x':data.event.clientX, 'y':data.event.clientY};
          this.di.$scope.fabricModel.switchContextMenu.isShow = true;
        }
        hideSwitchDetail();
        hideHostDetail();
        hidePathDetail();
        this.di.$scope.fabricModel.showSwitchId = data.id;
        this.di.$scope.$apply();
      }
    }));

    unsubscribers.push(this.di.$rootScope.$on('topo_unselect',(evt)=>{
      // console.log('==switch_select is receive. isShow: ' + this.di.$scope.fabricModel.switchContextMenu.isShow);
      this.di.$scope.fabricModel.switchContextMenu.isShow = false;
      hideSwitchDetail();
      hidePathDetail();
      hideHostDetail();
      this.di.$scope.$apply();

    }));

    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_edit',(evt)=>{
      this.di.$rootScope.$emit('switch-wizard-show', this.di.$scope.fabricModel.showSwitchId);

    }));

    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_create_flow',(evt)=>{
      this.di.$rootScope.$emit('flow-wizard-show', this.di.$scope.fabricModel.showSwitchId);

    }));

    unsubscribers.push(this.di.$rootScope.$on('summary_switch_pfc',(evt)=>{
      this.di.$rootScope.$emit('pfc-wizard-show', this.di.$scope.fabricModel.showSwitchId);

    }));



  
    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_create_group',(evt)=>{
      this.di.$rootScope.$emit('group-wizard-show', this.di.$scope.fabricModel.showSwitchId);
    }));


    unsubscribers.push(this.di.$rootScope.$on('summary_switch_reboot',(evt)=>{
      this.di.dialogService.createDialog('confirm', this.translate('MODULES.SUMMARY.REBOOT.CONFORM'))
        .then((data)=>{
          this.di.deviceDataManager.rebootDevice(this.di.$scope.fabricModel.showSwitchId);
        },(res)=>{
          // error
        })

    }));


    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_show_flow',(evt)=>{
      this.di.modalManager.open({
          template: require('../template/showSwitchFlows.html'),
          controller: 'showSwitchFlowsController',
          windowClass: 'show-switch-flow-modal',
          resolve: {
            dataModel: () => {
              return {
                switchId: this.di.$scope.fabricModel.showSwitchId    
              }
            }
          }
        });
    }));
  
    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_show_group',(evt)=>{
      this.di.modalManager.open({
        template: require('../template/showSwitchGroups.html'),
        controller: 'showSwitchGroupsController',
        windowClass: 'show-switch-group-modal',
        resolve: {
          dataModel: () => {
            return {
              switchId: this.di.$scope.fabricModel.showSwitchId
            }
          }
        }
      });
    }));

    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_show_pfc',(evt)=>{
      this.di.modalManager.open({
        template: require('../template/showSwitchPFCs.html'),
        controller: 'showSwitchPFCsController',
        windowClass: 'show-switch-pfc-modal',
        resolve: {
          dataModel: () => {
            return {
              switchId: this.di.$scope.fabricModel.showSwitchId
            }
          }
        }
      });
    }));

    unsubscribers.push(this.di.$rootScope.$on('device-flow-refresh',()=>{
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.SWITCH.DETAIL.FLOW.CREATE.SUCCESS'));
    }));

    unsubscribers.push(this.di.$rootScope.$on('pfc-list-refresh',()=>{
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.SWITCH.DETAIL.PFC.CREATE.SUCCESS'));
    }));


    unsubscribers.push(this.di.$rootScope.$on('summary_links_set',(evt, data)=>{

      this.di.$scope.fabricModel.topoSetting.show_links = data;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

      this.di.$rootScope.$emit('show_links');

    }));


    unsubscribers.push(this.di.$scope.$watch('fabricModel.topoType',(newValue, oldValue)=>{
      if(newValue === 'force'){

      }

    }));

    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unsubscribers, (unsubscribe) => {
        unsubscribe();
      });
      angular.element(this.di.$window).off('resize');
      scope.stopMonitor();
      // this.di.$log.info('FabricSummaryController', 'Destroyed');
    });

    this.init_application_license();
    setTimeout(function () {
      init();
    });
  }

  setTableOpt(obj){
    obj.opt = '';
  }

  getEntitiesPorts(ports){
    let entities = [];
    if(!Array.isArray(ports)) return entities;
    this.di._.forEach(ports, (port)=>{
      let obj = {};
      obj.element = port.element;
      obj.port_name = port.annotations.portName;
      obj.port_mac = port.annotations.portMac;
      obj.port_id = port.port;
      obj.link_status = port.annotations.linkStatus;
      obj.type = port.type;
      obj.speed = port.portSpeed;
      obj.device_name = port.element;
      obj.isEnabled = port.isEnabled;
      obj.port_status = port.isEnabled === true ? 'up':'down';
        // this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE') :
        // this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE');
      obj.admin_state = port.annotations.adminState === 'enabled' ?
        this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.ENABLE') :
        this.translate('MODULES.SWITCHES.PORT.ROW.ACTION.DISABLE');

      this.setTableOpt(obj);
      entities.push(obj);
    });
    return entities;
  }

  getEntitiesLinks(links){
    let entities = [];
    if(!Array.isArray(links)) return entities;
    this.di._.forEach(links, (link)=>{
      if(link.src.device == this.di.$scope.fabricModel.showSwitchId){
        let obj = {};
        obj.src_device = this.di.switchService.getSwitchName(link.src.device, this.devices);
        obj.src_port = link.src.port;
        obj.dst_device =  this.di.switchService.getSwitchName(link.dst.device, this.devices);
        obj.dst_port = link.dst.port;
        obj.state = link.state;
        // this.setTableOpt(obj);
        entities.push(obj);
      }
    });
    return entities;
  }

  getEntitiesEndpoints(endpoints) {
    let entities = [];
    if(!Array.isArray(endpoints)) return entities;
    endpoints.forEach((endpoint) => {
      let obj = {};
      obj.id = endpoint.id;
      obj.mac = endpoint.mac;
      obj.segment_name = endpoint.segment || endpoint.vlan;
      obj.ip = (endpoint.ipAddresses && endpoint.ipAddresses.join(" | "))
        || (endpoint.ipAddresses && endpoint.ipAddresses.join(" | "));
      let locals = [];
      endpoint.locations.forEach((location) => {
        let device_name = (location.device_id && this.di.switchService.getSwitchName(location.device_id, this.devices))
          || (location.elementId && this.di.switchService.getSwitchName(location.elementId, this.devices));
        locals.push(device_name + '/' + location.port);
      });
      obj.location = locals.join(" | ");
      entities.push(obj);
    });
    return entities;
  }


  init_application_license(){
    let scope = this.di.$scope;
    this.di.applicationService.getNocsysAppsState().then(()=>{
      let allState = this.di.applicationService.getAppsState();

      let _get_license_info = () =>{
        let OPENFLOW_APP_NAME = 'org.onosproject.openflow';
        let QOS_APP_NAME = 'com.nocsys.qos';
        let SWTMGT_APP_NAME = 'com.nocsys.switchmgmt';
        let LOGICALPORT_APP_NAME = 'com.nocsys.logicalport';
        let CALCPATH_APP_NAME = 'com.nocsys.calcpath';

        if(allState[OPENFLOW_APP_NAME] === 'ACTIVE'){
          scope.licenseModel.isOpenflowEnable= true;
        }

        if(allState[QOS_APP_NAME] === 'ACTIVE'){
          scope.licenseModel.isQosEnable= true;
        }

        if(allState[SWTMGT_APP_NAME] === 'ACTIVE'){
          scope.licenseModel.isSwtManageEnable= true;
        }

        if(allState[LOGICALPORT_APP_NAME] === 'ACTIVE'){
          scope.licenseModel.isLogicalPortEnable= true;
        }

        if(allState[CALCPATH_APP_NAME] === 'ACTIVE'){
          scope.licenseModel.isCalcPathEnable= true;
        }


      };
      let _reset_right_menu = () =>{

        if(!scope.licenseModel.isOpenflowEnable){
          this.di._.remove(scope.fabricModel.switchContextMenu.data, (item)=>{
            return 'summary_switch_menu_create_flow' === item['msg'] || 'summary_switch_menu_show_flow' === item['msg'] ||'summary_switch_menu_create_group' === item['msg']||'summary_switch_menu_show_group' === item['msg']
          });
        }

        if(!scope.licenseModel.isQosEnable){
          this.di._.remove(scope.fabricModel.switchContextMenu.data, (item)=>{
            return 'summary_switch_pfc' === item['msg'] || 'summary_switch_menu_show_pfc' === item['msg'];
          });
        }

        if(!scope.licenseModel.isSwtManageEnable){
          this.di._.remove(scope.fabricModel.switchContextMenu.data, (item)=>{
            return 'summary_switch_reboot' === item['msg'];
          });
        }
        scope.fabricModel.switchContextMenu.back_data = angular.copy(scope.fabricModel.switchContextMenu.data)
      };

      _get_license_info();
      _reset_right_menu();
    });
  }

}

FabricSummaryController.$inject = FabricSummaryController.getDI();
FabricSummaryController.$$ngIsClass = true;

