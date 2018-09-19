// import {MDCRipple} from '@material/ripple';
export class DashboardController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$window',
      '_',
      '$filter',
      '$http',
      '$q',
      'appService',
      'c3',
      'dashboardDataManager',
      'deviceDataManager',
      'modalManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    DashboardController.getDI().forEach((value, index) => {
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
    this.interval_device = null;
    let unSubscribers = [];
    let dataModel = {};
    this.di.$scope.dashboardModel = {
      'controllerSummary':{},
      'controllerStatistic':{},
      'switchSummary':{
        leafCount:0,
        spineCount:0,
        unknownCount:0,
        unavailableCount:0,
      }

    };

    this.di.$scope.panelRefresh = {
      controller : false,
      swt : false,
    };


    this.di.$scope.panelLoading = {
      controller : false,
      swt : false,
    };

    let di = this.di;

    let init =() =>{
      let promises = [];
      let clusterDefer = this.di.$q.defer(),
        devicesDefer = this.di.$q.defer(),
        portsDefer = this.di.$q.defer(),
        clusterStaticsDefer = this.di.$q.defer(),
        swtStaticsDefer = this.di.$q.defer();



      this.di.dashboardDataManager.getCluster().then((res)=>{
        dataModel['cluster'] = res;

        clusterDefer.resolve();
      });

      promises.push(clusterDefer.promise);

      this.di.dashboardDataManager.getClusterStatistic().then((res)=>{
        dataModel['clusterStatistic'] = res;

        clusterStaticsDefer.resolve();
      });
      promises.push(clusterStaticsDefer.promise);

      // this.di.deviceDataManager.getDevices().then((res)=>{
      //   dataModel['devices'] = res.data.devices;
      //   devicesDefer.resolve();
      // });
      // promises.push(devicesDefer.promise);


      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        dataModel['devices'] = configs;
        devicesDefer.resolve();
      });
      promises.push(devicesDefer.promise);

      this.di.deviceDataManager.getDevicePortsStatistics().then((res)=>{
        dataModel['swtStatistics'] = res.data;
        swtStaticsDefer.resolve();
      });
      promises.push(swtStaticsDefer.promise);

      this.di.deviceDataManager.getPorts().then((res)=>{
        dataModel['ports'] = res.data.ports;
        portsDefer.resolve();
      });

      promises.push(portsDefer.promise);


      this.di.$rootScope.$emit('start_loading');
      this.di.$scope.panelLoading.controller = true;
      this.di.$scope.panelLoading.switch = false;

      Promise.all(promises).then(()=>{

        let DI = this.di;
        setTimeout(function () {
          convertData2View();
          DI.$scope.$apply();
          DI.$rootScope.$emit('stop_loading');
          DI.$scope.panelRefresh.controller = true;
          DI.$scope.panelLoading.controller = false;
          DI.$scope.$apply();

        },2000)
      });
    };
    
    function convertData2View() {
      convertControllerData();
      convertSwitchData();
      convertSwitchInterface2Chart();
      // convertSwitchInterfaceTx();
    }



    let convertControllerData =()=>{
      //1. summary
      let controllerSummary = {};
      let ctrlNodes = dataModel['cluster'];
      controllerSummary.count = ctrlNodes.length;
      if(ctrlNodes.length === 1) {
        controllerSummary.mode = this.translate('MODULES.DASHBOARD.CONTROLLER.MODE.SINGLETON');
      } else {
        controllerSummary.mode = this.translate('MODULES.DASHBOARD.CONTROLLER.MODE.HA');
      }

      controllerSummary.nodes = [];

      this.di._.forEach(ctrlNodes, (node)=>{
        let node4Add = {};
        node4Add.ip = node.ip;
        node4Add.status = node.status;

        let curTs = new Date().getTime();
        node4Add.lastUpdate = calcRunningDate(curTs - node.lastUpdate);
        controllerSummary.nodes.push(node4Add);
      });

      this.di.$scope.dashboardModel.controllerSummary = controllerSummary;

      //2. statistic
      let cpuUsage = ['cpu'];
      let memUsage = ['memory'];
      let category = [];
      this.di._.forEach(dataModel['clusterStatistic'], (statistic)=>{
        let cpu_info = statistic['cpu_info'];
        cpuUsage.push( 100 - cpu_info.idle);

        let mem_info = statistic['memory_info'];
        memUsage.push(100* mem_info.free_percent);

        category.push(statistic['ip']);
      });


      var chart = this.di.c3.generate({
        bindto: '#controllerChart',
        data: {
          columns: [
            cpuUsage, memUsage
          ],
          type: 'bar'
        },
        bar: {
          width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
          }
        },
        tooltip: {
          format: {
            title: function (d) { return 'Controller ' + d; },
            value: function (value, ratio, id) {
              // var format = id === 'data1' ? d3.format(',') : d3.format('$');
              // return format(value);
              return Math.round(value*100)/100 + '%';
            }
          },
          contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
            return genControllerToolTip(d, category);
          },
          grouped:false
        },
        axis: {
          x: {
            type: 'category',
            categories: category
          },
          y:{
            tick: {
              values: [0, 10, 20,30,40,50,60,70,80,90,100]
            },
            label: "使用率"
          }
        }
      });
    };

    let convertSwitchInterface2Chart =()=>{
      let swtStatistics = dataModel['swtStatistics'];
      let waitOrderPortsStatistics = [];
      this.di._.forEach(swtStatistics, (device)=>{
        let curDeviceId = device.device;
        this.di._.forEach(device.ports, (port)=>{
          let portSt = {};
          portSt['device'] = curDeviceId;
          portSt['port'] = port['port'];
          portSt['packetsReceived'] = port['packetsReceived'];
          portSt['packetsSent'] = port['packetsSent'];
          portSt['bytesReceived'] = port['bytesReceived'];
          portSt['bytesSent'] = port['bytesSent'];
          portSt['packetsRxDropped'] = port['packetsRxDropped'];
          portSt['packetsTxDropped'] = port['packetsTxDropped'];
          portSt['durationSec'] = port['durationSec'];
          waitOrderPortsStatistics.push(portSt)
        });
      });


      let rx_p_str = 'packetsReceived';
      let rxPackagesOrder = this.di._.orderBy(waitOrderPortsStatistics, rx_p_str, 'desc');
      rxPackagesOrder.splice(5, rxPackagesOrder.length-5);
      // chartingSwtInterfaceTop5Rx(rxTop5);
      chartSwtInterface(rxPackagesOrder, 'swtInterfaceRxPackage', rx_p_str, 'Rx Packages','packages');

      let tx_p_str = 'packetsSent';
      let txPackagesOrder = this.di._.orderBy(waitOrderPortsStatistics, tx_p_str, 'desc');
      txPackagesOrder.splice(5, txPackagesOrder.length-5);
      chartSwtInterface(txPackagesOrder, 'swtInterfaceTxPackage', tx_p_str, 'Tx Packages','packages');


      let rx_b_str = 'bytesReceived';
      let rxBytesOrder = this.di._.orderBy(waitOrderPortsStatistics, rx_b_str, 'desc');
      rxBytesOrder.splice(5, rxBytesOrder.length-5);
      chartSwtInterface(rxBytesOrder, 'swtInterfaceRxByte', rx_b_str, 'Rx Bytes','bytes');

      let tx_b_str = 'bytesSent';
      let txBytesOrder = this.di._.orderBy(waitOrderPortsStatistics, tx_b_str, 'desc');
      txBytesOrder.splice(5, txBytesOrder.length- 5);
      chartSwtInterface(txBytesOrder, 'swtInterfaceTxByte', tx_b_str, 'Tx Bytes','bytes');
    };

   /* let chartingSwtInterfaceTop5Rx = (top5)=> {
      // getSwtAndPortName
    
      let category= [];
      let rxs = ['RX Packages'];
      this.di._.forEach(top5, (statistic)=>{
        category.push(getSwtAndPortName(statistic['device'], statistic['port']));
        rxs.push(statistic['packetsReceived']);
        // console.log(getSwtAndPortName(statistic['device'], statistic['port']) + ': ' + statistic['packetsReceived']);
      });
    
      let chart = this.di.c3.generate({
        bindto: '#swtInterfaceRx',
        data: {
          columns: [
            rxs
          ],
          type: 'bar'
        },
        bar: {
          width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
          }
        },
        tooltip: {
          format: {
            title: function (d) { return category[d]; },
            value: function (value, ratio, id) {
              return value + ' packages';
            }
          },
          grouped:false
        },
        axis: {
          x: {
            type: 'category',
            categories: category
          },
          y:{
            label: "packets"
          }
        }
      });
    };
    
    let chartingSwtInterfaceTop5Rx = (top5)=> {
      // getSwtAndPortName
    
      let category= [];
      let rxs = ['TX Packages'];
      this.di._.forEach(top5, (statistic)=>{
        category.push(getSwtAndPortName(statistic['device'], statistic['port']));
        rxs.push(statistic['packetsReceived']);
      });
    
      let chart = this.di.c3.generate({
        bindto: '#swtInterfaceTx',
        data: {
          columns: [
            rxs
          ],
          type: 'bar'
        },
        bar: {
          width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
          }
        },
        tooltip: {
          format: {
            title: function (d) { return category[d]; },
            value: function (value, ratio, id) {
              return value;
            }
          },
          grouped:false
        },
        axis: {
          x: {
            type: 'category',
            categories: category
          },
          y:{
            label: "packets"
          }
        }
      });
    };*/

    let chartSwtInterface = (top5, bindTo, orderType, TypeStr,y_label) =>{
      let category= [];
      let rxs = [TypeStr];
      this.di._.forEach(top5, (statistic)=>{
        category.push(getSwtAndPortName(statistic['device'], statistic['port']));
        rxs.push(statistic[orderType]);
      });

      let chart = this.di.c3.generate({
        bindto: '#' + bindTo,
        data: {
          columns: [
            rxs
          ],
          type: 'bar'
        },
        bar: {
          width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
          }
        },
        tooltip: {
          format: {
            title: function (d) { return category[d]; },
            value: function (value, ratio, id) {
              return value;
            }
          },
          grouped:false
        },
        axis: {
          x: {
            type: 'category',
            categories: category
          },
          y:{
            label: y_label
          }
        }
      });
    }

    let genControllerToolTip = (d, category)=>{
      // let tableStart = "<table style='max-width:350px' class='table_content'>";
      // let tableEnd = "</table>";
      // let trStart = "<tr>";
      // let trEnd = "</tr>";
      // let tdStart = "<td>";
      // let tdEnd = "</td>";
      //
      // let tbs = tableStart;
      // tbs = tbs + trStart + tdStart + '控制器' + tdEnd + tdStart + category[d[0].index] + tdEnd + trEnd;

      let tbs = "";
      this.di._.forEach(d, (item)=>{
        if(tbs !== ""){
          tbs += "<br>"
        }
        tbs = tbs + item.name + ":  " + Math.round(item.value * 100)/100 + "%";
        // tbs = tbs + trStart + tdStart + item.name + tdEnd + tdStart + Math.round(item.value * 100)/100 + "%"+ tdEnd + trEnd
      });

      // tbs += tableEnd;

      return "<div style='background-color: white;color:black;border:1px gray solid;border-radius: 4px;padding:6px;box-shadow: 5px 5px 5px #dddddd;'>"+ tbs+ "</div>";
    };

    let convertSwitchData =()=>{
      let leafSwt = this.di._.filter(dataModel['devices'], { 'type': 'leaf'});
      let spineSwt = this.di._.filter(dataModel['devices'], { 'type': 'spine'});
      let unknownSwt = this.di._.filter(dataModel['devices'], { 'type': 'unknown'});
      let unavailableSwt = this.di._.filter(dataModel['devices'], { 'available': false});
      this.di.$scope.dashboardModel.switchSummary.leafCount = leafSwt.length;
      this.di.$scope.dashboardModel.switchSummary.spineCount = spineSwt.length;
      this.di.$scope.dashboardModel.switchSummary.unknownCount = unknownSwt.length;
      this.di.$scope.dashboardModel.switchSummary.unavailableCount = unavailableSwt.length;
    };
    
    let calcRunningDate = (ts)=> {

      // 1000 * 60 * 60 * 24
      let dayCount = Math.floor(ts/(1000 * 60 * 60 * 24));
      let hourCount = Math.floor(ts%(1000 * 60 * 60 * 24)/(1000 * 60 * 60));
      let dayStr = '';
      let hourStr = '';
      if(dayCount === 1){
        dayStr =  dayCount + this.translate('MODULES.DASHBOARD.DAY');
      } else if(dayCount > 1){
        dayStr =  dayCount + this.translate('MODULES.DASHBOARD.DAYS');
      }

      if(hourCount === 1){
        hourStr =  hourCount + this.translate('MODULES.DASHBOARD.HOUR');
      } else if(hourCount > 1){
        hourStr =  hourCount + this.translate('MODULES.DASHBOARD.HOURS');
      }

      if(hourCount === 0 && hourCount === 0){
        let seconds = Math.floor(ts%(1000 * 60 * 60 * 24)/1000);
        return seconds + this.translate('MODULES.DASHBOARD.SECONDS');
      }
      return dayStr + hourStr;
    };

    let getSwtAndPortName = (deviceId, portNo) =>{
      return getPortName(deviceId, portNo) + '(' +  getSwtName(deviceId) +')';
    };

    let getSwtName = (deviceid) =>{
      let device = this.di._.find(dataModel['devices'], { 'id': deviceid});
      return device['name'];
    };

    let getPortName = (deviceid, portNo) =>{
      let port = this.di._.find(dataModel['ports'], { 'element': deviceid, 'port': String(portNo)});
      // if(port)
      return port['annotations']['portName'];
    };


    let getAllDeviceStatistics = () =>{

    };


    setTimeout(function () {init()});

    // let init = () => {
    //
    //   this.interval_device = setInterval(exec, 15000);
    // };

    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });

      // clearInterval(this.interval_device);

    });
  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

