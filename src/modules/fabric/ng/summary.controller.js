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
      'tableProviderFactory',
      'deviceService',
      'switchService',
      'commonService',
      'modalManager'
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
      devicesDefer = this.di.$q.defer(),
      deviceConfigsDefer = this.di.$q.defer();
    let promises = [];
    let portGroups = {};
    this.devices = [];
    this.realtimeDevices = [];

    let init = () => {
      this.di.localStoreService.getStorage(fabric_storage_ns).get('resize_db').then((data)=>{
        if(data){
          let win_width = this.di.$window.innerWidth;
          this.di.$scope.resize_right = data['resize_right'];
          this.di.$scope.resize_length = data['resize_length'];

          let rightLenStr = data['resize_length']['width'];
          let rightLen = Number(rightLenStr.substr(0, rightLenStr.length - 2 ));
          this.di.$scope.resize_right_plus = {'right': (rightLen + 5) +'px','width': ( win_width - rightLen - 5)+ 'px'};
        }
      });


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


      Promise.all(promises).then(()=>{

        let DI = this.di;
        let devices = this.devices;
        formatLeafGroupData(devices, this.realtimeDevices);
        //TODO 这里为了给台湾同事测试效果增加timeout
        setTimeout(function () {
          DI.$rootScope.$emit('stop_loading');
          DI._.forEach(devices, (device)=>{
            device.ports = portGroups[device.id];
          });
          let dstSwt = distributeSwitches(devices);
          DI.$scope.fabricModel['deSpines'] = dstSwt.spine;
          DI.$scope.fabricModel['deLeafs'] =dstSwt.leaf;
          DI.$scope.fabricModel['deOthers'] = dstSwt.other;
          DI.$scope.fabricModel.isShowTopo = true;
          DI.$scope.$apply();
        },1000)

        // this.di._.forEach(this.devices, (device)=>{
        //   device.ports = portGroups[device.id];
        // });
        // let dstSwt = distributeSwitches(this.devices);
        // this.di.$scope.fabricModel['deSpines'] = dstSwt.spine;
        // this.di.$scope.fabricModel['deLeafs'] =dstSwt.leaf;
        // this.di.$scope.fabricModel['deOthers'] = dstSwt.other;
        // this.di.$scope.fabricModel.isShowTopo = true;
        // this.di.$scope.$apply();
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
        if(device.type.toLowerCase() === 'leaf'){
          device['leaf_group_name'] = device.leafGroup.name?device.leafGroup.name:null;
          device['leaf_group_port'] = device.leafGroup.switch_port?device.leafGroup.switch_port:null;
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
      //控制拖拉的最大最小宽度
      if(win_width - x > 500){
        return;
      }
      if(win_width - x < 300){
        return;
      }
      this.di.$scope.resize_right_plus = {'right': (win_width - x + 5) +'px','width': (x - 5)+ 'px'};
      this.di.$scope.resize_right = {'right':+ (win_width - x) +'px'};
      this.di.$scope.resize_length = {'width':+ (win_width - x) +'px'};

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


    unsubscribers.push(this.di.$rootScope.$on('summary_links_set',(evt, data)=>{

      this.di.$scope.fabricModel.topoSetting.show_links = data;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

      this.di.$rootScope.$emit('show_links');

    }));


    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unsubscribers, (unsubscribe) => {
        unsubscribe();
      });
      // this.di.$log.info('FabricSummaryController', 'Destroyed');
    });


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
      obj.port_status = port.isEnabled === true ?
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
}

FabricSummaryController.$inject = FabricSummaryController.getDI();
FabricSummaryController.$$ngIsClass = true;

