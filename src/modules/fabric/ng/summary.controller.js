/**
 * Created by wls on 2018/7/17.
 */


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
      'deviceService'
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

    this.resizeTimeout = null;
    this.di.$scope.resize_right_plus = {};
    this.di.$scope.resize_right = {};
    this.di.$scope.resize_length = {};

    let  distributeSwitches = (allSwitches) => {
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
    let dstSwt = distributeSwitches(this.di.deviceService.getAllSwitches());

    this.di.$scope.fabricModel = {
      headers:this.di.appService.CONST.HEADER,
      deSpines:dstSwt.spine,
      deLeafs:dstSwt.leaf,
      deOthers:dstSwt.other,
      deLinks: this.di.deviceService.getAllLinks()
    };



    // let deferred = this.di.$q.defer();
    // this.di.$http.get('http://192.168.122.45:9200/alert_types/_search').then(
    //   (response) => {
    //     console.log('success to get es data');
    //     console.log(response)
    //   },
    //   () => {
    //     console.log('failed to get es data');
    //   }
    // );

    this.di.localStoreService.getStorage(fabric_storage_ns).get('topo_set').then((data)=>{
      if(data === undefined){
        this.di.$scope.fabricModel.topoSetting = {
          "show_links": false,
          "show_tooltips":false,
          "show_ports":false,
        }
      } else {
        this.di.$scope.fabricModel.topoSetting = data
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
      console.log(event);
      event.preventDefault();
      // console.log(self);
      this.di.$document.on("mouseup", mouseup);
      this.di.$document.on("mousemove", mousemove);
    };

    let mouseup = (event) =>{
      console.log('mouseup');
      this.di.$document.off('mousemove', mousemove);
      this.di.$document.off('mouseup', mouseup);
    };

    let mousemove = (event) => {
      var x = event.pageX;
      let win_width = this.di.$window.innerWidth;
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

    let showSwitch = (id, type, summaryList) => {
      showDetail(summaryList);
      // showPorts();
      // showStatics();
      // showFlows();
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


    this.di.$scope.fabricModel.interfaceProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        let d = this.di.deviceService.getInterfaceByDevice();
        let entities = this.getEntities(d.ports);
        defer.resolve({
          data: entities,
          count: 10
        });
        // this.di.deviceDataManager.getPorts(params).then((res) => {
        //   let entities = this.getEntities(res.data.ports);
        //   defer.resolve({
        //     data: entities,
        //     count: res.data.total
        //   },()=>{
        //
        //   });
        //
        // });
        return defer.promise;
      },
      getSchema: () => {
        return {
          // schema: this.di.deviceService.getPortTableSchema(),
          schema: [
            /*{
             'label': 'ID',
             'field': 'id',
             'layout': {'visible': true, 'sortable': false, 'fixed': true}
             },*/
            {
              'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.NAME'),
              'field': 'port_name',
              'layout': {'visible': true, 'sortable': true, 'fixed': true}
            },
            {
              'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.PORT_ID'),
              'field': 'port_id',
              'layout': {'visible': true, 'sortable': true}
            },
            {
              'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.STATUS'),
              'field': 'port_status',
              'layout': {'visible': true, 'sortable': true}
            },
            {
              'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.LINK_STATUS'),
              'field': 'link_status',
              'layout': {'visible': true, 'sortable': true}
            },
            {
              'label': this.translate('MODULES.SWITCHES.PORT.COLUMN.SPEED'),
              'field': 'speed',
              'layout': {'visible': true, 'sortable': true}
            }
          ],
          index_name: 'port_mac',
          rowCheckboxSupport: false,
          rowActionsSupport: true
        };
      }
    });


    unsubscribers.push(this.di.$rootScope.$on('switch_select',(evt, data)=>{
      showSwitch(data.id, data.type,data.value);
    }));

    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unsubscribers, (unsubscribe) => {
        unsubscribe();
      });
      this.di.$log.info('FabricSummaryController', 'Destroyed');
    });

  }

  getEntities(origins){
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    origins.forEach((port) => {
      let obj = {};
      obj.element = port.element;
      obj.port_name = port.annotations.portName;
      obj.port_mac = port.annotations.portMac;
      obj.port_id = port.port;
      obj.link_status = port.annotations.linkStatus;
      obj.type = port.type;
      obj.speed = port.portSpeed;
      obj.device_name = port.device_name;
      obj.isEnabled = port.isEnabled;
      obj.port_status ='1';
      entities.push(obj);
    });
    return entities;
  }
}

FabricSummaryController.$inject = FabricSummaryController.getDI();
FabricSummaryController.$$ngIsClass = true;

