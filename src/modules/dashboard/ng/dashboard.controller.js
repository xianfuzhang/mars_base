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
      '$interval',
      'appService',
      'c3',
      'moment',
      'chartService',
      'dateService',
      'deviceService',
      'dashboardDataManager',
      'deviceDataManager',
      'modalManager',
      'applicationService',
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

    const DI = this.di;
    const moment = this.di.moment;
    const chartService = this.di.chartService;
    const chartStyles = chartService.styles;
    let scope = this.di.$scope;
    const getFormattedNumber = this.getFormattedNumber;
    const getFormatedDateTime = this.getFormatedDateTime;
    let deviceCpuInterval;

    this.translate = this.di.$filter('translate');
    scope.REALTIME_DATA = this.translate('MODULES.DASHBOARD.REALTIME_DATA');
    scope.HISTORY_DATA = this.translate('MODULES.DASHBOARD.HISTORY_DATA');
    this.interval_device = null;
    const CONTROLLER_STATE_INACTIVE = 'INACTIVE';
    this.SWITCHES_CPU_MEMORY_STATISTIC_NS = 'switches_cpu_memory_statistic_ns';
    this.CLUSTERS_CPU_MEMORY_STATISTIC_NS = 'clusters_cpu_memory_statistic_ns';
    let unSubscribers = [];
    let dataModel = {
      selectedClusterCpu: [],
      selectedClusterMemory: [],
      selectedSwitchCpu: [],
      selectedSwitchMemory: [],
    };
    scope.interfaceTypes = [{
      label: 'Packets_TX',
      value: 'packets_tx'
    },{
      label: 'Packets_RX',
      value: 'packets_rx'
    },{
      label: 'Bytes_TX',
      value: 'bytes_tx'
    },{
      label: 'Bytes_RX',
      value: 'bytes_rx'
    }];

    let date = this.di.dateService.getTodayObject();
    let before = this.di.dateService.getBeforeDateObject(30*60*1000); // 前30分钟
    let one_minute_before = this.di.dateService.getBeforeDateObject(60 * 1000); // 前1分钟
    const GRID_NUM = 20; // chart grid number
    const REALTIME_GRID_NUM = 20; // realtime chart grid number
    const SET_INTERVAL_TIME = 15; // realtime chart update interval time 15s
    let begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
    let one_minute_before_time = new Date(one_minute_before.year, one_minute_before.month, one_minute_before.day, one_minute_before.hour, one_minute_before.minute, 0);
    let end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, 0);
    this.di.$scope.dashboardModel = {
      'controllerSummary': {},
      'controllerStatistic': {},
      'switchSummary': {
          leafCount: 0,
          spineCount: 0,
          unknownCount: 0,
          unavailableCount: 0,
      },
      cpu: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        selectedData: [],
        loading: true,
        isRealtime: false,
        intervalFlag: null
      },
      memory: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        selectedData: [],
        loading: true,
        isRealtime: false,
        intervalFlag: null
      },
      disk: {
        'begin_time': one_minute_before_time,
        'end_time': end_time,
        'step': 60,
        'origin_begin_time': one_minute_before_time,
        'origin_end_time': end_time,
        'analyzer': [],
        selectedData: [],
        loading: true,
        isRealtime: false,
        intervalFlag: null
      },
      interface: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        selectedData: [],
        loading: true,
        isRealtime: false,
        intervalFlag: null,
        typeOption: scope.interfaceTypes[0],
      },
      dropErrorInterface: {
        'begin_time': begin_time,
        'end_time': end_time,
        'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
        'origin_begin_time': begin_time,
        'origin_end_time': end_time,
        'analyzer': [],
        selectedData: [],
        loading: true,
        isRealtime: false,
        intervalFlag: null,
        typeOption: scope.interfaceTypes[0],
      },
      controller: {
        cpu: {
          'begin_time': begin_time,
          'end_time': end_time,
          'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
          'origin_begin_time': begin_time,
          'origin_end_time': end_time,
          'analyzer': [],
          selectedData: [],
          loading: true,
          isRealtime: false,
          intervalFlag: null,
        },
        memory: {
          'begin_time': begin_time,
          'end_time': end_time,
          'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
          'origin_begin_time': begin_time,
          'origin_end_time': end_time,
          'analyzer': [],
          selectedData: [],
          loading: true,
          isRealtime: false,
          intervalFlag: null,
        },
        interface: {
          'begin_time': begin_time,
          'end_time': end_time,
          'step': (end_time.getTime() - begin_time.getTime()) / (GRID_NUM * 1000),
          'origin_begin_time': begin_time,
          'origin_end_time': end_time,
          'analyzer': [],
          selectedData: [],
          loading: true,
          isRealtime: false,
          unitTypeOption: {label: 'Packets_TX', value: 'packets_tx'},
          stateTypeOption: {label: 'Normal',value: 'normal'}
        }
      },
      clusterCpuPieChart: {},
      clusterMemoryPieChart: {},
      switchMemoryPieChart: {},
      switchCpuPieChart: {},
    };
    
    this.di.$scope.clusterCpuChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
    }
    this.di.$scope.clusterMemoryChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
    }
    this.di.$scope.clusterInterfaceChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
    }
    this.di.$scope.switchCpuChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {}
    }
    this.di.$scope.switchMemoryChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
    }
    this.di.$scope.switchDiskChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {},
    }
    this.di.$scope.clusterCpuPieChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: []
    }
    this.di.$scope.clusterMemoryPieChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: [],
    }
    this.di.$scope.clusterInterfaceBarChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: [],
    }
    this.di.$scope.switchCpuPieChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: [],
    }
    this.di.$scope.switchMemoryPieChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: [],
    }
    this.di.$scope.switchDiskPieChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: [],
    }
    this.di.$scope.switchInterfaceRxTxChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: []
    }
    this.di.$scope.switchInterfaceDropErrorChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: []
    }

    this.di.$scope.panelRefresh = {
      controller : false,
      swt : false,
    };
  
    this.di.$scope.panelLoading = {
      controller : false,
      swt : false,
    };

    this.di.$scope.resetTimeScale = (type) => {
      if (type === 'device-cpu') {
        this.di.$scope.dashboardModel.cpu.begin_time = scope.dashboardModel.cpu.origin_begin_time;
        this.di.$scope.dashboardModel.cpu.end_time = scope.dashboardModel.cpu.origin_end_time;
        this.di.$scope.dashboardModel.cpu.step = Math.floor((scope.dashboardModel.cpu.origin_end_time.getTime() - scope.dashboardModel.cpu.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'device-memory') {
        this.di.$scope.dashboardModel.memory.begin_time = scope.dashboardModel.memory.origin_begin_time;
        this.di.$scope.dashboardModel.memory.end_time = scope.dashboardModel.memory.origin_end_time;
        this.di.$scope.dashboardModel.memory.step = Math.floor((scope.dashboardModel.memory.origin_end_time.getTime() - scope.dashboardModel.memory.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'device-interface') {
        this.di.$scope.dashboardModel.interface.begin_time = scope.dashboardModel.interface.origin_begin_time;
        this.di.$scope.dashboardModel.interface.end_time = scope.dashboardModel.interface.origin_end_time;
        this.di.$scope.dashboardModel.interface.step = Math.floor((scope.dashboardModel.interface.origin_end_time.getTime() - scope.dashboardModel.interface.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'device-interface-drop-error') {
        this.di.$scope.dashboardModel.dropErrorInterface.begin_time = scope.dashboardModel.dropErrorInterface.origin_begin_time;
        this.di.$scope.dashboardModel.dropErrorInterface.end_time = scope.dashboardModel.dropErrorInterface.origin_end_time;
        this.di.$scope.dashboardModel.dropErrorInterface.step = Math.floor((scope.dashboardModel.dropErrorInterface.origin_end_time.getTime() - scope.dashboardModel.dropErrorInterface.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'controller-cpu') {
        this.di.$scope.dashboardModel.controller.cpu.begin_time = scope.dashboardModel.controller.cpu.origin_begin_time;
        this.di.$scope.dashboardModel.controller.cpu.end_time = scope.dashboardModel.controller.cpu.origin_end_time;
        this.di.$scope.dashboardModel.controller.cpu.step = Math.floor((scope.dashboardModel.controller.cpu.origin_end_time.getTime() - scope.dashboardModel.controller.cpu.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'controller-memory') {
        this.di.$scope.dashboardModel.controller.memory.begin_time = scope.dashboardModel.controller.memory.origin_begin_time;
        this.di.$scope.dashboardModel.controller.memory.end_time = scope.dashboardModel.controller.memory.origin_end_time;
        this.di.$scope.dashboardModel.controller.memory.step = Math.floor((scope.dashboardModel.controller.memory.origin_end_time.getTime() - scope.dashboardModel.controller.memory.origin_begin_time) / (GRID_NUM * 1000));
      }
      else if (type === 'controller-interface') {
        this.di.$scope.dashboardModel.controller.interface.begin_time = scope.dashboardModel.controller.interface.origin_begin_time;
        this.di.$scope.dashboardModel.controller.interface.end_time = scope.dashboardModel.controller.interface.origin_end_time;
        this.di.$scope.dashboardModel.controller.interface.step = Math.floor((scope.dashboardModel.controller.interface.origin_end_time.getTime() - scope.dashboardModel.controller.interface.origin_begin_time) / (GRID_NUM * 1000));
      }
    }

    this.di.$scope.realtime = (type) => {
      let date, before, begin_time, end_time, isController = false, typeKey, model;

      function setRealtime() {
        date = DI.dateService.getTodayObject();
        before = DI.dateService.getBeforeDateObject(SET_INTERVAL_TIME * REALTIME_GRID_NUM * 1000);

        begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, before.second);
        end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second);
      }

      function setHistoricalTime() {
        date = DI.dateService.getTodayObject();
        before = DI.dateService.getBeforeDateObject(30 * 60 * 1000);
        begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, before.second);
        end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second);
      }

      switch(type) {
        case 'device-cpu':
          typeKey = 'cpu';
          break;
        case 'device-memory':
          typeKey = 'memory';
          break;
        case 'device-interface':
          typeKey = 'interface';
          break;
        case 'device-interface-drop-error':
          typeKey = 'dropErrorInterface';
          break;
        case 'controller-cpu':
          isController = true;
          typeKey = 'cpu';
          break;
        case 'controller-memory':
          isController = true;
          typeKey = 'memory';
          break;
        case 'controller-interface':
          isController = true;
          typeKey = 'interface';
          break;
      }

      if(isController) {
        model = scope.dashboardModel.controller[typeKey];
      } else {
        model = scope.dashboardModel[typeKey];
      }

      model.isRealtime = !model.isRealtime;
      if (!model.isRealtime) {
        setHistoricalTime();
        model.origin_begin_time = begin_time;
        model.origin_end_time = end_time;
        model.begin_time = begin_time;
        model.end_time = end_time;
        model.step = Math.floor((model.origin_end_time.getTime() - model.origin_begin_time) / (GRID_NUM * 1000));

        clearInterval(model.intervalFlag);
        model.intervalFlag = null;
      } else {
        setRealtime();
        model.begin_time = begin_time;
        model.end_time = end_time;
        model.step = SET_INTERVAL_TIME;

        model.intervalFlag = setInterval(() => {
          setRealtime();
          model.begin_time = begin_time;
          model.end_time = end_time;

          scope.$apply();
        }, SET_INTERVAL_TIME * 1000)
      }
    }

    this.di.$scope.refresh = (type) => {
      let date, before, begin_time, end_time, isController = false, typeKey, model;

      date = DI.dateService.getTodayObject();
      before = DI.dateService.getBeforeDateObject(30 * 60 * 1000);
      begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, before.second);
      end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second);

      switch(type) {
        case 'device-cpu':
          typeKey = 'cpu';
          break;
        case 'device-memory':
          typeKey = 'memory';
          break;
        case 'device-interface':
          typeKey = 'interface';
          break;
        case 'device-interface-drop-error':
          typeKey = 'dropErrorInterface';
          break;
        case 'controller-cpu':
          isController = true;
          typeKey = 'cpu';
          break;
        case 'controller-memory':
          isController = true;
          typeKey = 'memory';
          break;
        case 'controller-interface':
          isController = true;
          typeKey = 'interface';
          break;
      }

      if(isController) {
        model = scope.dashboardModel.controller[typeKey];
      } else {
        model = scope.dashboardModel[typeKey];
      }

      model.origin_begin_time = begin_time;
      model.origin_end_time = end_time;
      model.begin_time = begin_time;
      model.end_time = end_time;
      model.step = Math.floor((model.origin_end_time.getTime() - model.origin_begin_time) / (GRID_NUM * 1000));
    }
  
    this.di.$scope.chartSetting = (type) => {
      let chartDataArr = [], selectedData = [];
      let beginTime, endTime, unitTypeOption, stateTypeOption;
      switch(type) {
        case 'controller-cpu':
          dataModel['cluster'].forEach((controller) => {
            chartDataArr.push(controller.id);
          });

          beginTime = this.di.$scope.dashboardModel.controller.cpu.begin_time;
          endTime = this.di.$scope.dashboardModel.controller.cpu.end_time;
          selectedData = this.di.$scope.dashboardModel.controller.cpu.selectedData;
          break;
        case 'controller-memory':
          dataModel['cluster'].forEach((controller) => {
            chartDataArr.push(controller.id);
          });

          beginTime = this.di.$scope.dashboardModel.controller.memory.begin_time;
          endTime = this.di.$scope.dashboardModel.controller.memory.end_time;
          selectedData = this.di.$scope.dashboardModel.controller.memory.selectedData;
          break;
        case 'controller-interface':
          dataModel['cluster'].forEach((controller) => {
            chartDataArr.push(controller.id);
          });

          beginTime = this.di.$scope.dashboardModel.controller.interface.begin_time;
          endTime = this.di.$scope.dashboardModel.controller.interface.end_time;
          selectedData = this.di.$scope.dashboardModel.controller.interface.selectedData;
          unitTypeOption = this.di.$scope.dashboardModel.controller.interface.unitTypeOption;
          stateTypeOption = this.di.$scope.dashboardModel.controller.interface.stateTypeOption;
          break;
        case 'device-cpu':
          dataModel['devices'].forEach((item, index) =>{
            chartDataArr.push(item.switch_name);
          });

          beginTime = this.di.$scope.dashboardModel.cpu.begin_time;
          endTime = this.di.$scope.dashboardModel.cpu.end_time;
          selectedData = this.di.$scope.dashboardModel.cpu.selectedData;
          break;
        case 'device-memory':
          dataModel['devices'].forEach((item, index) =>{
            chartDataArr.push(item.switch_name);
          });

          beginTime = this.di.$scope.dashboardModel.memory.begin_time;
          endTime = this.di.$scope.dashboardModel.memory.end_time;
          selectedData = this.di.$scope.dashboardModel.memory.selectedData;
          break;

        case 'device-disk':
          // dataModel['devices'].forEach((item, index) =>{
          //   chartDataArr.push(item.switch_name);
          // });
          //
          // beginTime = this.di.$scope.dashboardModel.disk.begin_time;
          // endTime = this.di.$scope.dashboardModel.disk.end_time;
          // selectedData = this.di.$scope.dashboardModel.disk.selectedData;
          break;

        case 'device-interface':
          dataModel['devices'].forEach((item, index) =>{
            chartDataArr.push(item.switch_name);
          });

          beginTime = this.di.$scope.dashboardModel.interface.begin_time;
          endTime = this.di.$scope.dashboardModel.interface.end_time;
          selectedData = this.di.$scope.dashboardModel.interface.selectedData;
          break;

        case 'device-interface-drop-error':
          dataModel['devices'].forEach((item, index) =>{
            chartDataArr.push(item.switch_name);
          });

          beginTime = this.di.$scope.dashboardModel.dropErrorInterface.begin_time;
          endTime = this.di.$scope.dashboardModel.dropErrorInterface.end_time;
          selectedData = this.di.$scope.dashboardModel.dropErrorInterface.selectedData;
          break;
      }

      this.di.modalManager.open({
        template: require('../template/chart_setting.html'),
        controller: 'showChartSettingCtrl',
        windowClass: 'show-chart-setting-modal',
        resolve: {
          dataModel: () => {
            let model = {
              chartType: type,
              chartDataArr: chartDataArr,
              selectedData: selectedData,
              beginTime: beginTime,
              endTime: endTime
            };
            switch (type) {
              case 'controller-interface':
                model.unitTypeOption = unitTypeOption;
                model.stateTypeOption = stateTypeOption;
                break;
            }

            return model;
          }
        }
      }).result.then((res) => {
        if (res && !res.canceled) {
          let selectedData = [];
          if(Array.isArray(res.data.selectedData)) {
            selectedData = res.data.selectedData;
          } else if(typeof res.data.selectedData == 'string' && res.data.selectedData){
            selectedData = [res.data.selectedData]
          }
          switch(type) {
            case 'controller-cpu':
              scope.dashboardModel.controller.cpu.selectedData = selectedData;

              scope.dashboardModel.controller.cpu.origin_begin_time = res.data.beginTime;
              scope.dashboardModel.controller.cpu.origin_end_time = res.data.endTime;
              scope.dashboardModel.controller.cpu.begin_time = res.data.beginTime;
              scope.dashboardModel.controller.cpu.end_time = res.data.endTime;
              scope.dashboardModel.controller.cpu.step = Math.floor((scope.dashboardModel.controller.cpu.origin_end_time.getTime() - scope.dashboardModel.controller.cpu.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'controller-memory':
              scope.dashboardModel.controller.memory.selectedData = selectedData;
              scope.dashboardModel.controller.memory.origin_begin_time = res.data.beginTime;
              scope.dashboardModel.controller.memory.origin_end_time = res.data.endTime;
              scope.dashboardModel.controller.memory.begin_time = res.data.beginTime;
              scope.dashboardModel.controller.memory.end_time = res.data.endTime;
              scope.dashboardModel.controller.memory.step = Math.floor((scope.dashboardModel.controller.memory.origin_end_time.getTime() - scope.dashboardModel.controller.memory.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'controller-interface':
              scope.dashboardModel.controller.interface.unitTypeOption = res.data.unitTypeOption;
              scope.dashboardModel.controller.interface.stateTypeOption = res.data.stateTypeOption;
              scope.dashboardModel.controller.interface.origin_begin_time = res.data.beginTime;
              scope.dashboardModel.controller.interface.origin_end_time = res.data.endTime;
              scope.dashboardModel.controller.interface.begin_time = res.data.beginTime;
              scope.dashboardModel.controller.interface.end_time = res.data.endTime;
              scope.dashboardModel.controller.interface.step = Math.floor((scope.dashboardModel.controller.interface.origin_end_time.getTime() - scope.dashboardModel.controller.interface.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'device-cpu':
              scope.dashboardModel.cpu.selectedData = selectedData;
              scope.dashboardModel.cpu.origin_begin_time = res.data.beginTime;
              scope.dashboardModel.cpu.origin_end_time = res.data.endTime;
              scope.dashboardModel.cpu.begin_time = res.data.beginTime;
              scope.dashboardModel.cpu.end_time = res.data.endTime;
              scope.dashboardModel.cpu.step = Math.floor((scope.dashboardModel.cpu.origin_end_time.getTime() - scope.dashboardModel.cpu.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'device-memory':
              scope.dashboardModel.memory.selectedData = selectedData;
              scope.dashboardModel.memory.origin_begin_time = res.data.beginTime;
              scope.dashboardModel.memory.origin_end_time = res.data.endTime;
              scope.dashboardModel.memory.begin_time = res.data.beginTime;
              scope.dashboardModel.memory.end_time = res.data.endTime;
              scope.dashboardModel.memory.step = Math.floor((scope.dashboardModel.memory.origin_end_time.getTime() - scope.dashboardModel.memory.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'device-disk':
              // scope.dashboardModel.disk.selectedData = selectedData;
              //
              // let one_minute_before = DI.dateService.getBeforeDateObject(60 * 1000); // 前1分钟
              // scope.dashboardModel.disk.origin_begin_time = one_minute_before;
              // scope.dashboardModel.disk.origin_end_time = res.data.endTime;
              // scope.dashboardModel.disk.begin_time = one_minute_before;
              // scope.dashboardModel.disk.end_time = res.data.endTime;
              // scope.dashboardModel.disk.step = 60;
              break;
            case 'device-interface':
              scope.dashboardModel.interface.selectedData = selectedData;

              scope.dashboardModel.interface.origin_begin_time = res.data.beginTime;
              scope.dashboardModel.interface.origin_end_time = res.data.endTime;
              scope.dashboardModel.interface.begin_time = res.data.beginTime;
              scope.dashboardModel.interface.end_time = res.data.endTime;
              scope.dashboardModel.interface.step = Math.floor((scope.dashboardModel.interface.origin_end_time.getTime() - scope.dashboardModel.interface.origin_begin_time) / (GRID_NUM * 1000));
              break;
            case 'device-interface-drop-error':
              scope.dashboardModel.dropErrorInterface.selectedData = selectedData;

              scope.dashboardModel.dropErrorInterface.origin_begin_time = res.data.beginTime;
              scope.dashboardModel.dropErrorInterface.origin_end_time = res.data.endTime;
              scope.dashboardModel.dropErrorInterface.begin_time = res.data.beginTime;
              scope.dashboardModel.dropErrorInterface.end_time = res.data.endTime;
              scope.dashboardModel.dropErrorInterface.step = Math.floor((scope.dashboardModel.dropErrorInterface.origin_end_time.getTime() - scope.dashboardModel.dropErrorInterface.origin_begin_time) / (GRID_NUM * 1000));
              break;
          }
        }
      });
    }

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
        
        if(this.di.$scope.isAnalyzeEnable){
          this.getClustersCPUAnalyzer(res).then(() => {
            setClusterCPUChartData();
            DI.$scope.dashboardModel.controller.cpu.loading = false;
          }, () => {
            DI.$scope.dashboardModel.controller.cpu.loading = false;
            console.error("Can't get controller cpu analyzer data.");
          })
          
          this.getClustersMemoryAnalyzer(res).then(() => {
            setClusterMemoryChartData();
            DI.$scope.dashboardModel.controller.memory.loading = false;
          }, () => {
            DI.$scope.dashboardModel.controller.memory.loading = false;
            console.error("Can't get controller memory analyzer data.");
          })

          this.getClustersInterfaceAnalyzer(res).then(() => {
            setClusterInterfaceChartData();
            DI.$scope.dashboardModel.controller.interface.loading = false;
          }, () => {
            DI.$scope.dashboardModel.controller.interface.loading = false;
            console.error("Can't get controller interface analyzer data.");
          })
        }
      });
      promises.push(clusterDefer.promise);

      this.di.dashboardDataManager.getClusterStatistic().then((res)=>{
        dataModel['clusterStatistic'] = res;
        clusterStaticsDefer.resolve();
      });
      promises.push(clusterStaticsDefer.promise);

      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        this.di.deviceDataManager.getDevices().then((res)=>{
          dataModel['configDevices'] = configs;
          dataModel['devices'] = this.di.deviceService.getAllDevices(configs, res.data.devices);
          devicesDefer.resolve();
          
          if(this.di.$scope.isAnalyzeEnable){
            this.getDevicesCPUAnalyzer(configs).then(() => {
              setSwitchCpuChartData();
              DI.$scope.dashboardModel.cpu.loading = false;
            }, (err) => {
              console.error("Can't get device cpu analyzer data.");
              DI.$scope.dashboardModel.cpu.loading = false;
            });
            
            this.getDevicesMemoryAnalyzer(configs).then(() => {
              setSwitchMemoryChartData();
              DI.$scope.dashboardModel.memory.loading = false;
            }, (err) => {
              console.error("Can't get device memory analyzer data.");
              DI.$scope.dashboardModel.memory.loading = false;
            });

            this.getDevicesDiskAnalyzer(configs).then(() => {
              setSwitchDiskChartData();
              DI.$scope.dashboardModel.disk.loading = false;
            }, (err) => {
              console.error("Can't get device memory analyzer data.");
              DI.$scope.dashboardModel.disk.loading = false;
            });

            this.getDevicesInterfaceAnalyzer(configs).then((res)=>{
              DI.$scope.dashboardModel.interface.loading = false;
              DI.$scope.dashboardModel.dropErrorInterface.loading = false;
              setDeviceInterfaceRxTxChartData();
              setDeviceInterfaceDropErrorChartData();
            }, (err) => {
              console.error("Can't get device interface analyzer data.");
              DI.$scope.dashboardModel.interface.loading = false;
              DI.$scope.dashboardModel.dropErrorInterface.loading = false;
            });
          }
        });
      });
      promises.push(devicesDefer.promise);

      this.di.deviceDataManager.getPorts().then((res)=>{
        dataModel['ports'] = res.data.ports;
        portsDefer.resolve();
      });
      promises.push(portsDefer.promise);

      // this.di.$rootScope.$emit('start_loading');
      this.di.$scope.panelLoading.controller = true;
      this.di.$scope.panelLoading.switch = false;

      Promise.all(promises).then(()=>{
        let DI = this.di;
        convertControllerData();
        convertSwitchData();
        // convertSwitchInterface2Chart();
        
        DI.$scope.$apply();
        // DI.$rootScope.$emit('stop_loading');
        // DI.$scope.panelRefresh.controller = true;
        // DI.$scope.panelLoading.controller = false;
        // DI.$scope.$apply();
      });
    };
  
    // draw cluster cpu chart: added by yazhou.miao
    let setClusterCPUChartData = () => {
        let dataArr = [];
        let series = [];
        let labelsArr = [];
        let analyzer = this.di.$scope.dashboardModel.controller.cpu.analyzer;

        let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
        labelsArr = analyzer.length > 0 ?
            this.getCPUMemoryTimeSeries(x_times) : [];

        analyzer.forEach((controller) => {
            let data = [];
            controller.analyzer.forEach((item) => {
                data.push((100 - item.idle_percent).toFixed(2))
            });
            dataArr.push(data);
            series.push(controller.name);
        });

        const pad = this.pad;
        let options = {
            title: {
                display: true,
                  // text: this.translate('MODULES.DASHBOARD.CONTROLLER_CPU_USAGE'),
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false,
                        callback: function(value, index, values) {
                            return value.toFixed(2) + '%';
                        }
                    }
                }],
                xAxes: [{
                    ticks: {
                        callback: function(value, index, values) {
                            value = new Date(value);
                            return pad(value.getHours()) + ':' + pad(value.getMinutes()) + ':' + pad(value.getSeconds());
                        }
                    }
                }],
            },
            tooltips: {
              callbacks: {
                title: (tooltipItem, data) => {
                  let value = new Date(data.labels[tooltipItem[0].index]);
                  return getFormatedDateTime(value);
                },
                label: function(tooltipItem, data) {
                  var label = data.datasets[tooltipItem.datasetIndex].label || '';

                  if (label) {
                    label += ': ';
                  }
                  label += (tooltipItem.yLabel + '%');
                  return label;
                }
              }
            },
            // Container for zoom options
            zoom: {
                onZoom: lineChartOnZoom('cluster-cpu-chart')
            }
        };
        this.di.$scope.clusterCpuChartConfig.data = dataArr;
        this.di.$scope.clusterCpuChartConfig.labels = labelsArr;
        this.di.$scope.clusterCpuChartConfig.options = options;
        this.di.$scope.clusterCpuChartConfig.series = series;
        this.di.$scope.clusterCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.controller.cpu.analyzer);
        this.di.$scope.clusterCpuChartConfig.onHover = lineChartOnHover();
    };

    let setRealtimeClusterCPUChartData = () => {
      //cpu analyzer
      let dataArr = [];
      let series = [];
      let analyzer = this.di.$scope.dashboardModel.controller.cpu.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      let labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((controller) => {
        let data = [];
        controller.analyzer.forEach((item) => {
          data.push((100 - item.idle_percent).toFixed(2))
        });
        dataArr.push(data);
        series.push(controller.name);
      });

      scope.clusterCpuChartConfig.options.animation = { duration: 0 };
      scope.clusterCpuChartConfig.options.zoom.enabled = false;
      scope.clusterCpuChartConfig.data = dataArr;
      scope.clusterCpuChartConfig.labels = labelsArr;
      scope.clusterCpuChartConfig.series = series;
      scope.clusterCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.controller.cpu.analyzer);
    };

    let setClusterMemoryChartData = () => {
      let dataArr = [];
      let series = [];
      let labelsArr = [];
      let analyzer = this.di.$scope.dashboardModel.controller.memory.analyzer
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      labelsArr = analyzer.length > 0 ?
          this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((controller) => {
          let data = [];
          controller.analyzer.forEach((item) => {
              data.push(item.used_percent.toFixed(2))
          });
          dataArr.push(data);
          series.push(controller.name)
      });

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.DASHBOARD.CONTROLLER_MEMORY_USAGE'),
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return value.toFixed(2) + '%';
              }
            }
          }],
          xAxes: [{
            ticks: {
              callback: function(value, index, values) {
                value = new Date(value);
                return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());;
              }
            }
          }],
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem, data) => {
              let value = new Date(data.labels[tooltipItem[0].index]);
              return getFormatedDateTime(value);
            },
            label: function(tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += (tooltipItem.yLabel + '%');
              return label;
            }
          }
        },
        // Container for zoom options
        zoom: {
          // Useful for dynamic data loading
          onZoom: lineChartOnZoom('cluster-memory-chart')
        }
      };

      this.di.$scope.clusterMemoryChartConfig.data = dataArr;
      this.di.$scope.clusterMemoryChartConfig.labels = labelsArr;
      this.di.$scope.clusterMemoryChartConfig.options = options;
      this.di.$scope.clusterMemoryChartConfig.series = series;
      this.di.$scope.clusterMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.controller.memory.analyzer);
      this.di.$scope.clusterMemoryChartConfig.onHover = lineChartOnHover();
    };

    let setRealtimeClusterMemoryChartData = () => {
      //cpu analyzer
      let dataArr = [];
      let series = [];
      let analyzer = this.di.$scope.dashboardModel.controller.memory.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      let labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((controller) => {
        let data = [];
        controller.analyzer.forEach((item) => {
          data.push(item.used_percent.toFixed(2))
        });
        dataArr.push(data);
        series.push(controller.name)
      });

      scope.clusterMemoryChartConfig.options.animation = { duration: 0 };
      scope.clusterMemoryChartConfig.options.zoom.enabled = false;
      scope.clusterMemoryChartConfig.data = dataArr;
      scope.clusterMemoryChartConfig.labels = labelsArr;
      scope.clusterMemoryChartConfig.series = series;
      scope.clusterMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.controller.memory.analyzer);
    };

    let setClusterInterfaceChartData = () => {
      let dataArr = [], series = [],labelsArr = [] , yAxesTitle, onClickType;
      let analyzer = this.di.$scope.dashboardModel.controller.interface.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((controller) => {
        let data = [];
        controller.analyzer.forEach((item) => {
          switch (scope.dashboardModel.controller.interface.unitTypeOption.value) {
            case 'packets_tx':
              switch (scope.dashboardModel.controller.interface.stateTypeOption.value) {
                case 'normal':
                  data.push(item.packets_tx);
                  break;
                case 'dropped':
                  data.push(item.dropped_tx);
                  break;
                case 'error':
                  data.push(item.error_tx);
                  break;
              }
              yAxesTitle = 'packets';
              break;
            case 'packets_rx':
              switch (scope.dashboardModel.controller.interface.stateTypeOption.value) {
                case 'normal':
                  data.push(item.packets_rx);
                  break;
                case 'dropped':
                  data.push(item.dropped_rx);
                  break;
                case 'error':
                  data.push(item.error_rx);
                  break;
              }
              yAxesTitle = 'packets';
              break;
            case 'bytes_tx':
              data.push(item.bytes_tx);
              yAxesTitle = 'bytes';
              break;
            case 'bytes_rx':
              data.push(item.bytes_rx);
              yAxesTitle = 'bytes';
              break;
          }
        });

        dataArr.push(data);
        series.push(controller.name)
      });

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.DASHBOARD.CONTROLLER_INTERFACE_PACKETS'),
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: yAxesTitle
            },
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return getFormattedNumber(value);
              }
            }
          }],
          xAxes: [{
            ticks: {
              callback: function(value, index, values) {
                value = new Date(value);
                return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());;
              }
            }
          }],
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem, data) => {
              let value = new Date(data.labels[tooltipItem[0].index]);
              return getFormatedDateTime(value);
            },
            label: function(tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += getFormattedNumber(tooltipItem.yLabel);
              return label;
            }
          }
        },
        // Container for zoom options
        zoom: {
          // Useful for dynamic data loading
          onZoom: lineChartOnZoom('cluster-interface-chart')
        }
      };

      this.di.$scope.clusterInterfaceChartConfig.data = dataArr;
      this.di.$scope.clusterInterfaceChartConfig.labels = labelsArr;
      this.di.$scope.clusterInterfaceChartConfig.options = options;
      this.di.$scope.clusterInterfaceChartConfig.series = series;
      this.di.$scope.clusterInterfaceChartConfig.onClick = interfaceLineChartOnClick(scope.dashboardModel.controller.interface.analyzer, yAxesTitle);
      this.di.$scope.clusterInterfaceChartConfig.onHover = lineChartOnHover();
    };

    let setRealtimeClusterInterfaceChartData = () => {
      let dataArr = [], series = [],labelsArr = [] , yAxesTitle, onClickType;
      let analyzer = this.di.$scope.dashboardModel.controller.interface.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((controller) => {
        let data = [];
        controller.analyzer.forEach((item) => {
          switch (scope.dashboardModel.controller.interface.unitTypeOption.value) {
            case 'packets_tx':
              switch (scope.dashboardModel.controller.interface.stateTypeOption.value) {
                case 'normal':
                  data.push(item.packets_tx);
                  break;
                case 'dropped':
                  data.push(item.dropped_tx);
                  break;
                case 'error':
                  data.push(item.error_tx);
                  break;
              }
              yAxesTitle = 'packets';
              break;
            case 'packets_rx':
              switch (scope.dashboardModel.controller.interface.stateTypeOption.value) {
                case 'normal':
                  data.push(item.packets_rx);
                  break;
                case 'dropped':
                  data.push(item.dropped_rx);
                  break;
                case 'error':
                  data.push(item.error_rx);
                  break;
              }
              yAxesTitle = 'packets';
              break;
            case 'bytes_tx':
              data.push(item.bytes_tx);
              yAxesTitle = 'bytes';
              break;
            case 'bytes_rx':
              data.push(item.bytes_rx);
              yAxesTitle = 'bytes';
              break;
          }
        });

        dataArr.push(data);
        series.push(controller.name)
      });

      scope.clusterInterfaceChartConfig.options.animation = { duration: 0 };
      scope.clusterInterfaceChartConfig.options.zoom.enabled = false;
      scope.clusterInterfaceChartConfig.data = dataArr;
      scope.clusterInterfaceChartConfig.labels = labelsArr;
      scope.clusterInterfaceChartConfig.series = series;
      scope.clusterInterfaceChartConfig.onClick = interfaceLineChartOnClick(scope.dashboardModel.controller.interface.analyzer, yAxesTitle);
    };

    let setSwitchCpuChartData = () => {
      //cpu analyzer
      let dataArr = [];
      let series = [];
      let analyzer = this.di.$scope.dashboardModel.cpu.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      let labelsArr = analyzer.length > 0 ?
          this.getCPUMemoryTimeSeries(x_times) : [];

      if(analyzer.length) {
        analyzer.forEach((item, index) =>{
          dataArr.push(item.data);
          series.push(item.name);
        });
      }

      const pad = this.pad;
      let options = {
        // animation: {
        //   duration: 5000,
        //   easing: 'easeInSine'
        // },
        title: {
            display: true,
            // text: this.translate('MODULES.DASHBOARD.SWITCH_CPU_USAGE'),
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                  return value.toFixed(2) + '%';
              }
            }
          }],
          xAxes: [{
            ticks: {
              callback: function(value, index, values) {
               value = new Date(value);
               return pad(value.getHours()) + ':' + pad(value.getMinutes()) + ':' + pad(value.getSeconds());
              }
            }
          }],
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem, data) => {
              let value = new Date(data.labels[tooltipItem[0].index]);
              return getFormatedDateTime(value);
            },
            label: function(tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += (tooltipItem.yLabel + '%');
              return label;
            }
          }
        },
        // Container for zoom options
        zoom: {
          // Useful for dynamic data loading
          onZoom: lineChartOnZoom('switch-cpu-chart')
        }
      }

      this.di.$scope.switchCpuChartConfig.data = dataArr;
      this.di.$scope.switchCpuChartConfig.labels = labelsArr;
      this.di.$scope.switchCpuChartConfig.options = options;
      this.di.$scope.switchCpuChartConfig.series = series;
      this.di.$scope.switchCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.cpu.analyzer);
      this.di.$scope.switchCpuChartConfig.onHover = lineChartOnHover();
    };

    let setRealtimeSwitchCpuChartData = () => {
      //cpu analyzer
      let dataArr = [];
      let series = [];
      let analyzer = this.di.$scope.dashboardModel.cpu.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      let labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      if(analyzer.length) {
        analyzer.forEach((item, index) =>{
          dataArr.push(item.data);
          series.push(item.name);
        });
      }

      scope.switchCpuChartConfig.options.animation = { duration: 0 };
      scope.switchCpuChartConfig.options.zoom.enabled = false;
      scope.switchCpuChartConfig.data = dataArr;
      scope.switchCpuChartConfig.labels = labelsArr;
      scope.switchCpuChartConfig.series = series;
      scope.switchCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.cpu.analyzer);
    };

    let setSwitchMemoryChartData = () => {
      //memory analyzer
      let dataArr = [];
      let series = [];
      let analyzer = this.di.$scope.dashboardModel.memory.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      let labelsArr = analyzer.length > 0 ?
          this.getCPUMemoryTimeSeries(x_times) : [];

      let index = 0;
      if(analyzer.length) {
        analyzer.forEach((item, index) =>{
          dataArr.push(item.data);
          series.push(item.name)
        })
      }

      const pad = this.pad;
      const scope = this.di.$scope;

      let options = {
          title: {
              display: true,
              // text: this.translate('MODULES.DASHBOARD.SWITCH_MEMORY_USAGE'),
          },
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: false,
                      callback: function(value, index, values) {
                          return value.toFixed(2) + '%';
                      }
                  }
              }],
              xAxes: [{
                  ticks: {
                      callback: function(value, index, values) {
                          value = new Date(value);
                          return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());
                      }
                  }
              }],
          },
          tooltips: {
            callbacks: {
              title: (tooltipItem, data) => {
                let value = new Date(data.labels[tooltipItem[0].index]);
                return getFormatedDateTime(value);
              },
              label: function(tooltipItem, data) {
                var label = data.datasets[tooltipItem.datasetIndex].label || '';

                if (label) {
                  label += ': ';
                }
                label += (tooltipItem.yLabel + '%');
                return label;
              }
            }
          },
          zoom: {
            // Useful for dynamic data loading
            onZoom: lineChartOnZoom('switch-memory-chart')
          }
      };

      this.di.$scope.switchMemoryChartConfig.data = dataArr;
      this.di.$scope.switchMemoryChartConfig.labels = labelsArr;
      this.di.$scope.switchMemoryChartConfig.options = options;
      this.di.$scope.switchMemoryChartConfig.series = series;
      this.di.$scope.switchMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.memory.analyzer);
      this.di.$scope.switchMemoryChartConfig.onHover = lineChartOnHover();
    };

    let setRealtimeSwitchMemoryChartData = () => {
      //memory analyzer
      let dataArr = [];
      let series = [];
      let analyzer = this.di.$scope.dashboardModel.memory.analyzer;
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      let labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      if(analyzer.length) {
        analyzer.forEach((item, index) =>{
          dataArr.push(item.data);
          series.push(item.name);
        });
      }

      scope.switchMemoryChartConfig.options.animation = { duration: 0 };
      scope.switchMemoryChartConfig.options.zoom.enabled = false;
      scope.switchMemoryChartConfig.data = dataArr;
      scope.switchMemoryChartConfig.labels = labelsArr;
      scope.switchMemoryChartConfig.series = series;
      scope.switchMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.memory.analyzer);
    };

    // let setSwitchDiskChartData = () => {
    //   // disk analyzer
    //   let dataArr = [];
    //   let series = [];
    //   let analyzer = this.di.$scope.dashboardModel.disk.analyzer;
    //   let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
    //   let labelsArr = analyzer.length > 0 ?
    //     this.getCPUMemoryTimeSeries(x_times) : [];
    //
    //   let index = 0;
    //   if(analyzer.length) {
    //     analyzer.forEach((item, index) =>{
    //       dataArr.push(item.data);
    //       series.push(item.name)
    //     })
    //   }
    //
    //   const pad = this.pad;
    //   const scope = this.di.$scope;
    //
    //   let options = {
    //     title: {
    //       display: true,
    //       text: this.translate('MODULES.DASHBOARD.SWITCH_DISK_USAGE'),
    //     },
    //     scales: {
    //       yAxes: [{
    //         ticks: {
    //           beginAtZero: false,
    //           callback: function(value, index, values) {
    //             return value.toFixed(2) + '%';
    //           }
    //         }
    //       }],
    //       xAxes: [{
    //         ticks: {
    //           callback: function(value, index, values) {
    //             value = new Date(value);
    //             return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());
    //           }
    //         }
    //       }],
    //     },
    //     tooltips: {
    //       callbacks: {
    //         title: (tooltipItem) => {
    //           let value = new Date(labelsArr[tooltipItem[0].index]);
    //           return getFormatedDateTime(value);
    //         },
    //         label: function(tooltipItem, data) {
    //           var label = data.datasets[tooltipItem.datasetIndex].label || '';
    //
    //           if (label) {
    //             label += ': ';
    //           }
    //           label += (tooltipItem.yLabel + '%');
    //           return label;
    //         }
    //       }
    //     },
    //     zoom: {
    //       // Useful for dynamic data loading
    //       onZoom: lineChartOnZoom('switch-disk-chart')
    //     }
    //   };
    //
    //   this.di.$scope.switchDiskChartConfig.data = dataArr;
    //   this.di.$scope.switchDiskChartConfig.labels = labelsArr;
    //   this.di.$scope.switchDiskChartConfig.options = options;
    //   this.di.$scope.switchDiskChartConfig.series = series;
    //   this.di.$scope.switchDiskChartConfig.onClick = diskChartOnClick(scope.dashboardModel.disk.analyzer, scope.switchDiskPieChartConfig);
    //   this.di.$scope.switchDiskChartConfig.onHover = lineChartOnHover();
    //
    //   if(dataArr.length > 0 && labelsArr.length > 0){
    //     let xLabel = labelsArr[0];
    //     let data,title;
    //
    //     analyzer.forEach((controller) => {
    //       if(controller.analyzer.length > 0 && !data) {
    //         data = controller.analyzer[0];
    //         title = controller.name + ' - ' + formatLocalTime(xLabel);
    //       }
    //     })
    //
    //     setDiskPieChartData(data, title, this.di.$scope.switchDiskPieChartConfig)
    //   }
    // };1

    let setSwitchDiskChartData = () => {
      let labelsArr = [];

      let usedArr = [], freeArr = [], reservedArr = [];
      let analyzer = this.di.$scope.dashboardModel.disk.analyzer;
      this.di._.forEach(analyzer, (device)=>{
        labelsArr.push(device.name);
        usedArr.push(device.used_percent);
        freeArr.push(device.free_percent);
        reservedArr.push(device.reserved_percent);
      });

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.DASHBOARD.SWITCH_DISK_USAGE')
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'percent'
            },
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return value.toFixed(2) + '%';
              }
            },
          }],
          xAxes: [{
            barThickness: 'flex',
          }],
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem) {
                return tooltipItem.yLabel.toFixed(2) + '%';
              }
            }
          }
        }

      scope.switchDiskChartConfig.data = [freeArr, usedArr, reservedArr];
      scope.switchDiskChartConfig.labels = labelsArr;
      scope.switchDiskChartConfig.series = ['free_percent', 'used_percent', 'reserved_percent'];
      scope.switchDiskChartConfig.colors = [{backgroundColor: 'rgb(144,238,144)'}, {backgroundColor: 'rgb(250,128,114)'}, {backgroundColor: 'rgb(0, 118, 203)'}];
      scope.switchDiskChartConfig.options = options;
    };

    let setDeviceInterfaceRxTxChartData = () => {
      let dataArr = [], series = [],labelsArr = [] , yAxesTitle, analyzerLength;
      let tmpAnalyzer = this.di.$scope.dashboardModel.interface.analyzer;
      switch (scope.dashboardModel.interface.typeOption.value) {
        case 'packets_tx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].packetsSent - device.analyzer[0].packetsSent : 0;
          }, 'desc');
          break;
        case 'packets_rx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].packetsReceived - device.analyzer[0].packetsReceived : 0;
          }, 'desc');
          break;
        case 'bytes_tx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].bytesSent - device.analyzer[0].bytesSent : 0;
          }, 'desc');
          break;
        case 'bytes_rx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].bytesReceived - device.analyzer[0].bytesReceived : 0;
          }, 'desc');
          break;
      }

      // get top5 analyzer
      let analyzer = this.calcInterfaceTxRxRate(tmpAnalyzer.slice(0, 5));
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((device) => {
        let data = [];
        device.analyzer.forEach((item) => {
          switch (scope.dashboardModel.interface.typeOption.value) {
            case 'packets_tx':
              data.push(item.packets_tx);
              yAxesTitle = 'packets';
              break;
            case 'packets_rx':
              data.push(item.packets_rx);
              yAxesTitle = 'packets';
              break;
            case 'bytes_tx':
              data.push(item.bytes_tx);
              yAxesTitle = 'bytes';
              break;
            case 'bytes_rx':
              data.push(item.bytes_rx);
              yAxesTitle = 'bytes';
              break;
          }
        });

        dataArr.push(data);
        series.push(device.name)
      });

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.DASHBOARD.SWITCH_INTERFACE_PACKETS'),
          text: '',
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: yAxesTitle
            },
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return getFormattedNumber(value);
              }
            }
          }],
          xAxes: [{
            ticks: {
              callback: function(value, index, values) {
                value = new Date(value);
                return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());;
              }
            }
          }],
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem, data) => {
              let value = new Date(data.labels[tooltipItem[0].index]);
              return getFormatedDateTime(value);
            },
            label: function(tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += getFormattedNumber(tooltipItem.yLabel);
              return label;
            }
          }
        },
        // Container for zoom options
        zoom: {
          // Useful for dynamic data loading
          onZoom: lineChartOnZoom('switch-interface-chart')
        }
      };

      this.di.$scope.switchInterfaceRxTxChartConfig.data = dataArr;
      this.di.$scope.switchInterfaceRxTxChartConfig.labels = labelsArr;
      this.di.$scope.switchInterfaceRxTxChartConfig.options = options;
      this.di.$scope.switchInterfaceRxTxChartConfig.series = series;
      this.di.$scope.switchInterfaceRxTxChartConfig.onClick = interfaceLineChartOnClick(analyzer, yAxesTitle);
      this.di.$scope.switchInterfaceRxTxChartConfig.onHover = lineChartOnHover();
    };

    let setRealtimeDeviceInterfaceRxTxChartData = () => {
      let dataArr = [], series = [],labelsArr = [] , yAxesTitle, analyzerLength;
      let tmpAnalyzer = this.di.$scope.dashboardModel.interface.analyzer;
      switch (scope.dashboardModel.interface.typeOption.value) {
        case 'packets_tx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].packetsSent - device.analyzer[0].packetsSent : 0;
          }, 'desc');
          break;
        case 'packets_rx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].packetsReceived - device.analyzer[0].packetsReceived : 0;
          }, 'desc');
          break;
        case 'bytes_tx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].bytesSent - device.analyzer[0].bytesSent : 0;
          }, 'desc');
          break;
        case 'bytes_rx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength  = device.analyzer.length;
            return analyzerLength > 0 ? device.analyzer[analyzerLength - 1].bytesReceived - device.analyzer[0].bytesReceived : 0;
          }, 'desc');
          break;
      }

      // get top5 analyzer
      let analyzer = this.calcInterfaceTxRxRate(tmpAnalyzer.slice(0, 5));
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((device) => {
        let data = [];
        device.analyzer.forEach((item) => {
          switch (scope.dashboardModel.interface.typeOption.value) {
            case 'packets_tx':
              data.push(item.packets_tx);
              yAxesTitle = 'packets';
              break;
            case 'packets_rx':
              data.push(item.packets_rx);
              yAxesTitle = 'packets';
              break;
            case 'bytes_tx':
              data.push(item.bytes_tx);
              yAxesTitle = 'bytes';
              break;
            case 'bytes_rx':
              data.push(item.bytes_rx);
              yAxesTitle = 'bytes';
              break;
          }
        });

        dataArr.push(data);
        series.push(device.name)
      });

      scope.switchInterfaceRxTxChartConfig.options.animation = { duration: 0 };
      scope.switchInterfaceRxTxChartConfig.options.zoom.enabled = false;
      scope.switchInterfaceRxTxChartConfig.data = dataArr;
      scope.switchInterfaceRxTxChartConfig.labels = labelsArr;
      scope.switchInterfaceRxTxChartConfig.series = series;
      scope.switchInterfaceRxTxChartConfig.onClick = interfaceLineChartOnClick(analyzer, yAxesTitle);
    };

    let setDeviceInterfaceDropErrorChartData = () => {
      let dataArr = [], series = [],labelsArr = [] , yAxesTitle, analyzerLength;
      let tmpAnalyzer = this.di.$scope.dashboardModel.dropErrorInterface.analyzer;
      switch (scope.dashboardModel.dropErrorInterface.typeOption.value) {
        case 'packets_tx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength = device.analyzer.length;
            return analyzerLength > 0 ? (device.analyzer[analyzerLength - 1].packetsTxDropped - device.analyzer[0].packetsTxDropped)
              + (device.analyzer[analyzerLength - 1].packetsTxErrors - device.analyzer[0].packetsTxErrors) : 0;
          }, 'desc');
          break;
        case 'packets_rx':
          tmpAnalyzer = this.di._.orderBy(tmpAnalyzer, (device) => {
            analyzerLength = device.analyzer.length;
            return analyzerLength > 0 ? (device.analyzer[analyzerLength - 1].packetsRxDropped - device.analyzer[0].packetsRxDropped)
              + (device.analyzer[analyzerLength - 1].packetsRxErrors - device.analyzer[0].packetsRxErrors) : 0;
          }, 'desc');
          break;
      }

      // get top5 analyzer
      let analyzer = this.calcInterfaceTxRxRate(tmpAnalyzer.slice(0, 5));
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      labelsArr = analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : [];

      analyzer.forEach((device) => {
        let data = [];
        device.analyzer.forEach((item) => {
          switch (scope.dashboardModel.dropErrorInterface.typeOption.value) {
            case 'packets_tx':
              data.push(item.dropped_tx + item.error_tx);
              yAxesTitle = 'packets';
              break;
            case 'packets_rx':
              data.push(item.dropped_rx + item.error_rx);
              yAxesTitle = 'packets';
              break;
          }
        });

        dataArr.push(data);
        series.push(device.name)
      });

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.DASHBOARD.SWITCH_INTERFACE_DROP_ERROR_PACKETS'),
          text: '',
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: yAxesTitle
            },
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return getFormattedNumber(value);
              }
            }
          }],
          xAxes: [{
            ticks: {
              callback: function(value, index, values) {
                value = new Date(value);
                return pad(value.getHours()) + ':' + pad(value.getMinutes())+ ':' + pad(value.getSeconds());;
              }
            }
          }],
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem, data) => {
              let value = new Date(data.labels[tooltipItem[0].index]);
              return getFormatedDateTime(value);
            },
            label: function(tooltipItem, data) {
              var label = data.datasets[tooltipItem.datasetIndex].label || '';

              if (label) {
                label += ': ';
              }
              label += getFormattedNumber(tooltipItem.yLabel);
              return label;
            }
          }
        },
        // Container for zoom options
        zoom: {
          // Useful for dynamic data loading
          onZoom: lineChartOnZoom('switch-interface-drop-error-chart')
        }
      };

      this.di.$scope.switchInterfaceDropErrorChartConfig.data = dataArr;
      this.di.$scope.switchInterfaceDropErrorChartConfig.labels = labelsArr;
      this.di.$scope.switchInterfaceDropErrorChartConfig.options = options;
      this.di.$scope.switchInterfaceDropErrorChartConfig.series = series;
      this.di.$scope.switchInterfaceDropErrorChartConfig.onClick = interfaceLineChartOnClick(analyzer, yAxesTitle);
      this.di.$scope.switchInterfaceDropErrorChartConfig.onHover = lineChartOnHover();
    };

    let setInterfaceErrorRxTxChartData = (dataArr, chartId, y_label, drop) => {
        let category= [], rxs = [], pkgRecv = [], pgkSend = [], title, labelsArr = [];
        this.di._.forEach(dataArr, (statistic)=>{
            let name = getSwtAndPortName(statistic['device'], statistic['port']);
            labelsArr.push(name);
            if (y_label === 'packages') {
                if (drop) {
                    pkgRecv.push(statistic['packetsRxDropped']);
                    pgkSend.push(statistic['packetsTxDropped']);

                    title = this.translate('MODULES.DASHBOARD.PORT_DROP_PACKAGE');
                }
                else {
                    pkgRecv.push(statistic['packetsReceived']);
                    pgkSend.push(statistic['packetsSent']);

                    title = this.translate('MODULES.DASHBOARD.PORT_RXTX_PACKAGE');
                }
            }
            else {
                pkgRecv.push(statistic['bytesReceived']);
                pgkSend.push(statistic['bytesSent']);
            }
        });

        const pad = this.pad;
        let options = {
            title: {
              display: true,
              // text: title
            },
            scales: {
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'packages'
                    },
                    ticks: {
                        beginAtZero: false,
                        callback: function(value, index, values) {
                          return getFormattedNumber(value);
                        }
                    }
                }],
                xAxes: [{
                  stacked: true,
                  barThickness: 'flex',
                }],
            },
            tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                  var label = data.datasets[tooltipItem.datasetIndex].label || '';

                  if (label) {
                    label += ': ';
                  }
                  label += getFormattedNumber(tooltipItem.yLabel);
                  return label;
                }
              }
            },
        }

        if(drop) {
            scope.interfaceDropPackagesChartConfig.data = [pkgRecv, pgkSend];
            scope.interfaceDropPackagesChartConfig.labels = labelsArr;
            scope.interfaceDropPackagesChartConfig.series = [this.translate('MODULES.DASHBOARD.RECEIVE'),
             this.translate('MODULES.DASHBOARD.SENT')];
            scope.interfaceDropPackagesChartConfig.colors = [{backgroundColor: 'rgb(144,238,144)'}, {backgroundColor: 'rgb(250,128,114)'}];
            scope.interfaceDropPackagesChartConfig.options = options;
        } else {
            scope.interfaceRxTxPackagesChartConfig.data = [pkgRecv, pgkSend];
            scope.interfaceRxTxPackagesChartConfig.labels = labelsArr;
            scope.interfaceRxTxPackagesChartConfig.series = [this.translate('MODULES.DASHBOARD.RECEIVE'),
             this.translate('MODULES.DASHBOARD.SENT')];
            scope.interfaceRxTxPackagesChartConfig.colors = [{backgroundColor: 'rgb(144,238,144)'}, {backgroundColor: 'rgb(250,128,114)'}];
            scope.interfaceRxTxPackagesChartConfig.options = options;
        }
    };

    let cpuChartOnClick = function(analyzer) {
        return function(evt, chart) { // point element
            // 1.element hover event
            let element = chart.getElementAtEvent(evt);
            if(element.length > 0)
            {
                let datasetIndex = element[0]._datasetIndex;
                let index = element[0]._index;
                let xLabel = chart.data.labels[index];

                let data = analyzer[datasetIndex].analyzer[index];
                let title = analyzer[datasetIndex].name + ' - ' + formatLocalTime(xLabel);

                setCpuPieChartData(evt, data, title)
            }
        }
    }

    let memoryChartOnClick = function(analyzer) {
      return function(evt, chart) { // point element
        // 1.element hover event
        let element = chart.getElementAtEvent(evt);
        if(element.length > 0)
        {
          let datasetIndex = element[0]._datasetIndex;
          let index = element[0]._index;
          let xLabel = chart.data.labels[index];

          let data = analyzer[datasetIndex].analyzer[index];
          let title = analyzer[datasetIndex].name + ' - ' + formatLocalTime(xLabel)

          setMemoryPieChartData(evt, data, title)
        }
      }
    }

    let interfaceLineChartOnClick = function(analyzer, type) {
      return function(evt, chart) { // point element
        // 1.element hover event
        let element = chart.getElementAtEvent(evt);
        if(element.length > 0)
        {
          let datasetIndex = element[0]._datasetIndex;
          let index = element[0]._index;
          let xLabel = chart.data.labels[index];

          let data = analyzer[datasetIndex].analyzer[index];
          let title = analyzer[datasetIndex].name + ' - ' + formatLocalTime(xLabel)

          setInterfacePieChartData(evt, data, type, title)
        }
      }
    }

    let diskChartOnClick = function(analyzer) {
      return function(evt, chart) { // point element
        // 1.element hover event
        let element = chart.getElementAtEvent(evt);
        if(element.length > 0)
        {
          let datasetIndex = element[0]._datasetIndex;
          let index = element[0]._index;
          let xLabel = chart.data.labels[index];

          let data = analyzer[datasetIndex].analyzer[index];
          let title = analyzer[datasetIndex].name + ' - ' + formatLocalTime(xLabel)

          setDiskPieChartData(evt, data, title)
        }
      }
    }

    let setCpuPieChartData = (evt, data, title) => {
      // initial
      let pieChartConfig = {};
      pieChartConfig.data = [];
      pieChartConfig.labels = [];

      if(!data) return;

      // set pie chart data with first dataset and first data
      let chartData = {datasets:[], labels:[]};
      let dataset = {data:[], backgroundColor:[], label: ''};

      dataset.data.push(data['wait_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(255,255,255)');
      chartData.labels.push('wait');

      dataset.data.push(data['softirq_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(255,228,196)');
      chartData.labels.push('softirq');

      dataset.data.push(data['idle_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(144,238,144)');
      chartData.labels.push('idle');

      dataset.data.push(data['system_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(128,0,128)');
      chartData.labels.push('system');

      dataset.data.push(data['steal_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(210,105,30)');
      chartData.labels.push('steal');

      dataset.data.push(data['user_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(255,0,0)');
      chartData.labels.push('user');

      dataset.data.push(data['nice_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(244,164,96)');
      chartData.labels.push('nice');

      dataset.data.push(data['interrupt_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(0,128,128)');
      chartData.labels.push('interrupt');

      chartData.datasets.push(dataset);

      let pieOptions = {
        title: {
            text: title,
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return data.labels[tooltipItem.index] + ':' + data.datasets[0].data[tooltipItem.index] + '%';
            }
          }
        }
      }

      pieChartConfig.data = dataset.data;
      pieChartConfig.labels = chartData.labels;
      pieChartConfig.colors = dataset.backgroundColor;
      pieChartConfig.options = pieOptions;
      pieChartConfig.type = 'pie';

      DI.$rootScope.$emit('show_chart_tooltip', {data: pieChartConfig, event: evt});
    }

    let setMemoryPieChartData = (evt, data, title) => {
      // initial
      let pieChartConfig = {};
      pieChartConfig.data = [];
      pieChartConfig.labels = [];

      if(!data) return;

      let chartData = {datasets:[], labels:[]};
      let dataset = {data:[], backgroundColor:[], label: ''};
    
      dataset.data.push(data['buffered_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(244,164,96)');
      chartData.labels.push('buffered');
    
      dataset.data.push(data['cached_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(255,228,196)');
      chartData.labels.push('cached');
    
      dataset.data.push(data['free_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(144,238,144)');
      chartData.labels.push('free');
    
      dataset.data.push(data['slab_recl_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(128,0,128)');
      chartData.labels.push('slab_recl');
    
      dataset.data.push(data['slab_unrecl_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(210,105,30)');
      chartData.labels.push('slab_unrecl');
    
      dataset.data.push(data['used_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(255,0,0)');
      chartData.labels.push('used');
    
      chartData.datasets.push(dataset);
    
      let options = {
        title: {
          text: title,
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return data.labels[tooltipItem.index] + ':' + data.datasets[0].data[tooltipItem.index] + '%';
            }
          }
        }
      }
    
      pieChartConfig.data = dataset.data;
      pieChartConfig.labels = chartData.labels;
      pieChartConfig.colors = dataset.backgroundColor;
      pieChartConfig.options = options;

      DI.$rootScope.$emit('show_chart_tooltip', {data: pieChartConfig, event: evt});
    }

    let setDiskPieChartData = (evt, data, title) => {
      // initial
      let pieChartConfig = {};
      pieChartConfig.data = [];
      pieChartConfig.labels = [];

      if(!data) return;

      let chartData = {datasets:[], labels:[]};
      let dataset = {data:[], backgroundColor:[], label: ''};

      dataset.data.push(data['reserved_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(244,164,96)');
      chartData.labels.push('reserved');

      dataset.data.push(data['free_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(144,238,144)');
      chartData.labels.push('free');

      dataset.data.push(data['used_percent'].toFixed(2));
      dataset.backgroundColor.push('rgb(255,0,0)');
      chartData.labels.push('used');

      chartData.datasets.push(dataset);

      let options = {
        title: {
          text: title,
        }
      }

      pieChartConfig.data = dataset.data;
      pieChartConfig.labels = chartData.labels;
      pieChartConfig.colors = dataset.backgroundColor;
      pieChartConfig.options = options;

      DI.$rootScope.$emit('show_chart_tooltip', {data: pieChartConfig, event: evt});
    }

    let setInterfacePieChartData = (evt, data, type, title) => {
      // initial
      let pieChartConfig = {};
      pieChartConfig.data = [];
      pieChartConfig.labels = [];

      if(!data) return;

      let chartData = {datasets:[], labels:[]};
      let dataset = {data:[], backgroundColor:[], label: ''};

      switch (type) {
        case 'packets':
          dataset.data.push(data['packets_rx']);
          dataset.backgroundColor.push('rgb(244,164,96)');
          chartData.labels.push('packets_rx');

          dataset.data.push(data['packets_tx']);
          dataset.backgroundColor.push('rgb(255,228,196)');
          chartData.labels.push('packets_tx');

          dataset.data.push(data['dropped_rx']);
          dataset.backgroundColor.push('rgb(144,238,144)');
          chartData.labels.push('dropped_rx');

          dataset.data.push(data['dropped_tx']);
          dataset.backgroundColor.push('rgb(128,0,128)');
          chartData.labels.push('dropped_tx');

          dataset.data.push(data['error_rx']);
          dataset.backgroundColor.push('rgb(210,105,30)');
          chartData.labels.push('error_rx');

          dataset.data.push(data['error_tx']);
          dataset.backgroundColor.push('rgb(255,0,0)');
          chartData.labels.push('error_tx');
          break;
        case 'bytes':
          dataset.data.push(data['bytes_rx']);
          dataset.backgroundColor.push('rgb(244,164,96)');
          chartData.labels.push('bytes_rx');

          dataset.data.push(data['bytes_tx']);
          dataset.backgroundColor.push('rgb(255,228,196)');
          chartData.labels.push('bytes_tx');
          break;
      }

      chartData.datasets.push(dataset);

      let options = {
        title: {
          text: title,
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return data.labels[tooltipItem.index] + ':' + getFormattedNumber(data.datasets[0].data[tooltipItem.index]);
            }
          }
        }
      }

      pieChartConfig.data = dataset.data;
      pieChartConfig.labels = chartData.labels;
      pieChartConfig.colors = dataset.backgroundColor;
      pieChartConfig.options = options;

      DI.$rootScope.$emit('show_chart_tooltip', {data: pieChartConfig, event: evt});
    }
    
    let lineChartOnHover = function() {
        return function(event, chart) {
            // 1.element hover event
            let element = chart.getElementAtEvent(event);
            if(element.length > 0) return;

            // 2.recover line style when click the grid area
            const box = chart.boxes[0];
            let minTop = 0;
            if(box.position == 'bottom') {
                box.legendHitBoxes.forEach((item, key) => {
                    if(key == 0 || minTop > item.top) {
                        minTop = item.top;
                    }
                })
            }
            if((box.position === "top" && event.layerY >= box.height) || (box.position === "bottom" && event.layerY < minTop) || (box.position === "right" && event.layerX <= box.left)) {
                chart.data.datasets.forEach((value, key) => {
                    value.borderColor = chartService.helpers.color(value.borderColor).alpha(1).rgbString();
                    value.backgroundColor = chartService.helpers.color(value.backgroundColor).alpha(0.2).rgbString(),
                    value.borderWidth = chartStyles.lines.borderWidth;
                  value.pointRadius = 1;
                })

                chart.update();
            }
        }
    }

    let lineChartOnZoom = (chartType) => {
      return function(chart, xRange) {
        let ticks = chart.data.labels;
        let startIndex = xRange.start;
        let endIndex = xRange.end;
        if(startIndex === endIndex) {
          if(endIndex == ticks.length - 1) {
            startIndex = endIndex - 1;
          } else {
            endIndex = startIndex + 1;
          }
        }
      
        let start = new Date(ticks[startIndex]);
        let startTime = start.getTime();
        let end = new Date(ticks[endIndex]);
        let endTime =  end.getTime();
        let step = Math.floor((endTime - startTime) / ((ticks.length - 1) * 1000));
        step = step < 30 ? 30 : step > 3600 ? 3600 : step;
      
        switch(chartType) {
          case 'cluster-cpu-chart':
            scope.dashboardModel.controller.cpu.begin_time = start;
            scope.dashboardModel.controller.cpu.end_time = end;
            scope.dashboardModel.controller.cpu.step = step;
            break;
          case 'cluster-memory-chart':
            scope.dashboardModel.controller.memory.begin_time = start;
            scope.dashboardModel.controller.memory.end_time = end;
            scope.dashboardModel.controller.memory.step = step;
            break;
          case 'cluster-interface-chart':
            scope.dashboardModel.controller.interface.begin_time = start;
            scope.dashboardModel.controller.interface.end_time = end;
            scope.dashboardModel.controller.interface.step = step;
            break;
          case 'switch-cpu-chart':
            scope.dashboardModel.cpu.begin_time = start;
            scope.dashboardModel.cpu.end_time = end;
            scope.dashboardModel.cpu.step = step;
            break;
          case 'switch-memory-chart':
            scope.dashboardModel.memory.begin_time = start;
            scope.dashboardModel.memory.end_time = end;
            scope.dashboardModel.memory.step = step;
            break;
          case 'switch-interface-chart':
            scope.dashboardModel.interface.begin_time = start;
            scope.dashboardModel.interface.end_time = end;
            scope.dashboardModel.interface.step = step;
            break;
          case 'switch-interface-drop-error-chart':
            scope.dashboardModel.dropErrorInterface.begin_time = start;
            scope.dashboardModel.dropErrorInterface.end_time = end;
            scope.dashboardModel.dropErrorInterface.step = step;
            break;
        }
        
        scope.$apply()
      }
    }
    
    let convertControllerData =()=>{
      //1. summary
      let controllerSummary = {};
      let ctrlNodes = dataModel['cluster'];
      controllerSummary.count = ctrlNodes.length;
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
    };

    let convertSwitchInterface2Chart =()=>{
      let swtStatistics = dataModel['swtStatistics'];
      let waitOrderPortsStatistics = [];
      this.di._.forEach(swtStatistics, (device)=>{
        let curDeviceId = device.device;

        this.di._.forEach(dataModel['configDevices'],(deviceM)=>{
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
      // let packagesOrder = this.di._.filter(waitOrderPortsStatistics, (val) => {
      //   return val['packetsRecvSent'] > 0;
      // });
      packagesOrder.splice(5, packagesOrder.length-5);
      // chartSwtInterface(packagesOrder, 'swtInterfaceRxTxPackages', 'packages');
      setInterfaceRxTxChartData(packagesOrder, 'interface-rxtx-packages', 'packages');

      /*let b_r_s = 'bytesRecvSent';
      let bytesOrder = this.di._.orderBy(waitOrderPortsStatistics, b_r_s, 'desc');
      bytesOrder.splice(5, bytesOrder.length-5);
      chartSwtInterface(bytesOrder, 'swtInterfaceRxTxBytes', 'bytes');*/

      let p_d = 'packetsDrop';
      let packagesDropOrder = this.di._.orderBy(waitOrderPortsStatistics, p_d, 'desc');
      // let packagesDropOrder = this.di._.filter(waitOrderPortsStatistics, (val) => {
       //  return val['packetsDrop'] > 0;
      // });
      packagesDropOrder.splice(5, packagesDropOrder.length-5);
      // chartSwtInterface(packagesDropOrder, 'swtInterfaceRxTxDrops', 'packages', true);
      setInterfaceRxTxChartData(packagesDropOrder, 'interface-rxtx-drops', 'packages', true);
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
    
    let getFilteredDataModel = (type) => {
        let dataArr = [];

        let selectedData = [];
        switch(type) {
          case 'controller-cpu':
            selectedData = scope.dashboardModel.controller.cpu.selectedData;
            if(Array.isArray(selectedData) && selectedData.length > 0) {
              dataModel.cluster.forEach((data) => {
                  if(selectedData.indexOf(data.name) > -1) {
                      dataArr.push(data)
                  }
              })
            } else {
              dataArr = dataModel.cluster;
            }

            break;
          case 'controller-memory':
            selectedData = scope.dashboardModel.controller.memory.selectedData;
            if(Array.isArray(selectedData) && selectedData.length > 0) {
              dataModel.cluster.forEach((data) => {
                  if(selectedData.indexOf(data.name) > -1) {
                      dataArr.push(data)
                  }
              })
            } else {
              dataArr = dataModel.cluster;
            }
            break;
          case 'controller-interface':
            selectedData = scope.dashboardModel.controller.interface.selectedData;
            if(Array.isArray(selectedData) && selectedData.length > 0) {
              dataModel.cluster.forEach((data) => {
                if(selectedData.indexOf(data.name) > -1) {
                  dataArr.push(data)
                }
              })
            } else {
              dataArr = dataModel.cluster;
            }
            break;
          case 'device-cpu':
            selectedData = scope.dashboardModel.cpu.selectedData;
            if(Array.isArray(selectedData) && selectedData.length > 0) {
              dataModel.configDevices.forEach((data) => {
                if(selectedData.indexOf(data.name) > -1) {
                    dataArr.push(data)
                }
              })
            } else {
              dataArr = dataModel.configDevices;
            }
            break;
          case 'device-memory':
            selectedData = scope.dashboardModel.memory.selectedData;
            if(Array.isArray(selectedData) && selectedData.length > 0) {
              dataModel.configDevices.forEach((data) => {
                if(selectedData.indexOf(data.name) > -1) {
                  dataArr.push(data)
                }
              })
            } else {
              dataArr = dataModel.configDevices;
            }
            break;
          case 'device-disk':
            selectedData = scope.dashboardModel.disk.selectedData;
            if(Array.isArray(selectedData) && selectedData.length > 0) {
              dataModel.configDevices.forEach((data) => {
                if(selectedData.indexOf(data.name) > -1) {
                  dataArr.push(data)
                }
              })
            } else {
              dataArr = dataModel.configDevices;
            }
            break;
          default:
            dataArr = dataModel.configDevices;
        }
    
      return dataArr;
    }

    let getSwtAndPortName = (deviceId, portNo) =>{
      return getPortName(deviceId, portNo) + '(' +  getSwtName(deviceId) +')';
    };

    let getSwtName = (deviceid) =>{
      let device = this.di._.find(dataModel['devices'], { 'id': deviceid});
      return device['name']||device['switch_name'];
    };

    let getPortName = (deviceid, portNo) =>{
      let port = this.di._.find(dataModel['ports'], { 'element': deviceid, 'port': String(portNo)});
      // if(port)
      return port && port['annotations']['portName'] || '';
    };
  
    let getISODate = (date) => {
        return date.getUTCFullYear() +
            '-' + pad( date.getUTCMonth() + 1 ) +
            '-' + pad( date.getUTCDate() ) +
            'T' + pad( date.getUTCHours() ) +
            ':' + pad( date.getUTCMinutes() ) +
            ':00'  +
            'Z';
    }
  
    let formatLocalTime = (time) => {
      let _fillInt= (num, count)=>{
        if(!count){
          count = 2;
        }
        let numStr = num + '';
        if(numStr.length !== count) {
          return '0'.repeat(count - numStr.length) + numStr
        } else
          return num
      };
    
      let d = new Date(time);
      let res = _fillInt(d.getHours()) +  ':' +
        _fillInt(d.getMinutes()) + ':' +
        _fillInt(d.getSeconds()) + ' ' +
        _fillInt(d.getDate()) + '/' +
        _fillInt(d.getMonth() + 1)
    
      return res
    }
    
    let pad = (number) => {
        if ( number < 10 ) {
            return '0' + number;
        }
        return number;
    }
    
    this.init_application_license().then(()=>{
      init();
    });
  
    let clusterCpuTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.controller.cpu.begin_time', 'dashboardModel.controller.cpu.end_time', 'dashboardModel.controller.cpu.selectedData'], () => {
      if(!clusterCpuTimeHasChanged) {
        clusterCpuTimeHasChanged = true;
        return;
      }

      DI.$scope.dashboardModel.controller.cpu.loading = true;
      this.getClustersCPUAnalyzer(getFilteredDataModel('controller-cpu')).then(() => {
        //cpu analyzer
        DI.$scope.dashboardModel.controller.cpu.loading = false;
        if(scope.dashboardModel.controller.cpu.isRealtime) {
          setRealtimeClusterCPUChartData();
        } else {
          setClusterCPUChartData();
        }
      });
    },true));

    let clusterMemoryTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.controller.memory.begin_time', 'dashboardModel.controller.memory.end_time', 'dashboardModel.controller.memory.selectedData'], () => {
      if(!clusterMemoryTimeHasChanged) {
          clusterMemoryTimeHasChanged = true;
          return;
      }

      DI.$scope.dashboardModel.controller.memory.loading = true;
      this.getClustersMemoryAnalyzer(getFilteredDataModel('controller-memory')).then(() => {
        // memory analyzer
        DI.$scope.dashboardModel.controller.memory.loading = false;
        if(scope.dashboardModel.controller.memory.isRealtime) {
          setRealtimeClusterMemoryChartData();
        } else {
          setClusterMemoryChartData();
        }
      });
    },true));

    let clusterInterfaceTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.controller.interface.begin_time', 'dashboardModel.controller.interface.end_time', 'dashboardModel.controller.interface.selectedData'], () => {
      if(!clusterInterfaceTimeHasChanged) {
        clusterInterfaceTimeHasChanged = true;
        return;
      }

      DI.$scope.dashboardModel.controller.interface.loading = true;
      this.getClustersInterfaceAnalyzer(getFilteredDataModel('controller-interface')).then(() => {
        // interface analyzer
        DI.$scope.dashboardModel.controller.interface.loading = false;
        if(scope.dashboardModel.controller.interface.isRealtime) {
          setRealtimeClusterInterfaceChartData();
        } else {
          setClusterInterfaceChartData();
        }
      });
    },true));

    let clusterInterfaceTypeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.controller.interface.unitTypeOption', 'dashboardModel.controller.interface.stateTypeOption'], () => {
      if(!clusterInterfaceTypeHasChanged) {
        clusterInterfaceTypeHasChanged = true;
        return;
      }

      setClusterInterfaceChartData();
    },true));
  
    let cpuTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.cpu.begin_time', 'dashboardModel.cpu.end_time', 'dashboardModel.cpu.selectedData'], () => {
      if(!cpuTimeHasChanged) {
        cpuTimeHasChanged = true;
        return;
      }

      DI.$scope.dashboardModel.cpu.loading = true;
      this.getDevicesCPUAnalyzer(getFilteredDataModel('device-cpu')).then(() => {
        // cpu analyzer
        DI.$scope.dashboardModel.cpu.loading = false;
        if(scope.dashboardModel.cpu.isRealtime) {
          setRealtimeSwitchCpuChartData();
        } else {
          setSwitchCpuChartData();
        }
      });
    },true));

    let memoryTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.memory.begin_time', 'dashboardModel.memory.end_time', 'dashboardModel.memory.selectedData'], () => {
      if(!memoryTimeHasChanged) {
          memoryTimeHasChanged = true;
        return;
      }

      DI.$scope.dashboardModel.memory.loading = true;
      this.getDevicesMemoryAnalyzer(getFilteredDataModel('device-memory')).then(() => {
        //memory analyzer
        DI.$scope.dashboardModel.memory.loading = false;
        if(scope.dashboardModel.memory.isRealtime) {
          setRealtimeSwitchMemoryChartData();
        } else {
          setSwitchMemoryChartData();
        }
      });
    },true));

    let diskTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.disk.begin_time', 'dashboardModel.disk.end_time', 'dashboardModel.disk.selectedData'], () => {
      if(!diskTimeHasChanged) {
        diskTimeHasChanged = true;
        return;
      }

      this.getDevicesDiskAnalyzer(getFilteredDataModel('device-disk')).then(() => {
        //disk analyzer
        setSwitchDiskChartData();
      });
    },true));

    let interfaceTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.interface.begin_time', 'dashboardModel.interface.end_time'], () => {
      if(!interfaceTimeHasChanged) {
        interfaceTimeHasChanged = true;
        return;
      }

      DI.$scope.dashboardModel.interface.loading = true;
      this.getDevicesInterfaceAnalyzer(getFilteredDataModel(), true).then(() => {
        // device interface analyzer
        DI.$scope.dashboardModel.interface.loading = false;
        if(scope.dashboardModel.interface.isRealtime) {
          setRealtimeDeviceInterfaceRxTxChartData();
        } else {
          setDeviceInterfaceRxTxChartData();
        }
      });
    },true));

    let dropErrorInterfaceTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.dropErrorInterface.begin_time', 'dashboardModel.dropErrorInterface.end_time'], () => {
      if(!dropErrorInterfaceTimeHasChanged) {
        dropErrorInterfaceTimeHasChanged = true;
        return;
      }

      DI.$scope.dashboardModel.dropErrorInterface.loading = true;
      this.getDevicesInterfaceAnalyzer(getFilteredDataModel(), false, true).then(() => {
        // device interface analyzer
        DI.$scope.dashboardModel.dropErrorInterface.loading = false;
        setDeviceInterfaceDropErrorChartData();
      });
    },true));

    let deviceInterfaceTypeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.interface.typeOption'], () => {
      if(!deviceInterfaceTypeHasChanged) {
        deviceInterfaceTypeHasChanged = true;
        return;
      }

      setDeviceInterfaceRxTxChartData();
    },true));

    let deviceDropErrorInterfaceTypeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.dropErrorInterface.interface.typeOption'], () => {
      if(!deviceDropErrorInterfaceTypeHasChanged) {
        deviceDropErrorInterfaceTypeHasChanged = true;
        return;
      }

      setDeviceInterfaceDropErrorChartData();
    },true));


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
    let solution_second = this.di.$scope.dashboardModel.cpu.step;//3600;//this.getResolutionSecond(startTime, endTime);
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
      // get top5 cpu used rate
      this.di.$scope.dashboardModel.cpu.analyzer = this.getDevicesCPUChartData(arr);
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
    let solution_second = this.di.$scope.dashboardModel.memory.step;//3600;//this.getResolutionSecond(startTime, endTime);
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
      this.di.$scope.dashboardModel.memory.analyzer = this.getDevicesMemoryChartData(arr);
      deffe.resolve();
    });
    return deffe.promise;
  }

  getDevicesDiskAnalyzer(devices) {
    let deffe = this.di.$q.defer();

    let startTime = this.getISODate(this.di.$scope.dashboardModel.disk.begin_time);
    let endTime = this.getISODate(this.di.$scope.dashboardModel.disk.end_time);
    let solution_second = this.di.$scope.dashboardModel.disk.step;//3600;//this.getResolutionSecond(startTime, endTime);
    let deferredArr = [];

    devices.forEach((device) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.getDeviceDiskAnalyzer(device.name, startTime, endTime, solution_second)
        .then((data) => {
          defer.resolve({'id': device.id, 'name': device.name, 'analyzer': data});
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then((arr) => {
      this.di.$scope.dashboardModel.disk.analyzer = this.getDevicesDiskChartData(arr);
      deffe.resolve();
    });
    return deffe.promise;
  }

  getDevicesCPUChartData(analyzers) {
    // get top5 data
    analyzers.forEach((device, index) => {
      if (device.name) {
        let data = [], deviceObj = {};
        device.analyzer.forEach((record) =>{
          let utilize = 100 - record.idle_percent;//.toFixed(1)
          data.push(utilize);
        });
        device['avarage'] = data.length > 0 ? (this.di._.sum(data)/data.length) : 0;
        device['data'] = data.map(item => item.toFixed(2));
      }
    });
    let devices = this.di._.orderBy(analyzers, 'avarage', 'desc');
    return devices.slice(0, 5);
  }

  getDevicesMemoryChartData(analyzers) {
    // get top5 data
    analyzers.forEach((device) => {
      if (device.name) {
        let data = [];
        device.analyzer.forEach((record) =>{
          let utilize = record.used_percent;
          data.push(utilize);
        });
        device['avarage'] = data.length > 0 ? (this.di._.sum(data)/data.length) : 0;
        device['data'] = data.map(item => item.toFixed(2));
      }
    });
    let devices = this.di._.orderBy(analyzers, 'avarage', 'desc');
    return devices.slice(0, 5);
  }

  // getDevicesDiskChartData(analyzers) {
  //   analyzers.forEach((device) => {
  //     if (device.name) {
  //       let data = [], deviceObj = {};
  //       device.analyzer.forEach((record) =>{
  //         let utilize = record.used_percent;
  //         data.push(utilize);
  //       });
  //       device['avarage'] = data.length > 0 ? (this.di._.sum(data)/data.length) : 0;
  //       device['data'] = data.map(item => item.toFixed(2));
  //     }
  //   });
  //   let devices = this.di._.orderBy(analyzers, 'avarage', 'desc');
  //   return devices.slice(0, 5);
  // }

  getDevicesDiskChartData(analyzers) {
    // 1.only get the latest data of every device
    analyzers.forEach((device) => {
      if (device.analyzer.length > 0) {
        let analyzerArr = this.di._.orderBy(device.analyzer, 'timepoint', 'desc');
        Object.assign(device, analyzerArr[0])
      } else {
        device.timepoint = this.getISODate(new Date());
        device.used_percent = 0;
        device.free_percent = 0;
        device.reserved_percent = 0;
      }

      delete device.analyzer;
    })

    // 2.get the top5 data
    let devices = this.di._.orderBy(analyzers, 'used_percent', 'desc');
    return devices.slice(0, 5);
  }

  getCPUMemoryTimeSeries(device) {
    let timeseries = [];
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
      ':' + this.pad( date.getUTCSeconds() ) +
      'Z';
  }

  pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
  }

  getFormatedDateTime(date) {
    let _fillInt = (num, count) => {
      if(!count){
        count = 2;
      }
      let numStr = num + '';
      if(numStr.length !== count) {
        return '0'.repeat(count - numStr.length) + numStr
      } else
        return num
    };

    let res = date.getFullYear() +
      '-' + _fillInt(date.getMonth() + 1) +
      '-' + _fillInt(date.getDate()) +
      ' ' + _fillInt(date.getHours()) +
      ':' + _fillInt(date.getMinutes()) +
      ':' + _fillInt(date.getSeconds());

    return res
  }

  getFormattedNumber(num) {
    let numArr = num.toString().split('');
    let formattedNum = '';

    if(num >= 0) {
      let numLength = numArr.length;
      let diffCount = numLength % 3;
      for(let i = 1; i <= numLength; i++) {
        formattedNum += numArr[i-1];

        if((i - diffCount) % 3 == 0 && i < numLength) {
          formattedNum += ','
        }
      }
    } else {
      let numLength = numArr.length - 1;
      let diffCount = numLength % 3;
      for(let i = 2; i <= numLength; i++) {
        formattedNum += numArr[i-1];

        if((i - diffCount) % 3 == 0 && i < numLength) {
          formattedNum += ','
        }
      }

      formattedNum = parseInt(formattedNum) * -1;
    }


    return formattedNum;
  }

  getClusterCPUMemoryStatisticFromLS(clusters) {
    //10分钟以内不重复获取
    let defer = this.di.$q.defer();
    this.di.localStoreService.getStorage(this.CLUSTERS_CPU_MEMORY_STATISTIC_NS).get('timestamp')
      .then((data) => {
        if(data) {
          let time = (Date.now() - data) - 10*60*1000;
           //超时，重新获取数据
          if (time >= 0) {
            this.di.localStoreService.getStorage(this.CLUSTERS_CPU_MEMORY_STATISTIC_NS).del('timestamp')
              .then(() => {
                let defers = [];
                defers.push(this.getClustersCPUAnalyzer(clusters));
                defers.push(this.getClustersMemoryAnalyzer(clusters));
                this.di.$q.all(defers).then(() => {
                  this.di.localStoreService.getStorage(this.CLUSTERS_CPU_MEMORY_STATISTIC_NS)
                    .set('timestamp', Date.now());
                  this.di.localStoreService.getStorage(this.CLUSTERS_CPU_MEMORY_STATISTIC_NS)
                    .set('cpu_memory', {
                      'cpu': this.di.$scope.dashboardModel.controller.cpu.analyzer,
                      'memory': this.di.$scope.dashboardModel.controller.memory.analyzer
                    });
                  defer.resolve();
                });
              });
          }
          else {
            this.di.localStoreService.getStorage(this.CLUSTERS_CPU_MEMORY_STATISTIC_NS).get('cpu_memory')
              .then((data) => {
                this.di.$scope.dashboardModel.controller.cpu.analyzer = data.cpu;
                this.di.$scope.dashboardModel.controller.memory.analyzer = data.memory;
                defer.resolve();
              });
          }
        }
        else {
          let defers = [];
          defers.push(this.getClustersCPUAnalyzer(clusters));
          defers.push(this.getClustersMemoryAnalyzer(clusters));
          this.di.$q.all(defers).then(() => {
            this.di.localStoreService.getStorage(this.CLUSTERS_CPU_MEMORY_STATISTIC_NS)
              .set('timestamp', Date.now());
            this.di.localStoreService.getStorage(this.CLUSTERS_CPU_MEMORY_STATISTIC_NS)
              .set('cpu_memory', {
                'cpu': this.di.$scope.dashboardModel.controller.cpu.analyzer,
                'memory': this.di.$scope.dashboardModel.controller.memory.analyzer
              });
            defer.resolve();
          });
        }
      });
    return defer.promise;  
  }

  getClustersCPUAnalyzer(clusters) {
    let deffe = this.di.$q.defer();
    if (!clusters.length){
      deffe.resolve([]);
      return deffe.promise;
    }
    let startTime = this.getISODate(this.di.$scope.dashboardModel.controller.cpu.begin_time);
    let endTime = this.getISODate(this.di.$scope.dashboardModel.controller.cpu.end_time);
    let solution_second = this.di.$scope.dashboardModel.controller.cpu.step;//3600;//this.getResolutionSecond(startTime, endTime);
    let deferredArr = [];
    clusters.forEach((cluster) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.getDeviceCPUAnalyzer(cluster.id, startTime, endTime, solution_second)
        .then((data) => {
          defer.resolve({'id': cluster.id, 'name': cluster.id, 'analyzer': data});
        });
      deferredArr.push(defer.promise);  
    });

    this.di.$q.all(deferredArr).then((arr) => {
      this.di.$scope.dashboardModel.controller.cpu.analyzer = arr;
      deffe.resolve();
    });
    return deffe.promise;
  }

  getClustersMemoryAnalyzer(clusters) {
    let deffe = this.di.$q.defer();
    if (!clusters.length){
      deffe.resolve([]);
      return deffe.promise;
    }
    let startTime = this.getISODate(this.di.$scope.dashboardModel.controller.memory.begin_time);
    let endTime = this.getISODate(this.di.$scope.dashboardModel.controller.memory.end_time);
    let solution_second = this.di.$scope.dashboardModel.controller.memory.step;//3600;//this.getResolutionSecond(startTime, endTime);
    let deferredArr = [];
    clusters.forEach((cluster) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.getDeviceMemoryAnalyzer(cluster.id, startTime, endTime, solution_second)
        .then((data) => {
          defer.resolve({'id': cluster.id, 'name': cluster.id, 'analyzer': data});
        });
      deferredArr.push(defer.promise);  
    });

    this.di.$q.all(deferredArr).then((arr) => {
      this.di.$scope.dashboardModel.controller.memory.analyzer = arr;
      deffe.resolve();
    });
    return deffe.promise;
  }

  getClustersInterfaceAnalyzer(clusters) {
    let deffe = this.di.$q.defer();
    if (!clusters.length){
      deffe.resolve([]);
      return deffe.promise;
    }
    let startTime = this.getISODate(this.di.$scope.dashboardModel.controller.interface.begin_time);
    let endTime = this.getISODate(this.di.$scope.dashboardModel.controller.interface.end_time);
    let solution_second = this.di.$scope.dashboardModel.controller.interface.step;//3600;//this.getResolutionSecond(startTime, endTime);
    let deferredArr = [];
    clusters.forEach((cluster) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.getClusterInteraceAnalyzer(cluster.id, startTime, endTime, solution_second)
        .then((data) => {
          defer.resolve({'id': cluster.id, 'name': cluster.id, 'analyzer': data});
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then((arr) => {
      this.di.$scope.dashboardModel.controller.interface.analyzer = this.calcInterfaceTxRxRate(arr);
      deffe.resolve();
    });
    return deffe.promise;
  }

  getDevicesInterfaceAnalyzer(devices, isNormal, isDropError) {
    let deffe = this.di.$q.defer();
    if (!devices.length){
      deffe.resolve([]);
      return deffe.promise;
    }
    let startTime = this.getISODate(this.di.$scope.dashboardModel.interface.begin_time);
    let endTime = this.getISODate(this.di.$scope.dashboardModel.interface.end_time);
    let solution_second = this.di.$scope.dashboardModel.interface.step;//3600;//this.getResolutionSecond(startTime, endTime);
    let deferredArr = [];
    devices.forEach((device) => {
      let defer = this.di.$q.defer();
      this.di.deviceDataManager.getDeviceInteraceAnalyzer(device.name, startTime, endTime, solution_second)
        .then((data) => {
          defer.resolve({'id': device.id, 'name': device.name, 'analyzer': data});
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then((arr) => {
      if(isNormal || !isDropError) {
        this.di.$scope.dashboardModel.interface.analyzer = arr;
      }

      if (isDropError || !isNormal) {
        this.di.$scope.dashboardModel.dropErrorInterface.analyzer = arr;
      }

      deffe.resolve();
    });
    return deffe.promise;
  }

  calcInterfaceTxRxRate(dataArr) {
    let resArr = [];
    dataArr.forEach((data) => {
      let newData = {};
      newData.id = data.id;
      newData.name = data.name;
      newData.analyzer = [];

      data.analyzer.forEach((analyzer, index) => {
        if(index > 0) {
          let newAnalyzer = {}

          let diffSeconds = ((new Date(analyzer.timepoint)).getTime() - (new Date(data.analyzer[index - 1].timepoint)).getTime()) / 1000;

          newAnalyzer.timepoint = analyzer.timepoint;
          if(analyzer.packetsReceived && data.analyzer[index - 1].packetsReceived && analyzer.packetsReceived >= data.analyzer[index - 1].packetsReceived) {
            newAnalyzer.packets_rx = Math.ceil((analyzer.packetsReceived - data.analyzer[index - 1].packetsReceived) / diffSeconds);
          } else {
            newAnalyzer.packets_rx = 0;
          }

          if(analyzer.packetsSent && data.analyzer[index - 1].packetsSent && analyzer.packetsSent >= data.analyzer[index - 1].packetsSent) {
            newAnalyzer.packets_tx = Math.ceil((analyzer.packetsSent - data.analyzer[index - 1].packetsSent) / diffSeconds);
          } else {
            newAnalyzer.packets_tx = 0;
          }

          if(analyzer.packetsRxDropped && data.analyzer[index - 1].packetsRxDropped && analyzer.packetsRxDropped >= data.analyzer[index - 1].packetsRxDropped) {
            newAnalyzer.dropped_rx = Math.ceil((analyzer.packetsRxDropped - data.analyzer[index - 1].packetsRxDropped) / diffSeconds);
          } else {
            newAnalyzer.dropped_rx = 0;
          }

          if(analyzer.packetsTxDropped && data.analyzer[index - 1].packetsTxDropped && analyzer.packetsTxDropped >= data.analyzer[index - 1].packetsTxDropped) {
            newAnalyzer.dropped_tx = Math.ceil((analyzer.packetsTxDropped - data.analyzer[index - 1].packetsTxDropped) / diffSeconds);
          } else {
            newAnalyzer.dropped_tx = 0;
          }

          if(analyzer.packetsRxErrors && data.analyzer[index - 1].packetsRxErrors && analyzer.packetsRxErrors >= data.analyzer[index - 1].packetsRxErrors) {
            newAnalyzer.error_rx = Math.ceil((analyzer.packetsRxErrors - data.analyzer[index - 1].packetsRxErrors) / diffSeconds);
          } else {
            newAnalyzer.error_rx = 0;
          }

          if(analyzer.packetsTxErrors && data.analyzer[index - 1].packetsTxErrors && data.analyzer[index - 1].packetsRxErrors >= data.analyzer[index - 1].packetsTxErrors) {
            newAnalyzer.error_tx = Math.ceil((analyzer.packetsTxErrors - data.analyzer[index - 1].packetsTxErrors) / diffSeconds);
          } else {
            newAnalyzer.error_tx = 0;
          }

          if(analyzer.bytesSent && data.analyzer[index - 1].bytesSent && analyzer.bytesSent >= data.analyzer[index - 1].bytesSent) {
            newAnalyzer.bytes_tx = Math.ceil((analyzer.bytesSent - data.analyzer[index - 1].bytesSent) / diffSeconds);
          } else {
            newAnalyzer.bytes_tx = 0;
          }

          if(analyzer.bytesReceived && data.analyzer[index - 1].bytesReceived && analyzer.bytesReceived >= data.analyzer[index - 1].bytesReceived) {
            newAnalyzer.bytes_rx = Math.ceil((analyzer.bytesReceived - data.analyzer[index - 1].bytesReceived) / diffSeconds);
          } else {
            newAnalyzer.bytes_rx = 0;
          }

          newData.analyzer.push(newAnalyzer);
        }
      })

      resArr.push(newData);
    })

    return resArr
  };

  init_application_license(){
    let defer = this.di.$q.defer();
    let scope = this.di.$scope;

    scope.isAnalyzeEnable = false;
    this.di.applicationService.getNocsysAppsState().then(()=>{
      let allState = this.di.applicationService.getAppsState();
      let ANALYZER_APP_NAME = 'com.nocsys.analyzer';
      if(allState[ANALYZER_APP_NAME] === 'ACTIVE'){
        scope.isAnalyzeEnable = true;
      }

      defer.resolve();
    },()=>{
      defer.resolve();
    });
    return defer.promise;
  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

