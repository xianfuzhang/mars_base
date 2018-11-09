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
      'dateService',
      'dashboardDataManager',
      'deviceDataManager',
      'modalManager',
      'localStoreService'
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
    const CONTROLLER_STATE_INACTIVE = 'INACTIVE';
    this.SWITCHES_CPU_MEMORY_STATISTIC_NS = 'switches_cpu_memory_statistic_ns';
    let unSubscribers = [];
    let dataModel = {};
    let date = this.di.dateService.getTodayObject();
    let before = this.di.dateService.getBeforeDateObject(20*60*1000);
    this.di.$scope.dashboardModel = {
      'controllerSummary':{},
      'controllerStatistic':{},
      'switchSummary':{
        leafCount:0,
        spineCount:0,
        unknownCount:0,
        unavailableCount:0,
      },
      cpu: {
        'type': null, //minute, hour, day
        'begin_date': new Date(before.year, before.month, before.day),
        'begin_time': new Date(before.year, before.month, before.day, before.hour, before.minute, 0),
        'end_date': new Date(date.year, date.month, date.day),
        'end_time': new Date(date.year, date.month, date.day, date.hour, date.minute, 0),
        'analyzer': []
      },
      memory: {
        'type': null, //minute, hour, day
        'begin_date': new Date(before.year, before.month, before.day),
        'begin_time': new Date(before.year, before.month, before.day, before.hour, before.minute, 0),
        'end_date': new Date(date.year, date.month, date.day),
        'end_time': new Date(date.year, date.month, date.day, date.hour, date.minute, 0),
        'analyzer': []
      },
      timeRange: [
        {label: this.translate('MODULES.DASHBOARD.TIMERANGE.MINUTE'), value: 60},
        {label: this.translate('MODULES.DASHBOARD.TIMERANGE.HOUR'), value: 180},
        {label: this.translate('MODULES.DASHBOARD.TIMERANGE.DAY'), value: 3600},
      ]
    };

    this.di.$scope.panelRefresh = {
      controller : false,
      swt : false,
    };


    this.di.$scope.panelLoading = {
      controller : false,
      swt : false,
    };

    this.di.$scope.rangeConfiguration = (type) => {
      let begin_date, end_date, begin_time, end_time;
      if (type === 'cpu') {
        begin_date = this.di.$scope.dashboardModel.cpu.begin_date;
        end_date = this.di.$scope.dashboardModel.cpu.end_date;
        begin_time = this.di.$scope.dashboardModel.cpu.begin_time;
        end_time = this.di.$scope.dashboardModel.cpu.end_time;
      }
      else {
        begin_date = this.di.$scope.dashboardModel.memory.begin_date;
        end_date = this.di.$scope.dashboardModel.memory.end_date;
        begin_time = this.di.$scope.dashboardModel.memory.begin_time;
        end_time = this.di.$scope.dashboardModel.memory.end_time;
      }
      this.di.modalManager.open({
          template: require('../template/dateRangeConfiguration.html'),
          controller: 'dateRangeConfigurationCtrl',
          windowClass: 'date-rate-modal',
          resolve: {
            dataModel: () => {
              return {
                'begin_date': begin_date,
                'begin_time': begin_time,
                'end_date': end_date,
                'end_time': end_time 
              };
            }
          }
        })
        .result.then((data) => {
        if (data && !data.canceled) {
          //console.log(data);
          if (type === 'cpu') {
            this.di.$scope.dashboardModel.cpu.begin_date = data.data.begin_date;
            this.di.$scope.dashboardModel.cpu.begin_time = data.data.begin_date;
            this.di.$scope.dashboardModel.cpu.end_date = data.data.end_date;
            this.di.$scope.dashboardModel.cpu.end_time = data.data.end_date;

            this.getDevicesCPUAnalyzer(dataModel.devices).then(() => {
              convertSwitchCPUAnalyzer();
            });
          }
          else {
            this.di.$scope.dashboardModel.memory.begin_date = data.data.begin_date;
            this.di.$scope.dashboardModel.memory.begin_time = data.data.begin_date;
            this.di.$scope.dashboardModel.memory.end_date = data.data.end_date;
            this.di.$scope.dashboardModel.memory.end_time = data.data.end_date;

             this.getDevicesMemoryAnalyzer(dataModel.devices).then(() => {
              convertSwitchMemoryAnalyzer();
            });
          }
        }
      });
    };

    this.di.$scope.timeRangeSelect = (type, $value) => {
      let before;
      //20分钟
      if ($value.value === 60) {
        before = this.di.dateService.getBeforeDateObject(20*60*1000);
      }
      //1小时
      else if ($value.value === 180) {
        before = this.di.dateService.getBeforeDateObject(60*60*1000); 
      }
      //1天
      else{
        before = this.di.dateService.getBeforeDateObject(24*60*60*1000); 
      }
      if (type === 'cpu') {
        this.di.$scope.dashboardModel.cpu.type = $value;
        this.di.$scope.dashboardModel.cpu.begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
        this.getDevicesCPUAnalyzer(dataModel.devices).then(() => {
          convertSwitchCPUAnalyzer();
        });
      }
      else {
        this.di.$scope.dashboardModel.memory.type = $value;
        this.di.$scope.dashboardModel.memory.begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
        this.getDevicesMemoryAnalyzer(dataModel.devices).then(() => {
          convertSwitchMemoryAnalyzer();
        });
      }
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

      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        dataModel['devices'] = configs;
        this.getSwitchesCPUMemoryStatisticFromLS(configs).then(() => {
          devicesDefer.resolve();
        });
      });
      promises.push(devicesDefer.promise);

      this.di.deviceDataManager.getDevicePortsStatistics().then((res)=>{
        dataModel['swtStatistics'] = res.data['statistics'];
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
        });
      });
    };
    
    function convertData2View() {
      convertControllerData();
      convertSwitchData();
      convertSwitchInterface2Chart();
      convertSwitchCPUAnalyzer();
      convertSwitchMemoryAnalyzer();
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
      controllerSummary.inactives = [];

      this.di._.forEach(ctrlNodes, (node)=>{
        let node4Add = {};
        node4Add.ip = node.ip;
        node4Add.status = node.status;

        let curTs = new Date().getTime();
        node4Add.lastUpdate = calcRunningDate(curTs - node.lastUpdate);
        controllerSummary.nodes.push(node4Add);

        if (node.status === CONTROLLER_STATE_INACTIVE) {
          controllerSummary.inactives.push(node.ip);
        }
      });

      this.di.$scope.dashboardModel.controllerSummary = controllerSummary;
/*
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
      });*/
    };

    let convertSwitchInterface2Chart =()=>{
      let swtStatistics = dataModel['swtStatistics'];
      let waitOrderPortsStatistics = [];
      this.di._.forEach(swtStatistics, (device)=>{
        let curDeviceId = device.device;

        this.di._.forEach(dataModel['devices'],(deviceM)=>{
          if(deviceM['id'] === curDeviceId){
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
              portSt['packetsRecvSent'] = port['packetsReceived'] + port['packetsSent'];
              portSt['bytesRecvSent'] = port['bytesReceived'] + port['bytesSent'];
              portSt['packetsDrop'] = port['packetsRxDropped'] + port['packetsTxDropped'];
              waitOrderPortsStatistics.push(portSt)
            });
          }
        });
      });

      let p_r_s = 'packetsRecvSent';
      let packagesOrder = this.di._.orderBy(waitOrderPortsStatistics, p_r_s, 'desc');
      packagesOrder.splice(5, packagesOrder.length-5);
      chartSwtInterface(packagesOrder, 'swtInterfaceRxTxPackages', 'packages');

      let b_r_s = 'bytesRecvSent';
      let bytesOrder = this.di._.orderBy(waitOrderPortsStatistics, b_r_s, 'desc');
      bytesOrder.splice(5, bytesOrder.length-5);
      chartSwtInterface(bytesOrder, 'swtInterfaceRxTxBytes', 'bytes');


      let p_d = 'packetsDrop';
      let packagesDropOrder = this.di._.orderBy(waitOrderPortsStatistics, p_d, 'desc');
      packagesDropOrder.splice(5, packagesDropOrder.length-5);
      chartSwtInterface(packagesDropOrder, 'swtInterfaceRxTxDrops', 'packages', true);
    };

    let convertSwitchCPUAnalyzer = () => {
      //cpu analyzer
      let cpuCols = [];
      let records = this.getDevicesCPUChartData(this.di.$scope.dashboardModel.cpu.analyzer);
      let x_axis = this.di.$scope.dashboardModel.cpu.analyzer.length > 0 ?
        this.getDeviceCPUMemoryTimeSeries(this.di.$scope.dashboardModel.cpu.analyzer[0]) : ['x'];
      if(records.length) {
        cpuCols.push(x_axis);
        records.forEach((item, index) =>{
          //只取top5
          if (index < 5) {
            let arr = [];
            arr.push(item.name);
            arr = arr.concat(item.data);
            cpuCols.push(arr);  
          }
        });
      }
      else {
        cpuCols.push(x_axis);
      }
      let cpuChart = this.di.c3.generate({
        bindto: '#deviceCpuAnalyzer',
        data: {
          x: 'x',
          columns: cpuCols,
          xFormat: '%Y-%m-%dT%H:%M:%S.%LZ'
        },
        color: {
          pattern: ['#0077cb', '#c78500', '#009f0e', '#008e7f', '#34314c']
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: (d) => {
                return this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
              }
            }
          },
          y: {
            tick: {
              format: function (d) { return d + '%'; }
            }
          }
        },
        tooltip: {
          format: {
            title: (d) => {
              return this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()) + ' ' 
                + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
            }
          }
        }
      });
    };

    let convertSwitchMemoryAnalyzer = () => {
      //memory analyzer
      let memoryCols = [];
      let records = this.getDevicesMemoryChartData(this.di.$scope.dashboardModel.memory.analyzer);
      let x_axis = this.di.$scope.dashboardModel.memory.analyzer.length > 0 ? 
          this.getDeviceCPUMemoryTimeSeries(this.di.$scope.dashboardModel.memory.analyzer[0]) : ['x'];
      if(records.length) {
        memoryCols.push(x_axis);
        records.forEach((item, index) =>{
          //只取top5
          if (index < 5) {
            let arr = [];
            arr.push(item.name);
            arr = arr.concat(item.data);
            memoryCols.push(arr);  
          }
        });
      }
      else {
        memoryCols.push(x_axis);
      }
      let memoryChart = this.di.c3.generate({
        bindto: '#deviceMemoryAnalyzer',
        data: {
          x: 'x',
          columns: memoryCols,
          xFormat: '%Y-%m-%dT%H:%M:%S.%LZ'
        },
        color: {
          pattern: ['#0077cb', '#c78500', '#009f0e', '#008e7f', '#34314c']
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: (d) => {
                return this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
              }
            }
          },
          y: {
            tick: {
              format: function (d) { return d + '%'; }
            }
          }
        },
        tooltip: {
          format: {
            title: (d) => {
              return this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()) + ' ' 
                + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
            }
          }
        }
      });
    };

    let chartSwtInterface = (top5, bindTo, y_label, drop) =>{
      let category= [], rxs = [], pkgRecv = ['接收'], pgkSend = ['发送'];
      this.di._.forEach(top5, (statistic)=>{
        let name = getSwtAndPortName(statistic['device'], statistic['port']);
        category.push(name);
        if (y_label === 'packages') {
          if (drop) {
            pkgRecv.push(statistic['packetsRxDropped']);
            pgkSend.push(statistic['packetsTxDropped']);
          }
          else {
            pkgRecv.push(statistic['packetsReceived']);
            pgkSend.push(statistic['packetsSent']);    
          }
        }
        else {
          pkgRecv.push(statistic['bytesReceived']);
          pgkSend.push(statistic['bytesSent']);  
        }
             
      });
      rxs.push(pkgRecv);
      rxs.push(pgkSend);
      
      let chart = this.di.c3.generate({
        bindto: '#' + bindTo,
        data: {
          columns: rxs,
          type: 'bar',
         groups: [['接收', '发送']]
        },
        color: {
          pattern: ['#0077cb', '#c78500']
        },
        axis: {
          x: {
            type: 'category',
            height: 40,
            categories: category
          },
          y:{
            label: y_label
          }
        },
        tooltip: {
          format: {
            title: (index) => { 
              let d = category[index].indexOf('(');
              let str;
              if (d !== -1) {
                str = category[index].substring(0, d);
              }
              else {
                str = category[index]; 
              }
              return str;
            }
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
      return port && port['annotations']['portName'] || '';
    };

    setTimeout(function () {init()});

    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }

  getSwitchesCPUMemoryStatisticFromLS(switches) {
    //10分钟以内不重复获取
    let defer = this.di.$q.defer();
    this.di.localStoreService.getStorage(this.SWITCHES_CPU_MEMORY_STATISTIC_NS).get('timestamp')
      .then((data) => {
        if (data) {
          let time = (Date.now() - data) - 10*60*1000;
          //超时，重新获取数据
          if (time >= 0) {
            this.di.localStoreService.getStorage(this.SWITCHES_CPU_MEMORY_STATISTIC_NS).del('timestamp')
              .then(() => {
                let defers = [];
                defers.push(this.getDevicesCPUAnalyzer(switches));
                defers.push(this.getDevicesMemoryAnalyzer(switches));
                this.di.$q.all(defers).then(() => {
                  this.di.localStoreService.getStorage(this.SWITCHES_CPU_MEMORY_STATISTIC_NS)
                    .set('timestamp', Date.now());
                  this.di.localStoreService.getStorage(this.SWITCHES_CPU_MEMORY_STATISTIC_NS)
                    .set('cpu_memory', {
                      'cpu': this.di.$scope.dashboardModel.cpu.analyzer,
                      'memory': this.di.$scope.dashboardModel.memory.analyzer
                    });
                  defer.resolve();
                });
              });
          }
          else {
            this.di.localStoreService.getStorage(this.SWITCHES_CPU_MEMORY_STATISTIC_NS).get('cpu_memory')
              .then((data) => {
                this.di.$scope.dashboardModel.cpu.analyzer = data.cpu;
                this.di.$scope.dashboardModel.memory.analyzer = data.memory;
                defer.resolve();
              });
          }
        }
        else {
          let defers = [];
          defers.push(this.getDevicesCPUAnalyzer(switches));
          defers.push(this.getDevicesMemoryAnalyzer(switches));
          this.di.$q.all(defers).then(() => {
            this.di.localStoreService.getStorage(this.SWITCHES_CPU_MEMORY_STATISTIC_NS)
              .set('timestamp', Date.now());
            this.di.localStoreService.getStorage(this.SWITCHES_CPU_MEMORY_STATISTIC_NS)
              .set('cpu_memory', {
                'cpu': this.di.$scope.dashboardModel.cpu.analyzer,
                'memory': this.di.$scope.dashboardModel.memory.analyzer
              });
            defer.resolve();
          });
        }
      });
    
    return defer.promise;
  }

  getDevicesCPUAnalyzer(devices) {
    let deffe = this.di.$q.defer();
    if (!devices.length){
      deffe.resolve([]);
      return deffe.promise;
    } 

    let startTime = this.getISODate(this.di.$scope.dashboardModel.cpu.begin_time);
    let endTime = this.getISODate(this.di.$scope.dashboardModel.cpu.end_time);
    let solution_second = this.di.$scope.dashboardModel.cpu.type.value;//3600;//this.getResolutionSecond(startTime, endTime);
    let deferredArr = [];

    devices.forEach((device) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.getDeviceCPUAnalyzer(device.name, startTime, endTime, solution_second)
        .then((data) => {
          defer.resolve({'id': device.id, 'name': device.name, 'analyzer': data});
        });
      deferredArr.push(defer.promise);  
    });

    this.di.$q.all(deferredArr).then((arr) => {
      this.di.$scope.dashboardModel.cpu.analyzer = arr;
      deffe.resolve();
    });
    return deffe.promise;
  }

  getDevicesMemoryAnalyzer(devices) {
    let deffe = this.di.$q.defer();
    if (!devices.length){
      deffe.resolve([]);
      return deffe.promise;
    }

    let startTime = this.getISODate(this.di.$scope.dashboardModel.memory.begin_time);
    let endTime = this.getISODate(this.di.$scope.dashboardModel.memory.end_time);
    let solution_second = this.di.$scope.dashboardModel.memory.type.value;//3600;//this.getResolutionSecond(startTime, endTime);
    let deferredArr = [];

    devices.forEach((device) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.getDeviceMemoryAnalyzer(device.name, startTime, endTime, solution_second)
        .then((data) => {
          defer.resolve({'id': device.id, 'name': device.name, 'analyzer': data});
        });
      deferredArr.push(defer.promise);  
    });

    this.di.$q.all(deferredArr).then((arr) => {
      this.di.$scope.dashboardModel.memory.analyzer = arr;
      deffe.resolve();
    });
    return deffe.promise;
  }

  getResolutionSecond(startTime, endTime) {
    let second;
    let interval = parseInt((Date.parse(endTime) - Date.parse(startTime))/1000);
    if (interval >= 0 && interval <= 3600) {
      second = 300; //一小时以内5分钟统计一次平均值
    }
    else if (interval > 3600 && interval <= 86400) {
      second = 7200; //一天以内2小时统计一次平均值
    }
    else if (interval > 86400 ** interval <= 604800) {
      second = 50400; //一周以内14小时统计一次平均值
    }
    else {
      second = 86400; //超过1周24小时统计一次平均值
    }
    return second;
  }

  getDevicesCPUChartData(analyzers) {
    let devices = [];
    analyzers.forEach((device, index) => {
      if (device.name) {
        let data = [], deviceObj = {};
        device.analyzer.forEach((record) =>{
          let utilize = record.system_percent + record.user_percent;//.toFixed(1)
          data.push(utilize);
        });
        deviceObj['name'] = device.name;
        deviceObj['avarage'] = data.length > 0 ? (this.di._.sum(data)/data.length) : 0;
        deviceObj['data'] = data.map(item => item.toFixed(2));
        devices.push(deviceObj);  
      }
    });
    devices = this.di._.orderBy(devices, 'avarage', 'desc');
    return devices;
  }

  getDevicesMemoryChartData(analyzers) {
    let devices = [];
    analyzers.forEach((device) => {
      if (device.name) {
        let data = [], deviceObj = {};
        device.analyzer.forEach((record) =>{
          let utilize = record.used_percent;
          data.push(utilize);
        });
        deviceObj['name'] = device.name;
        deviceObj['avarage'] = data.length > 0 ? (this.di._.sum(data)/data.length) : 0;
        deviceObj['data'] = data.map(item => item.toFixed(2));
        devices.push(deviceObj);
      }
    });
    devices = this.di._.orderBy(devices, 'avarage', 'desc');
    return devices;
  }

  getDeviceCPUMemoryTimeSeries(device) {
    let timeseries = ['x'];
    device.analyzer.forEach((record) => {
      timeseries.push(record.timepoint);
    });
    return timeseries;
  }

  getISODate(date) {
    return date.getUTCFullYear() +
      '-' + this.pad( date.getUTCMonth() + 1 ) +
      '-' + this.pad( date.getUTCDate() ) +
      'T' + this.pad( date.getUTCHours() ) +
      ':' + this.pad( date.getUTCMinutes() ) +
      'Z';
  }

  pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

