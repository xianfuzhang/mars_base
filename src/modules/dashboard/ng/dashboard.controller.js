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

    const chartService = this.di.chartService;
    const chartStyles = chartService.styles;
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
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
    let date = this.di.dateService.getTodayObject();
    let before = this.di.dateService.getBeforeDateObject(30*60*1000); // 前30分钟
    const GRID_NUM = 24; // chart grid number
    let begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
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
		    'step': 60,
		    'origin_begin_time': begin_time,
		    'origin_end_time': end_time,
		    'analyzer': [],
        selectedData: [],
	    },
	    memory: {
		    'begin_time': begin_time,
		    'end_time': end_time,
		    'step': 60,
		    'origin_begin_time': begin_time,
		    'origin_end_time': end_time,
		    'analyzer': [],
        selectedData: [],
        
	    },
	    controller: {
		    cpu: {
			    'begin_time': begin_time,
			    'end_time': end_time,
			    'step': 60,
			    'origin_begin_time': begin_time,
			    'origin_end_time': end_time,
			    'analyzer': [],
          selectedData: [],
		    },
		    memory: {
			    'begin_time': begin_time,
			    'end_time': end_time,
			    'step': 60,
			    'origin_begin_time': begin_time,
			    'origin_end_time': end_time,
			    'analyzer': [],
          selectedData: [],
		    },
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
			onClick: () => {}
	  }
	  this.di.$scope.clusterMemoryChartConfig = {
		  data: [],
		  labels: [],
			options: {},
		  series: [],
			onClick: () => {}
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
			onClick: () => {}
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
	  this.di.$scope.interfaceRxTxPackagesChartConfig = {
		  data: [],
		  labels: [],
		  options: {},
		  colors: []
	  }
	  this.di.$scope.interfaceDropPackagesChartConfig = {
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
    }
	
    this.di.$scope.chartSetting = (type) => {
    	let chartDataArr = [], selectedData = [];
	    let analyzer = [];
	    let records = [];
	    let beginTime, endTime;
	    switch(type) {
		    case 'controller-cpu':
			    analyzer = this.di.$scope.dashboardModel.controller.cpu.analyzer;
			
			    analyzer.forEach((controller) => {
				    chartDataArr.push(controller.name);
			    });
			
			    beginTime = this.di.$scope.dashboardModel.controller.cpu.begin_time;
			    endTime = this.di.$scope.dashboardModel.controller.cpu.end_time;
          selectedData = this.di.$scope.dashboardModel.controller.cpu.selectedData;
		    	break;
		    case 'controller-memory':
			    analyzer = this.di.$scope.dashboardModel.controller.memory.analyzer;
			
			    analyzer.forEach((controller) => {
				    chartDataArr.push(controller.name);
			    });
			
			    beginTime = this.di.$scope.dashboardModel.controller.memory.begin_time;
			    endTime = this.di.$scope.dashboardModel.controller.memory.end_time;
          selectedData = this.di.$scope.dashboardModel.controller.memory.selectedData;
			    break;
		    case 'device-cpu':
			    analyzer = this.di.$scope.dashboardModel.cpu.analyzer;
			    records = this.getDevicesCPUChartData(analyzer);
			
			    if(records.length) {
				    records.forEach((item, index) =>{
					    chartDataArr.push(item.name);
				    });
			    }
			
			    beginTime = this.di.$scope.dashboardModel.cpu.begin_time;
			    endTime = this.di.$scope.dashboardModel.cpu.end_time;
          selectedData = this.di.$scope.dashboardModel.cpu.selectedData;
			    break;
		    case 'device-memory':
			    analyzer = this.di.$scope.dashboardModel.memory.analyzer;
			    records = this.getDevicesMemoryChartData(analyzer);
			    if(records.length) {
				    records.forEach((item, index) =>{
					    chartDataArr.push(item.name)
				    })
			    }
			
			    beginTime = this.di.$scope.dashboardModel.memory.begin_time;
			    endTime = this.di.$scope.dashboardModel.memory.end_time;
          selectedData = this.di.$scope.dashboardModel.memory.selectedData;
			    break;
	    }
	    
	    this.di.modalManager.open({
		    template: require('../template/chart_setting.html'),
		    controller: 'showChartSettingCtrl',
		    windowClass: 'show-chart-setting-modal',
		    resolve: {
			    dataModel: () => {
			    	return {
			    		chartType: type,
					    chartDataArr: chartDataArr,
              selectedData: selectedData,
					    beginTime: beginTime,
					    endTime: endTime
				    }
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
					}
		    }
	    });
    }
    
    const di = this.di;

    let init =() =>{
      let promises = [];
      let clusterDefer = this.di.$q.defer(),
        devicesDefer = this.di.$q.defer(),
        portsDefer = this.di.$q.defer(),
        clusterStaticsDefer = this.di.$q.defer(),
        swtStaticsDefer = this.di.$q.defer();

      this.di.dashboardDataManager.getCluster().then((res)=>{
        dataModel['cluster'] = res;
        if(this.di.$scope.isAnalyzeEnable){
          this.getClusterCPUMemoryStatisticFromLS(res).then(() => {
            clusterDefer.resolve();
          });
        } else {
          clusterDefer.resolve();
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
          if(this.di.$scope.isAnalyzeEnable){
            this.getSwitchesCPUMemoryStatisticFromLS(configs).then(() => {
              devicesDefer.resolve();
            });
          } else {
            devicesDefer.resolve();
          }

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

      // this.di.$rootScope.$emit('start_loading');
      this.di.$scope.panelLoading.controller = true;
      this.di.$scope.panelLoading.switch = false;

      Promise.all(promises).then(()=>{
        let DI = this.di;
        convertData2View();
        DI.$scope.$apply();
        // DI.$rootScope.$emit('stop_loading');
        DI.$scope.panelRefresh.controller = true;
        DI.$scope.panelLoading.controller = false;
        DI.$scope.$apply();
      });
    };
    
    function convertData2View() {
      convertControllerData();
      convertSwitchData();
      convertSwitchInterface2Chart();
      if(di.$scope.isAnalyzeEnable) {
	      setClusterCPUChartData();
	      setClusterMemoryChartData();
	      setSwitchCpuChartData();
	      setSwitchMemoryChartData();
      }
    }
	
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
				  data.push((item.user_percent + item.system_percent).toFixed(2))
			  });
			  dataArr.push(data);
			  series.push(controller.name);
		  });
		
		  const pad = this.pad;
		  let options = {
			  title: {
				  display: true,
					text: '控制器cpu使用率',
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
			  // Container for zoom options
			  zoom: {
				  onZoom: lineChartOnZoom('cluster-cpu-chart')
			  }
		  };
		  this.di.$scope.clusterCpuChartConfig.data = dataArr;
		  this.di.$scope.clusterCpuChartConfig.labels = labelsArr;
		  this.di.$scope.clusterCpuChartConfig.options = options;
		  this.di.$scope.clusterCpuChartConfig.series = series;
		  this.di.$scope.clusterCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.controller.cpu.analyzer, scope.clusterCpuPieChartConfig);
		  this.di.$scope.clusterCpuChartConfig.onHover = lineChartOnHover();
		
		  // set pie chart data with first dataset and first data
		  if(dataArr.length > 0 && labelsArr.length > 0) {
			  let xLabel = labelsArr[0];
			  let data = analyzer[0].analyzer[0]
			  let title = analyzer[0].name + ' - ' + formatLocalTime(xLabel);
			
			  setCpuPieChartData(data,title,this.di.$scope.clusterCpuPieChartConfig)
		  }
		  
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
	        text: '控制器内存使用率',
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
		  this.di.$scope.clusterMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.controller.memory.analyzer, scope.clusterMemoryPieChartConfig);
		  this.di.$scope.clusterMemoryChartConfig.onHover = lineChartOnHover();
		
		  if(dataArr.length > 0 && labelsArr.length > 0) {
			  let xLabel = labelsArr[0];
			  let data = analyzer[0].analyzer[0];
			  let title = analyzer[0].name + ' - ' + formatLocalTime(xLabel)
			
			  setMemoryPieChartData(data, title, this.di.$scope.clusterMemoryPieChartConfig)
		  }
	  };
	  
	  let setSwitchCpuChartData = () => {
		  //cpu analyzer
		  let dataArr = [];
		  let series = [];
		  let analyzer = this.di.$scope.dashboardModel.cpu.analyzer;
		  let records = this.getDevicesCPUChartData(analyzer);
		  let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
		  let labelsArr = analyzer.length > 0 ?
			  this.getCPUMemoryTimeSeries(x_times) : [];
		
		  if(records.length) {
			  records.forEach((item, index) =>{
				  dataArr.push(item.data);
				  series.push(item.name);
			  });
		  }
		  
		  const pad = this.pad;
		  let options = {
			  title: {
				  display: true,
				  text: '交换机cpu使用率',
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
		  this.di.$scope.switchCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.cpu.analyzer, scope.switchCpuPieChartConfig);
		  this.di.$scope.switchCpuChartConfig.onHover = lineChartOnHover();
		
		  if(dataArr.length > 0 && labelsArr.length > 0) {
			  let xLabel = labelsArr[0];
			  let data = analyzer[0].analyzer[0];
			  let title = analyzer[0].name + ' - ' + formatLocalTime(xLabel)
			
			  setCpuPieChartData(data, title, this.di.$scope.switchCpuPieChartConfig)
		  }
	  };
	
	  let setSwitchMemoryChartData = () => {
		  //memory analyzer
		  let dataArr = [];
		  let series = [];
		  let analyzer = this.di.$scope.dashboardModel.memory.analyzer;
		  let records = this.getDevicesMemoryChartData(analyzer);
		  let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
		  let labelsArr = analyzer.length > 0 ?
			  this.getCPUMemoryTimeSeries(x_times) : [];
		
		  let index = 0;
		  if(records.length) {
			  records.forEach((item, index) =>{
				  dataArr.push(item.data);
				  series.push(item.name)
			  })
		  }
		
		  const pad = this.pad;
		  const scope = this.di.$scope;
		  
		  let options = {
			  title: {
				  display: true,
					  text: '交换机内存使用率',
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
				zoom: {
				  // Boolean to enable zooming
				  enabled: true,
				  // Drag-to-zoom rectangle style can be customized
				  backgroundColor: 'rgb(225,225,225,0.3)',
				  // Zooming directions. Remove the appropriate direction to disable
				  mode: 'x',
				  // Useful for dynamic data loading
				  onZoom: lineChartOnZoom('switch-memory-chart')
			  }
		  };
		  
		  this.di.$scope.switchMemoryChartConfig.data = dataArr;
		  this.di.$scope.switchMemoryChartConfig.labels = labelsArr;
		  this.di.$scope.switchMemoryChartConfig.options = options;
		  this.di.$scope.switchMemoryChartConfig.series = series;
		  this.di.$scope.switchMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.memory.analyzer, scope.switchMemoryPieChartConfig);
		  this.di.$scope.switchMemoryChartConfig.onHover = lineChartOnHover();
		
		  if(dataArr.length > 0 && labelsArr.length > 0){
			  let xLabel = labelsArr[0];
			  let data = analyzer[0].analyzer[0];
			  let title = analyzer[0].name + ' - ' + formatLocalTime(xLabel)
			
			  setMemoryPieChartData(data, title, this.di.$scope.switchMemoryPieChartConfig)
		  }
	  };
	
	  let setInterfaceRxTxChartData = (dataArr, chartId, y_label, drop) => {
		  let category= [], rxs = [], pkgRecv = [], pgkSend = [], title, labelsArr = [];
		  this.di._.forEach(dataArr, (statistic)=>{
			  let name = getSwtAndPortName(statistic['device'], statistic['port']);
			  labelsArr.push(name);
			  if (y_label === 'packages') {
				  if (drop) {
					  pkgRecv.push(statistic['packetsRxDropped']);
					  pgkSend.push(statistic['packetsTxDropped']);
					
					  title = '端口丢包';
				  }
				  else {
					  pkgRecv.push(statistic['packetsReceived']);
					  pgkSend.push(statistic['packetsSent']);
					
					  title = '端口收发包';
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
				  text: title
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
						  // callback: function(value, index, values) {
						  //   return value.toFixed(2) + '%';
						  // }
					  }
				  }],
					xAxes: [{
					  stacked: true,
            barThickness: 40,
				  }],
			  },
		  }
		  
		  if(drop) {
			  scope.interfaceDropPackagesChartConfig.data = [pkgRecv, pgkSend];
			  scope.interfaceDropPackagesChartConfig.labels = labelsArr;
			  scope.interfaceDropPackagesChartConfig.series = ['接收', '发送'];
			  scope.interfaceDropPackagesChartConfig.colors = [{backgroundColor: 'rgb(0,0,255)'}, {backgroundColor: 'rgb(250,128,114)'}];
			  scope.interfaceDropPackagesChartConfig.options = options;
		  } else {
			  scope.interfaceRxTxPackagesChartConfig.data = [pkgRecv, pgkSend];
			  scope.interfaceRxTxPackagesChartConfig.labels = labelsArr;
			  scope.interfaceRxTxPackagesChartConfig.series = ['接收', '发送'];
			  scope.interfaceRxTxPackagesChartConfig.colors = [{backgroundColor: 'rgb(0,0,255)'}, {backgroundColor: 'rgb(250,128,114)'}];
			  scope.interfaceRxTxPackagesChartConfig.options = options;
		  }
	  };
	
	  let cpuChartOnClick = function(analyzer, pieChartModel) {
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
				  
				  setCpuPieChartData(data, title, pieChartModel)
				  
				  scope.$apply();
			  }
		  }
	  }
	  
	  let memoryChartOnClick = function(analyzer, pieChartModel) {
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
				
					setMemoryPieChartData(data, title, pieChartModel)
				
				  scope.$apply();
			  }
		  }
	  }
	  
	  let setCpuPieChartData = (data, title, pieChartConfig) => {
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
			  plugins: {
				  deferred: {
					  yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
					  delay: 2000      // delay of 500 ms after the canvas is considered inside the viewport
				  }
			  },
			  title: {
				  text: title,
			  }
		  }
		
		  pieChartConfig.data = dataset.data;
		  pieChartConfig.labels = chartData.labels;
		  pieChartConfig.colors = dataset.backgroundColor;
		  pieChartConfig.options = pieOptions;
	  }
	
	  let setMemoryPieChartData = (data, title, pieChartConfig) => {
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
			  plugins: {
				  deferred: {
					  yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
					  delay: 2000      // delay of 500 ms after the canvas is considered inside the viewport
				  }
			  },
			  title: {
				  text: title,
			  }
		  }
		
		  pieChartConfig.data = dataset.data;
		  pieChartConfig.labels = chartData.labels;
		  pieChartConfig.colors = dataset.backgroundColor;
		  pieChartConfig.options = options;
	  }
	  
	  let lineChartOnHover = function() {
		  return function(event, chart) {
			  // 1.element hover event
			  let element = chart.getElementAtEvent(event);
			  if(element.length > 0)
			  {
				  let index = element[0]._index;
			  }
			
			  // 2.recover line style when click the grid area
			  const box = chart.boxes[0];
			  let minTop = 0;
			  if(box.position == 'bottom') {
				  box.legendHitBoxes.forEach((item, index) => {
					  if(index == 0 || minTop > item.top) {
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
			
			  let start = new Date(getISODate(new Date(ticks[startIndex])));
			  let startTime = start.getTime();
			  let end = new Date(getISODate(new Date(ticks[endIndex])));
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
      // let packagesOrder = this.di._.orderBy(waitOrderPortsStatistics, p_r_s, 'desc');
	    let packagesOrder = this.di._.filter(waitOrderPortsStatistics, (val) => {
	      return val['packetsRecvSent'] > 0;
	    });
      // packagesOrder.splice(5, packagesOrder.length-5);
      // chartSwtInterface(packagesOrder, 'swtInterfaceRxTxPackages', 'packages');
	    setInterfaceRxTxChartData(packagesOrder, 'interface-rxtx-packages', 'packages');

      /*let b_r_s = 'bytesRecvSent';
      let bytesOrder = this.di._.orderBy(waitOrderPortsStatistics, b_r_s, 'desc');
      bytesOrder.splice(5, bytesOrder.length-5);
      chartSwtInterface(bytesOrder, 'swtInterfaceRxTxBytes', 'bytes');*/

      let p_d = 'packetsDrop';
      // let packagesDropOrder = this.di._.orderBy(waitOrderPortsStatistics, p_d, 'desc');
	    let packagesDropOrder = this.di._.filter(waitOrderPortsStatistics, (val) => {
		    return val['packetsDrop'] > 0;
	    });
      // packagesDropOrder.splice(5, packagesDropOrder.length-5);
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
		
		  this.getClustersCPUAnalyzer(getFilteredDataModel('controller-cpu')).then(() => {
			  //memory analyzer
			  let dataArr = [];
			  let records = this.getDevicesCPUChartData(this.di.$scope.dashboardModel.controller.cpu.analyzer);
			
			  if(records.length) {
				  records.forEach((item, index) =>{
					  dataArr.push(item.data)
				  })
			  }
			
			  let start = this.di.$scope.dashboardModel.controller.cpu.begin_time.getTime();
			  let end = this.di.$scope.dashboardModel.controller.cpu.end_time.getTime();
			  let step = this.di.$scope.dashboardModel.controller.cpu.step * 1000;
			
			  //update chart with new data
			  let labels = [];
			  let curTime = 0;
			  for(let i = 0; curTime <= end; i++) {
				  curTime = start + step * i;
				  labels.push((new Date(curTime)).toISOString());
			  }
			
			  this.di.$scope.clusterCpuChartConfig.data = dataArr;
			  this.di.$scope.clusterCpuChartConfig.labels = labels;
			  this.di.$scope.clusterCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.controller.cpu.analyzer, scope.clusterCpuPieChartConfig);
			
			  // set pie chart data with first dataset and first data
			  if(dataArr.length > 0 && labels.length > 0) {
				  let xLabel = labels[0];
				  let data = scope.dashboardModel.controller.cpu.analyzer[0].analyzer[0]
				  let title = scope.dashboardModel.controller.cpu.analyzer[0].name + ' - ' + formatLocalTime(xLabel);
				
				  setCpuPieChartData(data,title,scope.clusterCpuPieChartConfig)
			  }
		  });
	  },true));
	
	  let clusterMemoryTimeHasChanged = false;
	  unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.controller.memory.begin_time', 'dashboardModel.controller.memory.end_time', 'dashboardModel.controller.memory.selectedData'], () => {
		  if(!clusterMemoryTimeHasChanged) {
			  clusterMemoryTimeHasChanged = true;
			  return;
		  }
		
		  this.getClustersMemoryAnalyzer(getFilteredDataModel('controller-memory')).then(() => {
			  //memory analyzer
			  let dataArr = [];
			  let records = this.getDevicesMemoryChartData(this.di.$scope.dashboardModel.controller.memory.analyzer);
			
			  if(records.length) {
				  records.forEach((item, index) =>{
					  dataArr.push(item.data)
				  })
			  }
			
			  let start = this.di.$scope.dashboardModel.controller.memory.begin_time.getTime();
			  let end = this.di.$scope.dashboardModel.controller.memory.end_time.getTime();
			  let step = this.di.$scope.dashboardModel.controller.memory.step * 1000;
			
			  //update chart with new data
			  let labels = [];
			  let curTime = 0;
			  for(let i = 0; curTime <= end; i++) {
				  curTime = start + step * i;
				  labels.push((new Date(curTime)).toISOString());
			  }
			
			  this.di.$scope.clusterMemoryChartConfig.data = dataArr;
			  this.di.$scope.clusterMemoryChartConfig.labels = labels;
			  this.di.$scope.clusterMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.controller.memory.analyzer, scope.clusterMemoryPieChartConfig);
			
			  if(dataArr.length > 0 && labels.length > 0) {
				  let xLabel = labels[0];
				  let data = scope.dashboardModel.controller.memory.analyzer[0].analyzer[0];
				  let title = scope.dashboardModel.controller.memory.analyzer[0].name + ' - ' + formatLocalTime(xLabel)
				
				  setMemoryPieChartData(data, title, scope.clusterMemoryPieChartConfig)
			  }
		  });
	  },true));
	
	  let cpuTimeHasChanged = false;
	  unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.cpu.begin_time', 'dashboardModel.cpu.end_time', 'dashboardModel.cpu.selectedData'], () => {
		  if(!cpuTimeHasChanged) {
			  cpuTimeHasChanged = true;
			  return;
		  }
		
		  this.getDevicesCPUAnalyzer(getFilteredDataModel('device-cpu')).then(() => {
			  //memory analyzer
			  let dataArr = [];
			  let records = this.getDevicesCPUChartData(this.di.$scope.dashboardModel.cpu.analyzer);
			
			  if(records.length) {
				  records.forEach((item, index) =>{
					  dataArr.push(item.data)
				  })
			  }
			
			  let start = this.di.$scope.dashboardModel.cpu.begin_time.getTime();
			  let end = this.di.$scope.dashboardModel.cpu.end_time.getTime();
			  let step = this.di.$scope.dashboardModel.cpu.step * 1000;
			
			  //update chart with new data
			  let labels = [];
			  let curTime = 0;
			  for(let i = 0; curTime <= end; i++) {
				  curTime = start + step * i;
				  labels.push((new Date(curTime)).toISOString());
			  }
			
			  this.di.$scope.switchCpuChartConfig.data = dataArr;
			  this.di.$scope.switchCpuChartConfig.labels = labels;
			  this.di.$scope.switchCpuChartConfig.onClick = cpuChartOnClick(scope.dashboardModel.cpu.analyzer, scope.switchCpuPieChartConfig);
			
			  if(dataArr.length > 0 && labels.length > 0) {
				  let xLabel = labels[0];
				  let data = scope.dashboardModel.cpu.analyzer[0].analyzer[0];
				  let title = scope.dashboardModel.cpu.analyzer[0].name + ' - ' + formatLocalTime(xLabel)
				
				  setCpuPieChartData(data, title, this.di.$scope.switchCpuPieChartConfig)
			  }
		  });
	  },true));
	  
    let memoryTimeHasChanged = false;
	  unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.memory.begin_time', 'dashboardModel.memory.end_time', 'dashboardModel.memory.selectedData'], () => {
		  if(!memoryTimeHasChanged) {
			  memoryTimeHasChanged = true;
		  	return;
		  }
		
	  	this.getDevicesMemoryAnalyzer(getFilteredDataModel('device-memory')).then(() => {
			  //memory analyzer
			  let dataArr = [];
			  let records = this.getDevicesMemoryChartData(this.di.$scope.dashboardModel.memory.analyzer);
			
			  if(records.length) {
				  records.forEach((item, index) =>{
					  dataArr.push(item.data)
				  })
			  }
			
			  let start = this.di.$scope.dashboardModel.memory.begin_time.getTime();
			  let end = this.di.$scope.dashboardModel.memory.end_time.getTime();
			  let step = this.di.$scope.dashboardModel.memory.step * 1000;
			
			  //update chart with new data
			  let labels = [];
			  let curTime = 0;
			  for(let i = 0; curTime <= end; i++) {
				  curTime = start + step * i;
				  labels.push((new Date(curTime)).toISOString());
			  }
			
			  this.di.$scope.switchMemoryChartConfig.data = dataArr;
			  this.di.$scope.switchMemoryChartConfig.labels = labels;
			  this.di.$scope.switchMemoryChartConfig.onClick = memoryChartOnClick(scope.dashboardModel.memory.analyzer, scope.switchMemoryPieChartConfig);
			
			  if(dataArr.length > 0 && labels.length > 0) {
				  let xLabel = labels[0];
				  let data = scope.dashboardModel.memory.analyzer[0].analyzer[0];
				  let title = scope.dashboardModel.memory.analyzer[0].name + ' - ' + formatLocalTime(xLabel)
				
				  setMemoryPieChartData(data, title, this.di.$scope.switchCpuPieChartConfig)
			  }
	  	});
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
    // devices = this.di._.orderBy(devices, 'avarage', 'desc');
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
    // devices = this.di._.orderBy(devices, 'avarage', 'desc');
    return devices;
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
      'Z';
  }

  pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
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

