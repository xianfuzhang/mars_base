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
      'deviceService',
      'appService',
      'deviceDataManager',
      'tableProviderFactory',
      'deviceService',
      'switchService',
    ];
  }

  constructor(...args) {
    this.di = {};

    FabricSummaryController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.translate = this.di.$filter('translate');

    let fabric_storage_ns = "storage_farbic_";
    let unsubscribers = [];
    let scope = this.di.$scope;

    this.resizeTimeout = null;
    this.di.$scope.resize_right_plus = {};
    this.di.$scope.resize_right = {};
    this.di.$scope.resize_length = {};

    let distributeSwitches = (allSwitches) => {
      let distributeSwt = {'spine':[], 'leaf':[], 'other':[]};
      this.di._.forEach(allSwitches, (swt, index)=>{
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


    this.di.$scope.fabricModel = {
      showSwitchDetail: false,
      isShowTopo: false,
      portsSchema: this.di.deviceService.getSummaryPortsTableSchema(),
      linksSchema: this.di.deviceService.getSummaryLinkTableSchema(),
      switchContextMenu: {
        location:{'x':0, 'y':1},
        isShow : false,
        data:this.di.deviceService.getSummarySwitchMenu()
      }

    };

    let portsDefer = this.di.$q.defer(),
      devicesDefer = this.di.$q.defer();
    let promises = [];
    let portGroups = {};
    this.devices = [];

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
        this.devices = res.data.devices;

      }
      devicesDefer.resolve();
    });
    promises.push(devicesDefer.promise);

    Promise.all(promises).then(()=>{
      this.di._.forEach(this.devices, (device)=>{
        device.ports = portGroups[device.id];
      });
      let dstSwt = distributeSwitches(this.devices);
      this.di.$scope.fabricModel['deSpines'] = dstSwt.spine;
      this.di.$scope.fabricModel['deLeafs'] =dstSwt.leaf;
      this.di.$scope.fabricModel['deOthers'] = dstSwt.other;
      this.di.$scope.fabricModel.isShowTopo = true;
      this.di.$scope.$apply();
    });

    this.di.deviceDataManager.getLinks().then((res)=>{
      this.di.$scope.fabricModel['deLinks'] = res.data.links;
    });


    this.di.localStoreService.getStorage(fabric_storage_ns).get('topo_set').then((data)=>{
      if(data === undefined){
        this.di.$scope.fabricModel.topoSetting = {
          "show_links": false,
          "show_tooltips":false,
          "show_ports":false,
        }
      } else {
        this.di.$scope.fabricModel.topoSetting = data;
      }
    });

    this.di.$scope.topoRefresh = (event) => {

    };
    this.di.$scope.tooltipSetting = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_tooltips = !this.di.$scope.fabricModel.topoSetting.show_tooltips;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

    };
    this.di.$scope.lineSetting = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_links = !this.di.$scope.fabricModel.topoSetting.show_links;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

      this.di.$rootScope.$emit('show_links');
    };

    this.di.$scope.portSettings = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_ports = !this.di.$scope.fabricModel.topoSetting.show_ports;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);
      this.di.$rootScope.$emit('show_ports');

    };

    this.di.$scope.resize_div = (event) => {
      // console.log(event);
      event.preventDefault();
      // console.log(self);
      this.di.$document.on("mouseup", mouseup);
      this.di.$document.on("mousemove", mousemove);
    };

    let mouseup = (event) =>{
      // console.log('mouseup');
      this.di.$document.off('mousemove', mousemove);
      this.di.$document.off('mouseup', mouseup);
    };

    let mousemove = (event) => {
      var x = event.pageX;
      let win_width = this.di.$window.innerWidth;
      if(win_width - x > 500){
        return;
      }
      this.di.$scope.resize_right_plus = {'right': (win_width - x + 5) +'px','width': (x - 5)+ 'px'};
      this.di.$scope.resize_right = {'right':+ (win_width - x) +'px'};
      this.di.$scope.resize_length = {'width':+ (win_width - x) +'px'};
      this.di.$scope.$apply();

      // if(this.resizeTimeout){
      //   this.di.$timeout.cancel(this.resizeTimeout);
      // }
      // this.resizeTimeout = this.di.$timeout(send_resize_msg, 500);
      send_resize_msg();
    };

    let send_resize_msg = () => {
      this.di.$rootScope.$emit('resize_canvas');
    };

    angular.element(this.di.$window).bind('resize', () => {
      let win_width = this.di.$window.innerWidth;
      let rightStr = this.di.$scope.resize_right_plus['right'];
      let right = Number(rightStr.substr(0, rightStr.indexOf("px")));
      this.di.$scope.resize_right_plus['width'] = (win_width - right) + 'px';
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
      // showStatics();
      // showFlows();
      this.di.$scope.$apply();
    };

    let hideSwitchDetail = () =>{
      this.di.$scope.fabricModel.showSwitchDetail = false;
      this.di.$scope.fabricModel.showSwitchId = null;
      this.di.$scope.fabricModel.switchPorts = null;
      this.di.$scope.fabricModel.switchLinks = null;
      this.di.$scope.$apply();
    };



    let showDetail = (summaryList) => {
      let leftDom = angular.element(document.getElementsByClassName('detail_summary__body--left'));
      let rightDom = angular.element(document.getElementsByClassName('detail_summary__body--right'));
      rightDom.empty();
      leftDom.empty();
      this.di._.forEach(summaryList, (item, key)=>{
        leftDom.append('<div>'+ item.label +'</div>');
        rightDom.append('<div>'+ item.value +'</div>');
      });
    };

    let showPorts = () =>{
      this.di.deviceDataManager.getDeviceWithPorts(this.di.$scope.fabricModel.showSwitchId).then((res) => {
        // let entities = this.getEntities(res.data.ports);
        scope.fabricModel.switchPorts = this.getEntitiesPorts(res.data);
        // this.di.$scope.$apply();
      });
    };

    let showLinks = () =>{
      this.di.deviceDataManager.getLinks(this.di.$scope.fabricModel.showSwitchId).then((res) => {
        // let entities = this.getEntities(res.data.ports);
        scope.fabricModel.switchLinks = this.getEntitiesLinks(res.data.links);
        // this.di.$scope.$apply();
      });
    };




    unsubscribers.push(this.di.$rootScope.$on('switch_select',(evt, data)=>{
      // console.log('==switch_select is receive. isShow: ' + this.di.$scope.fabricModel.switchContextMenu.isShow);
      this.di.$scope.fabricModel.switchContextMenu.isShow = false;
      this.di.$scope.$apply();
      showSwitchDetail(data.id, data.type, data.value);
    }));


    unsubscribers.push(this.di.$rootScope.$on('switch_opt',(evt, data)=>{
      // console.log('==switch_opt is receive. isShow: ' + this.di.$scope.fabricModel.switchContextMenu.isShow);
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
      this.di.$scope.fabricModel.showSwitchId = data.id;
      this.di.$scope.$apply();

    }));

    unsubscribers.push(this.di.$rootScope.$on('topo_unselect',(evt)=>{
      // console.log('==switch_select is receive. isShow: ' + this.di.$scope.fabricModel.switchContextMenu.isShow);
      this.di.$scope.fabricModel.switchContextMenu.isShow = false;
      hideSwitchDetail();

    }));

    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_edit',(evt)=>{
      this.di.$rootScope.$emit('switch-wizard-show', this.di.$scope.fabricModel.showSwitchId);

    }));


    unsubscribers.push(this.di.$rootScope.$on('summary_switch_menu_create_flow',(evt)=>{
      this.di.$rootScope.$emit('flow-wizard-show', this.di.$scope.fabricModel.showSwitchId);

    }));

    


    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unsubscribers, (unsubscribe) => {
        unsubscribe();
      });
      // this.di.$log.info('FabricSummaryController', 'Destroyed');
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
      obj.port_status ='1';
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
        obj.src_device = this.di.switchService.getSwitchName(link.src.device, this.devices) ;
        obj.src_port = link.src.port;
        obj.dst_device =  this.di.switchService.getSwitchName(link.dst.device, this.devices) ;;
        obj.dst_port = link.dst.port;
        obj.state = link.state;
        // this.setTableOpt(obj);
        entities.push(obj);
      }
    });
    return entities;
  }
}

FabricSummaryController.$inject = FabricSummaryController.getDI();
FabricSummaryController.$$ngIsClass = true;

