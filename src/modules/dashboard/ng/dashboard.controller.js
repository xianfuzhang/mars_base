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
      'chart',
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

    const Chart = this.di.chart;
    const chartService = this.di.chartService;
    const chartStyles = chartService.styles;
    const colorHelper = Chart.helpers;
    let scope = this.di.$scope;
    let switchMemoryPieChart;
    let switchMemoryChart;
    this.translate = this.di.$filter('translate');
    this.interval_device = null;
    const CONTROLLER_STATE_INACTIVE = 'INACTIVE';
    this.SWITCHES_CPU_MEMORY_STATISTIC_NS = 'switches_cpu_memory_statistic_ns';
    this.CLUSTERS_CPU_MEMORY_STATISTIC_NS = 'clusters_cpu_memory_statistic_ns';
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
      controller: {
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

   /* this.di.$scope.rangeConfiguration = (type) => {
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
    };*/

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
      if (type === 'device-cpu') {
        this.di.$scope.dashboardModel.cpu.type = $value;
        this.di.$scope.dashboardModel.cpu.begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
        this.getDevicesCPUAnalyzer(dataModel.configDevices).then(() => {
          convertSwitchCPUAnalyzer();
        });
      }
      else if (type === 'device-memory') {
        this.di.$scope.dashboardModel.memory.type = $value;
        this.di.$scope.dashboardModel.memory.begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
        this.getDevicesMemoryAnalyzer(dataModel.configDevices).then(() => {
          convertSwitchMemoryAnalyzer();
        });
      }
      else if (type === 'controller-cpu') {
        this.di.$scope.dashboardModel.controller.cpu.type = $value;
        this.di.$scope.dashboardModel.controller.cpu.begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
        this.getClustersCPUAnalyzer(dataModel.cluster).then(() => {
          convertClusterCPUAnalyzer();
        });
      }
      else if (type === 'controller-memory') {
        this.di.$scope.dashboardModel.controller.memory.type = $value;
        this.di.$scope.dashboardModel.controller.memory.begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, 0);
        this.getClustersMemoryAnalyzer(dataModel.cluster).then(() => {
          convertClusterMemoryAnalyzer();
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
	      drawClusterCPUChart();
	      drawClusterMemoryChart();
	      drawSwitchCpuChart();
	      drawSwitchMemoryChart();
	      
        // convertSwitchCPUAnalyzer();
        // convertSwitchMemoryAnalyzer();
        // convertClusterCPUAnalyzer();
        // convertClusterMemoryAnalyzer();
      }
    }
	
	  // draw cluster cpu chart: added by yazhou.miao
	  let drawClusterCPUChart = () => {
		  let clusterCpuData = {
			  labels: [],
			  datasets: []
		  };
		
		  let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.controller.cpu.analyzer, function(item){return item.analyzer.length;});
		  clusterCpuData.labels = this.di.$scope.dashboardModel.controller.cpu.analyzer.length > 0 ?
			  this.getCPUMemoryTimeSeries(x_times) : [];
		
		  let index = 0;
		  this.di.$scope.dashboardModel.controller.cpu.analyzer.forEach((controller) => {
			  let data = [];
			  controller.analyzer.forEach((item) => {
				  data.push((item.user_percent + item.system_percent).toFixed(2))
			  });
			  clusterCpuData.datasets.push({
				  label: controller.name,
				  data:data,
				  borderColor: chartStyles.colors.colorPool[index],
				  backgroundColor: chartStyles.colors.colorPool[index],
				  fill: false,
				  pointRadius: 0,
				  pointHitRadius: 2,
			  });
			
			  index++;
		  });
		
		  const pad = this.pad;
		  let ctx = document.getElementById("cluster-cpu-usage-rate");
		  let clusterCpuChart = new Chart(ctx, {
			  type: 'line',
			  data: clusterCpuData,
			  responsive: false,
			  options: {
				  plugins: {
					  deferred: {
						  // xOffset: 150,   // defer until 150px of the canvas width are inside the viewport
						  yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
						  delay: 0      // delay of 500 ms after the canvas is considered inside the viewport
					  }
				  },
				  title: {
					  display: true,
					  text: '控制器cpu使用率',
				  },
				  legend: {
					  labels: {
						  // This more specific font property overrides the global property
						  fontColor: chartStyles.colors.fontColor
					  },
					  position: 'bottom',
					  onHover: function(e, legendItem) {
						  let index = legendItem.datasetIndex;
						  let ci = this.chart;
						
						  ci.data.datasets.forEach((value, key) => {
						  	if(key !== index) {
						  		value.borderColor = colorHelper.color(value.borderColor).alpha(0.5).rgbString();
							  }
						  })
						  // We hid a dataset ... rerender the chart
						  ci.update();
					  },
				  },
				  tooltips: {
					  mode: 'index',
					  intersect: false
				  },
				  scales: {
					  yAxes: [{
						  scaleLabel: chartStyles.colors.fontColor,
						  gridLines: {
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth
						  },
						  ticks: {
							  beginAtZero: false,
							  callback: function(value, index, values) {
								  return value.toFixed(2) + '%';
							  }
						  }
					  }],
					  xAxes: [{
						  scaleLabel: chartStyles.colors.fontColor,
						  gridLines: {
							  drawBorder: false,
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth
						  },
						  ticks: {
							  callback: function(value, index, values) {
								  value = new Date(value);
								  return pad(value.getHours()) + ':' + pad(value.getMinutes());
							  }
						  }
					  }],
				  },
				  // Container for pan options
				  pan: {
					  // Boolean to enable panning
					  enabled: false,
					
					  // Panning directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow panning in the y direction
					  mode: 'x',
					  rangeMin: {
						  // Format of min pan range depends on scale type
						  x: null,
						  y: null
					  },
					  rangeMax: {
						  // Format of max pan range depends on scale type
						  x: null,
						  y: null
					  },
					  // Function called once panning is completed
					  // Useful for dynamic data loading
					  onPan: function(chart) { console.log(`I was panned!!!`); }
				  },
				
				  // Container for zoom options
				  zoom: {
					  // Boolean to enable zooming
					  enabled: true,
					
					  // Enable drag-to-zoom behavior
					  drag: true,
					
					  // Drag-to-zoom rectangle style can be customized
					  // drag: {
					  // 	 borderColor: 'rgba(225,225,225,0.3)'
					  // 	 borderWidth: 5,
					  // 	 backgroundColor: 'rgb(225,225,225)'
					  // },
					
					  // Zooming directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow zooming in the y direction
					  mode: 'x',
					  // rangeMin: {
					  //   // Format of min zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // rangeMax: {
					  //   // Format of max zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // Function called once zooming is completed
					  // Useful for dynamic data loading
					  onZoom: function(x,y,data) {
						  let chart = this.chart;
						  console.log(`I was zoomed!!!`);
					  }
				  }
			  },
		  });
	  };
	
	  let drawClusterMemoryChart = () => {
		  let clusterMemoryData = {
			  labels: [],
			  datasets: []
		  };
		
		  let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.controller.memory.analyzer, function(item){return item.analyzer.length;});
		  clusterMemoryData.labels = this.di.$scope.dashboardModel.controller.memory.analyzer.length > 0 ?
			  this.getCPUMemoryTimeSeries(x_times) : [];
		
		  let index = 0;
		  this.di.$scope.dashboardModel.controller.memory.analyzer.forEach((controller) => {
			  let data = [];
			  controller.analyzer.forEach((item) => {
				  data.push(item.used_percent.toFixed(2))
			  });
			  clusterMemoryData.datasets.push({
				  label: controller.name,
				  data: data,
				  borderColor: chartStyles.colors.colorPool[index],
				  backgroundColor: chartStyles.colors.colorPool[index],
				  fill: false,
				  pointRadius: 0,
				  pointHitRadius: 2,
			  });
			
			  index++;
		  });
		
		  const pad = this.pad;
		  let ctx = document.getElementById("cluster-memory-usage-rate");
		  let clusterMemoryChart = new Chart(ctx, {
			  type: 'line',
			  data: clusterMemoryData,
			  responsive: false,
			  options: {
				  plugins: {
					  deferred: {
						  // xOffset: 150,   // defer until 150px of the canvas width are inside the viewport
						  yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
						  delay: 0      // delay of 500 ms after the canvas is considered inside the viewport
					  }
				  },
				  title: {
					  display: true,
					  text: '控制器内存使用率',
				  },
				  legend: {
					  labels: {
						  // This more specific font property overrides the global property
						  fontColor: chartStyles.colors.fontColor
					  },
					  position: 'bottom'
				  },
				  tooltips: {
					  mode: 'index',
					  intersect: false
				  },
				  scales: {
					  yAxes: [{
						  scaleLabel: chartStyles.colors.fontColor,
						  gridLines: {
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth
						  },
						  ticks: {
							  beginAtZero: false,
							  callback: function(value, index, values) {
								  return value.toFixed(2) + '%';
							  }
						  }
					  }],
					  xAxes: [{
						  scaleLabel: chartStyles.colors.fontColor,
						  gridLines: {
							  drawBorder: false,
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth
						  },
						  ticks: {
							  callback: function(value, index, values) {
								  value = new Date(value);
								  return pad(value.getHours()) + ':' + pad(value.getMinutes());
							  }
						  }
					  }],
				  },
				  // Container for pan options
				  pan: {
					  // Boolean to enable panning
					  enabled: false,
					
					  // Panning directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow panning in the y direction
					  mode: 'x',
					  rangeMin: {
						  // Format of min pan range depends on scale type
						  x: null,
						  y: null
					  },
					  rangeMax: {
						  // Format of max pan range depends on scale type
						  x: null,
						  y: null
					  },
					  // Function called once panning is completed
					  // Useful for dynamic data loading
					  onPan: function(chart) { console.log(`I was panned!!!`); }
				  },
				
				  // Container for zoom options
				  zoom: {
					  // Boolean to enable zooming
					  enabled: true,
					
					  // Enable drag-to-zoom behavior
					  drag: true,
					
					  // Drag-to-zoom rectangle style can be customized
					  // drag: {
					  // 	 borderColor: 'rgba(225,225,225,0.3)'
					  // 	 borderWidth: 5,
					  // 	 backgroundColor: 'rgb(225,225,225)'
					  // },
					
					  // Zooming directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow zooming in the y direction
					  mode: 'x',
					  // rangeMin: {
					  //   // Format of min zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // rangeMax: {
					  //   // Format of max zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // Function called once zooming is completed
					  // Useful for dynamic data loading
					  onZoom: function(x,y,data) {
						  let chart = this.chart;
						  console.log(`I was zoomed!!!`);
					  }
				  }
			  },
		  });
	  };
	  
	  let drawSwitchCpuChart = () => {
		  //cpu analyzer
		  let switchCpuData = {
			  labels: [],
			  datasets: []
		  };
		  let records = this.getDevicesCPUChartData(this.di.$scope.dashboardModel.cpu.analyzer);
		  let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.cpu.analyzer, function(item){return item.analyzer.length;});
		  switchCpuData.labels = this.di.$scope.dashboardModel.cpu.analyzer.length > 0 ?
			  this.getCPUMemoryTimeSeries(x_times) : [];
		
		  let index = 0;
		  if(records.length) {
			  records.forEach((item, index) =>{
				  switchCpuData.datasets.push({
					  label: item.name,
					  data: item.data,
					  borderColor: chartStyles.colors.colorPool[index],
					  backgroundColor: chartStyles.colors.colorPool[index],
					  fill: false,
					  pointRadius: 0,
					  pointHitRadius: 2,
				  });
				
				  index++;
			  });
		  }
		  
		  const pad = this.pad;
		  let ctx = document.getElementById("switch-cpu-usage-rate");
		  let clusterMemoryChart = new Chart(ctx, {
			  type: 'line',
			  data: switchCpuData,
			  responsive: false,
			  options: {
				  plugins: {
					  deferred: {
						  // xOffset: 150,   // defer until 150px of the canvas width are inside the viewport
						  yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
						  delay: 0      // delay of 500 ms after the canvas is considered inside the viewport
					  }
				  },
				  title: {
					  display: true,
					  text: '交换机cpu使用率',
				  },
				  legend: {
					  labels: {
						  // This more specific font property overrides the global property
						  fontColor: chartStyles.colors.fontColor
					  },
					  position: 'bottom'
				  },
				  tooltips: {
					  mode: 'index',
					  intersect: false
				  },
				  scales: {
					  yAxes: [{
						  scaleLabel: chartStyles.colors.fontColor,
						  gridLines: {
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth
						  },
						  ticks: {
							  beginAtZero: false,
							  callback: function(value, index, values) {
								  return value.toFixed(2) + '%';
							  }
						  }
					  }],
					  xAxes: [{
						  scaleLabel: chartStyles.colors.fontColor,
						  gridLines: {
							  drawBorder: false,
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth
						  },
						  ticks: {
							  callback: function(value, index, values) {
								  value = new Date(value);
								  return pad(value.getHours()) + ':' + pad(value.getMinutes());
							  }
						  }
					  }],
				  },
				  // Container for pan options
				  pan: {
					  // Boolean to enable panning
					  enabled: false,
					
					  // Panning directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow panning in the y direction
					  mode: 'x',
					  rangeMin: {
						  // Format of min pan range depends on scale type
						  x: null,
						  y: null
					  },
					  rangeMax: {
						  // Format of max pan range depends on scale type
						  x: null,
						  y: null
					  },
					  // Function called once panning is completed
					  // Useful for dynamic data loading
					  onPan: function(chart) { console.log(`I was panned!!!`); }
				  },
				
				  // Container for zoom options
				  zoom: {
					  // Boolean to enable zooming
					  enabled: true,
					
					  // Enable drag-to-zoom behavior
					  drag: true,
					
					  // Drag-to-zoom rectangle style can be customized
					  // drag: {
					  // 	 borderColor: 'rgba(225,225,225,0.3)'
					  // 	 borderWidth: 5,
					  // 	 backgroundColor: 'rgb(225,225,225)'
					  // },
					
					  // Zooming directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow zooming in the y direction
					  mode: 'x',
					  // rangeMin: {
					  //   // Format of min zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // rangeMax: {
					  //   // Format of max zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // Function called once zooming is completed
					  // Useful for dynamic data loading
					  onZoom: function(x,y,data) {
						  let chart = this.chart;
						  console.log(`I was zoomed!!!`);
					  }
				  }
			  },
		  });
	  };
	
	  let onClick = function(evt, chart) { // point element
		  let ci = chart;
		  let updateFlag = false;
		
		  // 1.element hover event
		  let element = ci.getElementAtEvent(evt);
		  if(element.length > 0)
		  {
			  let datasetIndex = element[0]._datasetIndex;
			  let index = element[0]._index;
			
			  let chartData = {datasets:[], labels:[]};
			  let dataset = {data:[], backgroundColor:[],label: ''};
			  let labels = [];
			  let data = scope.dashboardModel.memory.analyzer[datasetIndex].analyzer[index];
			
			  dataset.data.push(data['buffered_percent'].toFixed(2));
			  dataset.backgroundColor.push('sandybrown');
			  chartData.labels.push('buffered');
			
			  dataset.data.push(data['cached_percent'].toFixed(2));
			  dataset.backgroundColor.push('bisque');
			  chartData.labels.push('cached');
			
			  dataset.data.push(data['free_percent'].toFixed(2));
			  dataset.backgroundColor.push('lightgreen');
			  chartData.labels.push('free');
			
			  dataset.data.push(data['slab_recl_percent'].toFixed(2));
			  dataset.backgroundColor.push('purple');
			  chartData.labels.push('slab_recl');
			
			  dataset.data.push(data['slab_unrecl_percent'].toFixed(2));
			  dataset.backgroundColor.push('chocolate');
			  chartData.labels.push('slab_unrecl');
			
			  dataset.data.push(data['used_percent'].toFixed(2));
			  dataset.backgroundColor.push('red');
			  chartData.labels.push('used');
			
			  chartData.datasets.push(dataset);
			  let newCtx = document.getElementById("switch-memory-analyzer");
			  if(switchMemoryPieChart) {
				  switchMemoryPieChart.destroy();
			  }
			  switchMemoryPieChart = new Chart(newCtx, {
				  type: 'pie',
				  data: chartData,
				  options: {
					  responsive: true,
					  legend: {
						  position: 'bottom',
					  },
					  title: {
						  display: true,
						  text: scope.dashboardModel.memory.analyzer[datasetIndex].name + ' - 内存使用详情',
						  fontSize: 14
					  },
					  animation: {
						  animateScale: true,
						  animateRotate: true
					  }
				  }
			  });
		  }
	  }
	  
	  let drawSwitchMemoryChart = () => {
		  //memory analyzer
		  let switchMemoryData = {
			  labels: [],
			  datasets: []
		  };
		  let records = this.getDevicesMemoryChartData(this.di.$scope.dashboardModel.memory.analyzer);
		  let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.memory.analyzer, function(item){return item.analyzer.length;});
		  switchMemoryData.labels = this.di.$scope.dashboardModel.memory.analyzer.length > 0 ?
			  this.getCPUMemoryTimeSeries(x_times) : [];
		
		  let index = 0;
		  if(records.length) {
			  records.forEach((item, index) =>{
					switchMemoryData.datasets.push({
						label: item.name,
						data: item.data,
						borderColor: chartStyles.colors.colorPool[index],
						backgroundColor: chartStyles.colors.colorPool[index],
						fill: false,
						pointRadius: 0,
						pointHitRadius: 2,
					});
				
					index++;
        })
		  }
		
		  const pad = this.pad;
		  const scope = this.di.$scope;
		  const memoryAnalyzer = this.di.$scope.dashboardModel.memory.analyzer;
		  let pieChart;
		  let ctx = document.getElementById("switch-memory-usage-rate");
		  
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
				  onZoom: function(chart, xRange) {
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
					
					  // if step lower equal than 30s, don't need change scale
					  // let originalStep = new Date(ticks[1]).getTime() - new Date(ticks[0]).getTime();
					  // if(originalStep <= 30 * 1000) return;
					  function getISODate(date) {
						  return date.getUTCFullYear() +
							  '-' + pad( date.getUTCMonth() + 1 ) +
							  '-' + pad( date.getUTCDate() ) +
							  'T' + pad( date.getUTCHours() ) +
							  ':' + pad( date.getUTCMinutes() ) +
							  ':00'  +
							  'Z';
					  }
					  let start = new Date(getISODate(new Date(ticks[startIndex])));
					  let startTime = start.getTime();
					  let end = new Date(getISODate(new Date(ticks[endIndex])));
					  let endTime =  end.getTime();
					  let step = Math.floor((endTime - startTime) / ((ticks.length - 1) * 1000));
					  step = step < 30 ? 30 : step;
					
					  scope.dashboardModel.memory.type.value = step;
					  scope.dashboardModel.memory.begin_time = start;
					  scope.dashboardModel.memory.end_time = end;
					
					  di.$scope.$apply();
				  }
			  }
		  };
		  // TODO: test-chart
		  let dataArr = [];
		  let series = [];
		  switchMemoryData.datasets.forEach((dataset) => {
		  	dataArr.push(dataset.data);
		  	series.push(dataset.label)
		  })
		  this.di.$scope.data = dataArr;
		  this.di.$scope.labels = switchMemoryData.labels;
		  this.di.$scope.options = options;
		  this.di.$scope.series = series;
		  this.di.$scope.onClick = onClick;
		  
		  switchMemoryChart = new Chart(ctx, {
			  type: 'line',
			  data: switchMemoryData,
			  responsive: false,
			  options: options
		  });
	  };
	
	  let drawInterfaceRxTxChart = (dataArr, chartId, y_label, drop) => {
		  //memory analyzer
		  let interfaceRxTxdata = {
			  labels: [],
			  datasets: []
		  };
		  
		  let category= [], rxs = [], pkgRecv = [], pgkSend = [], title;
		  this.di._.forEach(dataArr, (statistic)=>{
			  let name = getSwtAndPortName(statistic['device'], statistic['port']);
			  interfaceRxTxdata.labels.push(name);
			  if (y_label === 'packages') {
				  if (drop) {
					  pkgRecv.push(statistic['packetsRxDropped']);
					  pgkSend.push(statistic['packetsTxDropped']);
					
					  title = '端口收发包';
				  }
				  else {
					  pkgRecv.push(statistic['packetsReceived']);
					  pgkSend.push(statistic['packetsSent']);
					
					  title = '端口丢包';
				  }
			  }
			  else {
				  pkgRecv.push(statistic['bytesReceived']);
				  pgkSend.push(statistic['bytesSent']);
			  }
			
		  });
		  interfaceRxTxdata.datasets.push({
			  label: '接收',
			  backgroundColor: colorHelper.color('blue').alpha(0.8).rgbString(),
			  data:pkgRecv,
		  });
		  interfaceRxTxdata.datasets.push({
			  label: '发送',
			  backgroundColor: colorHelper.color('salmon').alpha(0.8).rgbString(),
			  data:pgkSend,
		  });
		
		  const pad = this.pad;
		  let ctx = document.getElementById(chartId);
		  let rxTxPackagesChart = new Chart(ctx, {
			  type: 'bar',
			  data: interfaceRxTxdata,
			  responsive: false,
			  options: {
				  plugins: {
					  deferred: {
						  //xOffset: 150,   // defer until 150px of the canvas width are inside the viewport
						  yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
						  delay: 0      // delay of 500 ms after the canvas is considered inside the viewport
					  }
				  },
				  barPercentage: 0.1,
				  title: {
					  display: true,
					  text: title
				  },
				  legend: {
					  labels: {
						  // This more specific font property overrides the global property
						  fontColor: chartStyles.colors.fontColor
					  },
					  position: 'bottom'
				  },
				  tooltips: {
					  mode: 'index',
					  intersect: false
				  },
				  scales: {
					  yAxes: [{
						  stacked: true,
						  scaleLabel: {
							  display: true,
							  labelString: 'packages'
						  },
						  gridLines: {
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth
						  },
						  barThickness: 20,
						  ticks: {
							  beginAtZero: false,
							  // callback: function(value, index, values) {
								//   return value.toFixed(2) + '%';
							  // }
						  }
					  }],
					  xAxes: [{
						  stacked: true,
						  scaleLabel: chartStyles.colors.fontColor,
						  gridLines: {
							  drawBorder: false,
							  color: chartStyles.colors.gridLinesColor,
							  lineWidth: chartStyles.lines.gridWidth,
							  offsetGridLines: false
						  },
						  barThickness: 20,
					  }],
				  },
				  // Container for pan options
				  pan: {
					  // Boolean to enable panning
					  enabled: false,
					
					  // Panning directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow panning in the y direction
					  mode: 'x',
					  rangeMin: {
						  // Format of min pan range depends on scale type
						  x: null,
						  y: null
					  },
					  rangeMax: {
						  // Format of max pan range depends on scale type
						  x: null,
						  y: null
					  },
					  // Function called once panning is completed
					  // Useful for dynamic data loading
					  onPan: function(chart) { console.log(`I was panned!!!`); }
				  },
				
				  // Container for zoom options
				  zoom: {
					  // Boolean to enable zooming
					  enabled: true,
					
					  // Enable drag-to-zoom behavior
					  drag: true,
					
					  // Drag-to-zoom rectangle style can be customized
					  // drag: {
					  // 	 borderColor: 'rgba(225,225,225,0.3)'
					  // 	 borderWidth: 5,
					  // 	 backgroundColor: 'rgb(225,225,225)'
					  // },
					
					  // Zooming directions. Remove the appropriate direction to disable
					  // Eg. 'y' would only allow zooming in the y direction
					  mode: 'x',
					  // rangeMin: {
					  //   // Format of min zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // rangeMax: {
					  //   // Format of max zoom range depends on scale type
					  //   x: null,
					  //   y: null
					  // },
					  // Function called once zooming is completed
					  // Useful for dynamic data loading
					  onZoom: function(x,y,data) {
						  let chart = this.chart;
						  console.log(`I was zoomed!!!`);
					  }
				  }
			  },
		  });
	  };
	  
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
	    drawInterfaceRxTxChart(packagesOrder, 'interface-rxtx-packages', 'packages');

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
	    drawInterfaceRxTxChart(packagesDropOrder, 'interface-rxtx-drops', 'packages');
    };

    let convertSwitchCPUAnalyzer = () => {
      //cpu analyzer
      let cpuCols = [];
      let records = this.getDevicesCPUChartData(this.di.$scope.dashboardModel.cpu.analyzer);
      let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.cpu.analyzer, function(item){return item.analyzer.length;});
      let x_axis = this.di.$scope.dashboardModel.cpu.analyzer.length > 0 ?
        this.getCPUMemoryTimeSeries(x_times) : ['x'];
      cpuCols.push(x_axis);  
      if(records.length) {
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
      this.di.$scope.dashboardModel.cpu.chartData = cpuCols;
      this.di.$scope.dashboardModel.cpu.aync = !this.di.$scope.dashboardModel.cpu.aync;
    };

    let convertSwitchMemoryAnalyzer = () => {
      //memory analyzer
      let memoryCols = [];
      let records = this.getDevicesMemoryChartData(this.di.$scope.dashboardModel.memory.analyzer);
      let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.memory.analyzer, function(item){return item.analyzer.length;});
      let x_axis = this.di.$scope.dashboardModel.memory.analyzer.length > 0 ? 
          this.getCPUMemoryTimeSeries(x_times) : ['x'];
      memoryCols.push(x_axis);
      if(records.length) {
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
      this.di.$scope.dashboardModel.memory.chartData = memoryCols;
      this.di.$scope.dashboardModel.memory.aync = !this.di.$scope.dashboardModel.memory.aync;
    };
	
    let convertClusterCPUAnalyzer = () => {
      let cpuCols = [], records = [];
      this.di.$scope.dashboardModel.controller.cpu.analyzer.forEach((controller) => {
        let data = [controller.name];
        controller.analyzer.forEach((item) => {
          data.push((item.user_percent + item.system_percent).toFixed(2))
        });
        records.push(data);
      });
      let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.controller.cpu.analyzer, function(item){return item.analyzer.length;});
      let x_axis = this.di.$scope.dashboardModel.controller.cpu.analyzer.length > 0 ? 
          this.getCPUMemoryTimeSeries(x_times) : ['x'];
      cpuCols.push(x_axis);    
      if (records.length) {
        cpuCols= cpuCols.concat(records);
      }
      this.di.$scope.dashboardModel.controller.cpu.chartData = cpuCols;
      this.di.$scope.dashboardModel.controller.cpu.aync = !this.di.$scope.dashboardModel.controller.cpu.aync;
    };

    let convertClusterMemoryAnalyzer = () => {
      let memoryCols = [], records = [];
      this.di.$scope.dashboardModel.controller.memory.analyzer.forEach((controller) => {
        let data = [controller.name];
        controller.analyzer.forEach((item) => {
          data.push(item.used_percent.toFixed(2))
        });
        records.push(data);
      });
      let x_times = this.di._.maxBy(this.di.$scope.dashboardModel.controller.memory.analyzer, function(item){return item.analyzer.length;});
      let x_axis = this.di.$scope.dashboardModel.controller.memory.analyzer.length > 0 ? 
          this.getCPUMemoryTimeSeries(x_times) : ['x'];
      memoryCols.push(x_axis);    
      if (records.length) {
        memoryCols = memoryCols.concat(records);
      }
      this.di.$scope.dashboardModel.controller.memory.chartData = memoryCols;
      this.di.$scope.dashboardModel.controller.memory.aync = !this.di.$scope.dashboardModel.controller.memory.aync;
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
      return device['name']||device['switch_name'];
    };

    let getPortName = (deviceid, portNo) =>{
      let port = this.di._.find(dataModel['ports'], { 'element': deviceid, 'port': String(portNo)});
      // if(port)
      return port && port['annotations']['portName'] || '';
    };

    this.init_application_license().then(()=>{
      init();
    });
	
    let memoryTimeHasChanged = false;
	  unSubscribers.push(this.di.$scope.$watchGroup(['dashboardModel.memory.begin_time', 'dashboardModel.memory.end_time'], (a,b,c,d) => {
		  if(!memoryTimeHasChanged) {
			  memoryTimeHasChanged = true;
		  	return;
		  }
		
	  	this.getDevicesMemoryAnalyzer(dataModel.configDevices).then(() => {
			  //memory analyzer
			  let datasets = [];
			  let records = this.getDevicesMemoryChartData(this.di.$scope.dashboardModel.memory.analyzer);
			
			  let index = 0;
			  if(records.length) {
				  records.forEach((item, index) =>{
					  datasets.push({
						  label: item.name,
						  data: item.data,
						  borderColor: chartStyles.colors.colorPool[index],
						  backgroundColor: chartStyles.colors.colorPool[index],
						  fill: false,
						  pointRadius: 0,
						  pointHitRadius: 2,
					  });
					
					  index++;
				  })
			  }
			
			  let ticks = switchMemoryChart.data.labels;
			
			  let start = this.di.$scope.dashboardModel.memory.begin_time.getTime();
			  let step = this.di.$scope.dashboardModel.memory.type.value * 1000;
			
			  //update chart with new data
			  let labels = [];
			  for(let i = 0; i < ticks.length; i++) {
				  let time = start + step * i;
				  labels.push((new Date(time)).toISOString());
			  }
			  
			  switchMemoryChart.data.datasets = datasets;
			  switchMemoryChart.data.labels = labels;
			  switchMemoryChart.update();
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
    let solution_second = this.di.$scope.dashboardModel.controller.cpu.type.value;//3600;//this.getResolutionSecond(startTime, endTime);
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
    let solution_second = this.di.$scope.dashboardModel.controller.memory.type.value;//3600;//this.getResolutionSecond(startTime, endTime);
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

