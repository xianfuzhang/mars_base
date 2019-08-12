// import {MDCRipple} from '@material/ripple';
export class AnalyzerController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$window',
      '_',
      '$filter',
      '$q',
      '$timeout',
      '$http',
      'appService',
      'c3',
      'dialogService',
      'dateService',
      'chartService',
      'dashboardDataManager',
      'deviceDataManager',
      'manageDataManager',
      'modalManager',
    ];
  }
  
  constructor(...args) {
    this.di = {};
    AnalyzerController.getDI().forEach((value, index) => {
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
    this.scope = this.di.$scope;
    const scope = this.di.$scope;
    const DI = this.di;
    const chartService = this.di.chartService;
    const chartStyles = chartService.styles;
    const getFormatedDateTime = this.getFormatedDateTime;
    const getFormattedNumber = this.getFormattedNumber;

    this.scope.pageTitle = this.translate('MODULE.HEADER.MANAGE.ANALYZER');
    
    let unSubscribers = [];
    let dataModel = {};
    let devicesArr = [];
    const INTERVAL_COUNT = 30;
    let date = DI.dateService.getTodayObject();
    let before = DI.dateService.getBeforeDateObject(20*60*1000);

    const CHART_GRID_NUM = 36; // chart grid number
    let ngxin_before = this.di.dateService.getBeforeDateObject(60*1000*60 * 24); // 前一天
    let nginx_begin_time = new Date(ngxin_before.year, ngxin_before.month, ngxin_before.day, ngxin_before.hour, ngxin_before.minute, 0);
    let nginx_end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, 0);

    // scope.elasticsearchModel = {
    //   selectedIndice: '',
    //   indice: {
    //     'analyzer': [],
    //     'min_time': '',
    //     'max_time': ''
    //   },
    //   indiceOptions: [],
    //   summaryLoading: true,
    //   analyzerLoading: true,
    // };

    scope.nginxTypeAnalyzer = {
      selectedOption: {
        label: "URL",
        value: "url"
      },
      typesOptions: [
        {
          label: "URL",
          value: "url"
        },
        {
          label: "IP",
          value: "clientip",

        }
      ],
      dataModel: null,
      startTime: nginx_begin_time,
      endTime: nginx_end_time,
      loading: true,
      chartConfig: {
        data: [],
        labels: [],
        options: {},
        colors: [],
        series: []
      }
    };

    scope.nginxTimerangeAnalyzer = {
      selectedOption: {
        label: "URL",
        value: "url"
      },
      typesOptions: [
        {
          label: "URL",
          value: "url"
        },
        {
          label: "IP",
          value: "clientip",

        }
      ],
      dataModel: null,
      startTime: nginx_begin_time,
      endTime: nginx_end_time,
      originStartTime: nginx_begin_time,
      originEndTime: nginx_end_time,
      selectedIpOption: {
        label: '--' + this.translate('MODULES.MANAGE.ELASTICSEARCH.SELECT_ALL_IP') +'--',
        value: ''
      },
      ipOptions: [{
        label: '--' + this.translate('MODULES.MANAGE.ELASTICSEARCH.SELECT_ALL_IP') +'--',
        value: ''
      }],
      loading: true,
      isRealtime: false,
      intervalFlag: null,
      chartConfig: {
        data: [],
        labels: [],
        options: {},
        colors: [],
        series: []
      },
      pieChartConfig: {
        data: [],
        labels: [],
        colors: [],
        options: []
      }
    };

    scope.syslogAnalyzer = {
      dataModel: null,
      startTime: nginx_begin_time,
      endTime: nginx_end_time,
      originStartTime: nginx_begin_time,
      originEndTime: nginx_end_time,
      loading: true,
      chartConfig: {
        data: [],
        labels: [],
        options: {},
        colors: [],
        series: []
      }
    };

    scope.filebeatAnalyzer = {
      selectedOption: {
        label: "handler",
        value: "handler",

      },
      typesOptions: [
        {
          label: "handler",
          value: "handler",

        },
        {
          label: "thread",
          value: "thread"
        }
      ],
      dataModel: null,
      startTime: nginx_begin_time,
      endTime: nginx_end_time,
      originStartTime: nginx_begin_time,
      originEndTime: nginx_end_time,
      loading: true,
      chartConfig: {
        data: [],
        labels: [],
        options: {},
        colors: [],
        series: []
      },
      pieChartConfig: {
        data: [],
        labels: [],
        colors: [],
        options: []
      }
    };

    scope.resetTimeScale = (chartType) => {
      switch(chartType) {
        case 'nginx-analyzer':
          scope.nginxTimerangeAnalyzer.startTime = scope.nginxTimerangeAnalyzer.originStartTime;
          scope.nginxTimerangeAnalyzer.endTime = scope.nginxTimerangeAnalyzer.originEndTime;
          break;
        case 'syslog-analyzer':
          scope.syslogAnalyzer.startTime = scope.syslogAnalyzer.originStartTime;
          scope.syslogAnalyzer.endTime = scope.syslogAnalyzer.originEndTime;
          break;
        case 'filebeat-analyzer':
          scope.filebeatAnalyzer.startTime = scope.filebeatAnalyzer.originStartTime;
          scope.filebeatAnalyzer.endTime = scope.filebeatAnalyzer.originEndTime;
          break;
      }
    }

    this.di.$scope.realtime = (type) => {
      let date, before, begin_time, end_time, isController = false, typeKey, model;

      function setRealtime() {
        date = DI.dateService.getTodayObject();
        before = DI.dateService.getBeforeDateObject(30 * CHART_GRID_NUM * 1000);
        begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, before.second);
        end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second);
      }

      function setHistoricalTime() {
        date = DI.dateService.getTodayObject();
        before = DI.dateService.getBeforeDateObject(30 * 60 * 1000);
        begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, before.second);
        end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second);
      }

      scope.nginxTimerangeAnalyzer.isRealtime = !scope.nginxTimerangeAnalyzer.isRealtime;
      if (!scope.nginxTimerangeAnalyzer.isRealtime) {
        setHistoricalTime();
        scope.nginxTimerangeAnalyzer.originBeginTime = begin_time;;
        scope.nginxTimerangeAnalyzer.originEndTime = end_time;
        scope.nginxTimerangeAnalyzer.startTime = begin_time;
        scope.nginxTimerangeAnalyzer.endTime = end_time;

        clearInterval(scope.nginxTimerangeAnalyzer.intervalFlag);
        scope.nginxTimerangeAnalyzer.intervalFlag = null;
      } else {
        setRealtime();
        scope.nginxTimerangeAnalyzer.startTime = begin_time;
        scope.nginxTimerangeAnalyzer.endTime = end_time;

        scope.nginxTimerangeAnalyzer.intervalFlag = setInterval(() => {
          setRealtime();
          scope.nginxTimerangeAnalyzer.startTime = begin_time;
          scope.nginxTimerangeAnalyzer.endTime = end_time;

          scope.$apply();
        }, 30 * 1000)
      }
    }

    this.di.$scope.refresh = (type) => {
      let date, before, begin_time, end_time, isController = false, typeKey, model;

      date = DI.dateService.getTodayObject();
      before = DI.dateService.getBeforeDateObject(30 * 60 * 1000);
      begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, before.second);
      end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second);

      scope.nginxTimerangeAnalyzer.isRealtime = !scope.nginxTimerangeAnalyzer.isRealtime;
      if (!scope.nginxTimerangeAnalyzer.isRealtime) {
        setHistoricalTime();
        scope.nginxTimerangeAnalyzer.originBeginTime = begin_time;;
        scope.nginxTimerangeAnalyzer.originEndTime = end_time;
        scope.nginxTimerangeAnalyzer.startTime = begin_time;
        scope.nginxTimerangeAnalyzer.endTime = end_time;

        clearInterval(scope.nginxTimerangeAnalyzer.intervalFlag);
        scope.nginxTimerangeAnalyzer.intervalFlag = null;
      } else {
        setRealtime();
        scope.nginxTimerangeAnalyzer.startTime = begin_time;
        scope.nginxTimerangeAnalyzer.endTime = end_time;

        scope.nginxTimerangeAnalyzer.intervalFlag = setInterval(() => {
          setRealtime();
          scope.nginxTimerangeAnalyzer.startTime = begin_time;
          scope.nginxTimerangeAnalyzer.endTime = end_time;

          scope.$apply();
        }, 30 * 1000)
      }
    }

    this.di.$scope.refresh = (type) => {
      let date, before, begin_time, end_time, isController = false, typeKey, model;

      date = DI.dateService.getTodayObject();
      before = DI.dateService.getBeforeDateObject(30 * 60 * 1000);
      begin_time = new Date(before.year, before.month, before.day, before.hour, before.minute, before.second);
      end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second);

      switch(type) {
        case 'nginx-type-analyzer':
          scope.nginxTypeAnalyzer.startTime = begin_time;
          scope.nginxTypeAnalyzer.endTime = end_time;
          break;
        case 'nginx-analyzer':
          scope.nginxTimerangeAnalyzer.startTime = begin_time;
          scope.nginxTimerangeAnalyzer.endTime = end_time;
          break;
        case 'syslog-analyzer':
          scope.syslogAnalyzer.startTime = begin_time;
          scope.syslogAnalyzer.endTime = end_time;
          break;
        case 'filebeat-analyzer':
          scope.filebeatAnalyzer.startTime = begin_time;
          scope.filebeatAnalyzer.endTime = end_time;
          break;
      }
    }

    scope.chartSetting = (type) => {
      let beginTime, endTime;
      switch(type) {
        case 'nginx-type-analyzer':
          beginTime = scope.nginxTypeAnalyzer.startTime;
          endTime = scope.nginxTypeAnalyzer.endTime;
          break;
        case 'nginx-analyzer':
          beginTime = scope.nginxTimerangeAnalyzer.startTime;
          endTime = scope.nginxTimerangeAnalyzer.endTime;
          break;
        case 'syslog-analyzer':
          beginTime = scope.syslogAnalyzer.startTime;
          endTime = scope.syslogAnalyzer.endTime;
          break;
        case 'filebeat-analyzer':
          beginTime = scope.filebeatAnalyzer.startTime;
          endTime = scope.filebeatAnalyzer.endTime;
          break;
      }

      this.di.modalManager.open({
        template: require('../template/chart_setting.html'),
        controller: 'chartSettingDialogCtrl',
        windowClass: 'show-chart-setting-modal',
        resolve: {
          dataModel: () => {
            return {
              chartType: type,
              beginTime: beginTime,
              endTime: endTime
            }
          }
        }
      }).result.then((res) => {
        if (res && !res.canceled) {
          switch(type) {
            case 'nginx-type-analyzer':
              scope.nginxTypeAnalyzer.originStartTime = res.data.beginTime;
              scope.nginxTypeAnalyzer.originEndTime = res.data.endTime;
              scope.nginxTypeAnalyzer.startTime = res.data.beginTime;
              scope.nginxTypeAnalyzer.endTime = res.data.endTime;
              break;
            case 'nginx-analyzer':
              scope.nginxTimerangeAnalyzer.originStartTime = res.data.beginTime;
              scope.nginxTimerangeAnalyzer.originEndTime = res.data.endTime;
              scope.nginxTimerangeAnalyzer.startTime = res.data.beginTime;
              scope.nginxTimerangeAnalyzer.endTime = res.data.endTime;
              break;
            case 'syslog-analyzer':
              scope.syslogAnalyzer.originStartTime = res.data.beginTime;
              scope.syslogAnalyzer.originEndTime = res.data.endTime;
              scope.syslogAnalyzer.startTime = res.data.beginTime;
              scope.syslogAnalyzer.endTime = res.data.endTime;
              break;
            case 'filebeat-analyzer':
              scope.filebeatAnalyzer.originStartTime = res.data.beginTime;
              scope.filebeatAnalyzer.originEndTime = res.data.endTime;
              scope.filebeatAnalyzer.startTime = res.data.beginTime;
              scope.filebeatAnalyzer.endTime = res.data.endTime;
              break;
          }
        }
      });
    }

    scope.nginxTypeSelect = ($value) => {
      scope.nginxTypeAnalyzer.selectedOption = $value;
    };

    scope.nginxIpSelect = ($value) => {
      scope.nginxTimerangeAnalyzer.selectedIpOption = $value;
    };

    scope.filebeatTypeSelect = ($value) => {
      scope.filebeatAnalyzer.selectedOption = $value;
    };

    let init =() =>{
      scope.loading = true;

      // get nginx analyzer by timerange
      let resolutionSecond = Math.floor((scope.nginxTimerangeAnalyzer.endTime.getTime() - scope.nginxTimerangeAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
      this.di.manageDataManager.getNginxTimerangeAnalyzer(this.getISODate(scope.nginxTimerangeAnalyzer.startTime), this.getISODate(scope.nginxTimerangeAnalyzer.endTime), resolutionSecond).then((res) => {
        scope.nginxTimerangeAnalyzer.dataModel = res;
        scope.nginxTimerangeAnalyzer.loading = false;
        setNginxChartLineData(true);
      }, () => {
        scope.nginxTimerangeAnalyzer.dataModel = [];
        scope.nginxTimerangeAnalyzer.loading = false;
        setNginxChartLineData(true);
      });

      // get nginx analyzer by type
      this.di.manageDataManager.getNginxTypeAnalyzer(scope.nginxTypeAnalyzer.selectedOption.value, this.getISODate(scope.nginxTypeAnalyzer.startTime), this.getISODate(scope.nginxTypeAnalyzer.endTime)).then((res) => {
        scope.nginxTypeAnalyzer.dataModel = res;
        scope.nginxTypeAnalyzer.loading = false;
        setNginxChartBarData();
      }, () => {
        scope.nginxTypeAnalyzer.dataModel = [];
        scope.nginxTypeAnalyzer.loading = false;
        setNginxChartBarData();
      });

      // get syslog analyzer by timerange
      let syslogSeconds = Math.floor((scope.syslogAnalyzer.endTime.getTime() - scope.syslogAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
      this.di.deviceDataManager.getDeviceConfigs().then((configs)=>{
        devicesArr = configs;
        this.getDevicesSyslogAnalyzer(configs, scope.syslogAnalyzer.startTime, scope.syslogAnalyzer.endTime, syslogSeconds).then(() => {
          scope.syslogAnalyzer.loading = false;
          setSyslogChartLineData();
        }, (err) => {
          scope.syslogAnalyzer.dataModel = [];
          scope.syslogAnalyzer.loading = false;
          setSyslogChartLineData();
        });
      });

      // get filebeat analyzer by timerange
      let filebeatSeconds = Math.floor((scope.filebeatAnalyzer.endTime.getTime() - scope.filebeatAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
      this.di.manageDataManager.getFilebeatAnalyzer(scope.filebeatAnalyzer.selectedOption.value, this.getISODate(scope.filebeatAnalyzer.startTime), this.getISODate(scope.filebeatAnalyzer.endTime), filebeatSeconds).then((res) => {
        scope.filebeatAnalyzer.dataModel = res;
        scope.filebeatAnalyzer.loading = false;
        setFilebeatChartLineData();
      }, () => {
        scope.filebeatAnalyzer.dataModel = [];
        scope.filebeatAnalyzer.loading = false;
        setFilebeatChartLineData();
      });
    };

    let setNginxChartBarData = () => {
      let dataList = [], labelsArr = [];
      let dataArray = scope.nginxTypeAnalyzer.dataModel;
      let key = scope.nginxTypeAnalyzer.selectedOption.value == 'url' ? 'url' : 'clientIp';
      this.di._.forEach(dataArray, (statistic)=>{
        // let urlArr = statistic[key].split('/');
        // let label = urlArr.length > 1 ? urlArr[0] + '/.../' + urlArr[urlArr.length - 1] : urlArr[0];
        labelsArr.push(statistic[key]);
        dataList.push(statistic['count']);
      });

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.MANAGE.ELASTICSEARCH.API_DETAIL_ANY')
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.translate('MODULES.MANAGE.ELASTICSEARCH.VISIT_COUNT')
            },
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return getFormattedNumber(value);
              }
            }
          }],
          xAxes: [{
            barThickness: 40,
            ticks: {
              callback: (value) => {
                // let urlArr = value.split('/');
                // return urlArr.length > 3 ? urlArr[0] == '' ? urlArr[1] + '/.../' + urlArr[urlArr.length - 1] : urlArr[0] + '/.../' + urlArr[urlArr.length - 1] : value;
                if(value.length > 30) {
                  return value.slice(0, 10) + '...' + value.slice(-10);
                } else {
                  return value;
                }
              },
            }
          }],
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem) => {
              return labelsArr[tooltipItem[0].index];
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
        }
      }

      scope.nginxTypeAnalyzer.chartConfig.data = [dataList];
      scope.nginxTypeAnalyzer.chartConfig.series = [this.translate('MODULES.MANAGE.ELASTICSEARCH.VISIT_COUNT')];
      scope.nginxTypeAnalyzer.chartConfig.labels = labelsArr;
      scope.nginxTypeAnalyzer.chartConfig.options = options;
      scope.nginxTypeAnalyzer.chartConfig.colors = [{backgroundColor: 'rgb(255,228,181)'}]
    };

    let setNginxChartLineData = (initial) => {  // initial: 初始化
      let dataArr = [];
      let series = [this.translate('MODULES.MANAGE.ELASTICSEARCH.VISIT_COUNT')];
      let labelsArr = [];
      let clientIps = [];
      let dataModel = scope.nginxTimerangeAnalyzer.dataModel;

      labelsArr = this.getTimeSeries(dataModel);

      dataModel.forEach((data) => {
        dataArr.push(data.count);

        if(initial) {
          data.clients.forEach((client) => {
            if(clientIps.indexOf(client.ip) === -1) {
              clientIps.push(client.ip);
              scope.nginxTimerangeAnalyzer.ipOptions.push({
                label: client.ip,
                value: client.ip
              });
            }
          });
        }
      });

      const pad = this.pad;

      let title = this.translate('MODULES.MANAGE.ELASTICSEARCH.API_DETAIL_COUNT_ANY');
      title = scope.nginxTimerangeAnalyzer.selectedIpOption.value ? scope.nginxTimerangeAnalyzer.selectedIpOption.value + ' - ' + title : title;
      let options = {
        title: {
          display: true,
          // text: title,
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              labelString: this.translate('MODULES.MANAGE.ELASTICSEARCH.VISIT_COUNT'),
              callback: function(value, index, values) {
                return getFormattedNumber(value);
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
              label += getFormattedNumber(tooltipItem.yLabel);
              return label;
            }
          }
        },
        // Container for zoom options
        zoom: {
          onZoom: lineChartOnZoom('nginx-analyzer')
        }
      };
      scope.nginxTimerangeAnalyzer.chartConfig.data = [dataArr];
      scope.nginxTimerangeAnalyzer.chartConfig.labels = labelsArr;
      scope.nginxTimerangeAnalyzer.chartConfig.options = options;
      scope.nginxTimerangeAnalyzer.chartConfig.series = series;
      scope.nginxTimerangeAnalyzer.chartConfig.onClick = nginxLineChartOnClick(scope.nginxTimerangeAnalyzer.dataModel);
      scope.nginxTimerangeAnalyzer.chartConfig.onHover = lineChartOnHover();
    };

    let setRealtimeNginxChartLineData = (initial) => {  // initial: 初始化
      let dataArr = [];
      let series = [this.translate('MODULES.MANAGE.ELASTICSEARCH.VISIT_COUNT')];
      let labelsArr = [];
      let clientIps = [];
      let dataModel = scope.nginxTimerangeAnalyzer.dataModel;

      labelsArr = this.getTimeSeries(dataModel);

      dataModel.forEach((data) => {
        dataArr.push(data.count);

        if(initial) {
          data.clients.forEach((client) => {
            if(clientIps.indexOf(client.ip) === -1) {
              clientIps.push(client.ip);
              scope.nginxTimerangeAnalyzer.ipOptions.push({
                label: client.ip,
                value: client.ip
              });
            }
          });
        }
      });

      scope.nginxTimerangeAnalyzer.chartConfig.options.animation = { duration: 0 };
      scope.nginxTimerangeAnalyzer.chartConfig.options.zoom.enabled = false;
      scope.nginxTimerangeAnalyzer.chartConfig.data = [dataArr];
      scope.nginxTimerangeAnalyzer.chartConfig.labels = labelsArr;
      scope.nginxTimerangeAnalyzer.chartConfig.series = series;
      scope.nginxTimerangeAnalyzer.chartConfig.onClick = nginxLineChartOnClick(scope.nginxTimerangeAnalyzer.dataModel);
    };

    let setSyslogChartLineData = () => {
      let dataArr = [];
      let series = [];
      let labelsArr = [];
      let analyzer = scope.syslogAnalyzer.dataModel;

      // labelsArr = this.getSyslogTimeSeries(analyzer);
      let x_times = this.di._.maxBy(analyzer, function(item){return item.analyzer.length;});
      labelsArr = analyzer.length > 0 ?
        this.getTimeSeries(x_times.analyzer) : [];

      analyzer.forEach((device) => {
        let data = [];
        device.analyzer.forEach((item) => {
          data.push(item.count)
        });
        dataArr.push(data);
        series.push(device.name)
      });

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.MANAGE.ELASTICSEARCH.SYSLOG_DETAIL_ANY'),
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              labelString: this.translate('MODULES.MANAGE.ELASTICSEARCH.TIMES'),
              callback: function(value, index, values) {
                return getFormattedNumber(value);
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
            title: (tooltipItem) => {
              let value = new Date(labelsArr[tooltipItem[0].index]);
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
          onZoom: lineChartOnZoom('syslog-analyzer')
        }
      };
      scope.syslogAnalyzer.chartConfig.data = dataArr;
      scope.syslogAnalyzer.chartConfig.labels = labelsArr;
      scope.syslogAnalyzer.chartConfig.options = options;
      scope.syslogAnalyzer.chartConfig.series = series;
      scope.syslogAnalyzer.chartConfig.onClick = syslogChartOnClick();
      scope.syslogAnalyzer.chartConfig.onHover = lineChartOnHover();

      // set pie chart data with first dataset and first data
      if(labelsArr.length > 0) {
        let xLabel = labelsArr[0];
        let data,title = '';

        let first = false;
        for(let key in dataModel){
          if(!first && dataModel[key].length > 0) {
            data = dataModel[key][0]['programs'];
            title = key + ' - ' + getFormatedDateTime(new Date(xLabel));
            first = true;
          }
        }

        setSyslogPieChartData(data,title)
      }
    };

    let setFilebeatChartLineData = () => {
      let dataArr = [];
      let series = [scope.filebeatAnalyzer.selectedOption.value];
      let labelsArr = [];
      let dataModel = scope.filebeatAnalyzer.dataModel;

      labelsArr = this.getTimeSeries(dataModel);

      dataModel.forEach((data) => {
        dataArr.push(data.count);
      })

      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.MANAGE.ELASTICSEARCH.SYSTEM_DETAIL_ANY'),
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              labelString: this.translate('MODULES.MANAGE.ELASTICSEARCH.TIMES'),
              callback: function(value, index, values) {
                return getFormattedNumber(value);
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
            title: (tooltipItem) => {
              let value = new Date(labelsArr[tooltipItem[0].index]);
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
          onZoom: lineChartOnZoom('filebeat-analyzer')
        }
      };

      scope.filebeatAnalyzer.chartConfig.data = [dataArr];
      scope.filebeatAnalyzer.chartConfig.labels = labelsArr;
      scope.filebeatAnalyzer.chartConfig.options = options;
      scope.filebeatAnalyzer.chartConfig.series = series;
      scope.filebeatAnalyzer.chartConfig.onClick = filebeatChartOnClick();
      scope.filebeatAnalyzer.chartConfig.onHover = lineChartOnHover();
    };

    let barChartOnClick = (analyzer) => {
      return function (evt, chart) { // point element
        // 1.element hover event
        let element = chart.getElementAtEvent(evt);
        if (element.length > 0) {
          let index = element[0]._index;
          let xLabel = chart.data.labels[index];
        
          let data = analyzer[index];
  
          let size = parseFloat(data.size.slice(0, data.size.length-2));
          let formattedSize = formatSize(size, data.size.slice(data.size.length-2))
          DI.modalManager.open({
            template: require('../template/generateCSVFileDialog.html'),
            controller: 'generateCSVFileDialogController',
            windowClass: 'show-download-modal',
            resolve: {
              dataModel: () => {
                return {
                  indiceName: data.name,
                  indiceSize: formattedSize,
                };
              }
            }
          }).result.then((data) => {
            if(!data || data.canceled) {
              scope.loading = false;
              return;
            } else if (data && !data.canceled) {
              DI.manageDataManager.getElasticsearchCSVFile()
                .then(res => {
                  let arr = res.data.file.split('/');
                  DI.$window.location.href = DI.appService.getDownloadFileUrl(arr[arr.length - 1]);
                  scope.loading = false;
                }, (error) => {
                  DI.dialogService.createDialog('error', this.translate('MODULES.MANAGE.ELASTICSEARCH.DOWNLOAD_FAILED'))
                    .then((data)=>{
                      scope.loading = false;
                    });
                })
            }
          }, () => {
            scope.loading = false;
          });
        }
      }
    }
  
    let lineChartOnHover = () => {
      return function(event, chart) {
        // 1.element hover event
        let element = chart.getElementAtEvent(event);
        if(element.length > 0) return;
      
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
      
        let startTime = new Date(ticks[startIndex]);
        let endTime = new Date(ticks[endIndex]);

        switch(chartType) {
          case 'nginx-analyzer':
            scope.nginxTimerangeAnalyzer.startTime = startTime;
            scope.nginxTimerangeAnalyzer.endTime = endTime;
            break;
          case 'syslog-analyzer':
            scope.syslogAnalyzer.startTime = startTime;
            scope.syslogAnalyzer.endTime = endTime;
            break;
          case 'filebeat-analyzer':
            scope.filebeatAnalyzer.startTime = startTime;
            scope.filebeatAnalyzer.endTime = endTime;
            break;
        }

        scope.$apply()
      }
    }

    let nginxLineChartOnClick = function(analyzer) {
      return function(evt, chart) { // point element
        // 1.element hover event
        let element = chart.getElementAtEvent(evt);
        if(element.length > 0)
        {
          let datasetIndex = element[0]._datasetIndex;
          let index = element[0]._index;
          let xLabel = chart.data.labels[index];

          let data = analyzer[index].clients ? analyzer[index].clients : [{count: analyzer[index].count, ip: scope.nginxTimerangeAnalyzer.selectedIpOption.value}];
          let title = getFormatedDateTime(new Date(xLabel));

          setNginxPieChartData(evt, data, title);

          // scope.$apply();
        }
      }
    }

    let syslogChartOnClick = function() {
      let analyzer = scope.syslogAnalyzer.dataModel;

      return function(evt, chart) { // point element
        // 1.element hover event
        let element = chart.getElementAtEvent(evt);
        if(element.length > 0)
        {
          let datasetIndex = element[0]._datasetIndex;
          let index = element[0]._index;
          let xLabel = chart.data.labels[index];

          let data = analyzer[index].clients ? analyzer[index].clients : [{count: analyzer[index].count, ip: scope.syslogAnalyzer.selectedIpOption.value}];
          let title = getFormatedDateTime(new Date(xLabel));

          setSyslogPieChartData(evt, data, title);

          // scope.$apply();
        }
      }
    }

    let filebeatChartOnClick = function() {
      let analyzer = scope.filebeatAnalyzer.dataModel;

      return function(evt, chart) { // point element
        // 1.element hover event
        let element = chart.getElementAtEvent(evt);
        if(element.length > 0)
        {
          let datasetIndex = element[0]._datasetIndex;
          let index = element[0]._index;
          let xLabel = chart.data.labels[index];

          let data = scope.filebeatAnalyzer.selectedOption.value == 'thread' ? analyzer[index].threads : analyzer[index].handlers;
          setFilebeatPieChartData(evt, data, getFormatedDateTime(new Date(xLabel)));

          // scope.$apply();
        }
      }
    }

    let setNginxPieChartData = (evt, dataArr, title) => {
      // initial
      let pieChartConfig = {};

      if(!dataArr) return;

      // set pie chart data with first dataset and first data
      let chartData = {datasets:[], labels:[]};
      let dataset = {data:[], backgroundColor:[], label: ''};

      dataArr.forEach((data) => {
        dataset.data.push(data.count);
        chartData.labels.push(data.ip);
      });

      chartData.datasets.push(dataset);

      let pieOptions = {
        title: {
          text: title,
        }
      }

      pieChartConfig.data = dataset.data;
      pieChartConfig.labels = chartData.labels;
      pieChartConfig.options = pieOptions;
      pieChartConfig.type = 'pie';

      DI.$rootScope.$emit('show_chart_tooltip', {data: pieChartConfig, event: evt});
    }

    let setSyslogPieChartData = (evt, dataArr, title) => {
      // initial
      let pieChartConfig = {}

      if(!dataArr) return;

      // set pie chart data with first dataset and first data
      let chartData = {datasets:[], labels:[]};
      let dataset = {data:[], backgroundColor:[], label: ''};

      dataArr.forEach((data) => {
        dataset.data.push(data.count);
        chartData.labels.push(data.key);
      });

      chartData.datasets.push(dataset);

      let pieOptions = {
        title: {
          text: title,
        }
      }

      pieChartConfig.data = dataset.data;
      pieChartConfig.labels = chartData.labels;
      pieChartConfig.options = pieOptions;

      DI.$rootScope.$emit('show_chart_tooltip', {data: pieChartConfig, event: evt});
    }

    let setFilebeatPieChartData = (evt, dataArr, title) => {
      // initial
      let pieChartConfig = {}
      pieChartConfig.data = [];
      pieChartConfig.labels = [];

      if(!dataArr) return;

      // set pie chart data with first dataset and first data
      let chartData = {datasets:[], labels:[]};
      let dataset = {data:[], backgroundColor:[], label: ''};

      dataArr.forEach((data) => {
        dataset.data.push(data.count);
        chartData.labels.push(data.key ? data.key : this.translate('MODULES.MANAGE.ELASTICSEARCH.UNKNOWN'));
      });

      chartData.datasets.push(dataset);

      let pieOptions = {
        title: {
          text: title,
        }
      }

      pieChartConfig.data = dataset.data;
      pieChartConfig.labels = chartData.labels;
      pieChartConfig.options = pieOptions;

      DI.$rootScope.$emit('show_chart_tooltip', {data: pieChartConfig, event: evt});
    }
    
    let formatSize = (size, unit) => {
      if(unit.toUpperCase() == 'KB'){
        if(size >= 1024 && size < 1024 * 1024) {
          return (size / 1024).toFixed(2) + 'MB'
        } else if(size >= 1024 * 1024){
          return (size / (1024 * 1024)).toFixed(2) + 'GB'
        } else {
          return size.toFixed(2) + 'KB'
        }
      } else if(unit.toUpperCase() == 'MB') {
        if(d < 0.1) {
          return (size * 1024).toFixed(2) + 'KB'
        } else if(d >= 1024) {
          return (size / 1024).toFixed(2) + 'GB'
        } else {
          return size.toFixed(2) + 'MB'
        }
      }
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
    
    this.di.$timeout(function () {init()});

    let nginxTypeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['nginxTypeAnalyzer.startTime', 'nginxTypeAnalyzer.startTime', 'nginxTypeAnalyzer.selectedOption'], () => {
      if(!nginxTypeHasChanged) {
        nginxTypeHasChanged = true;
        return;
      }

      scope.nginxTypeAnalyzer.loading = true;

      this.di.manageDataManager.getNginxTypeAnalyzer(scope.nginxTypeAnalyzer.selectedOption.value, this.getISODate(scope.nginxTypeAnalyzer.startTime), this.getISODate(scope.nginxTypeAnalyzer.endTime)).then((res) => {
        scope.nginxTypeAnalyzer.dataModel = res;
        scope.nginxTypeAnalyzer.loading = false;
        setNginxChartBarData();
      }, () => {
        scope.nginxTypeAnalyzer.dataModel = [];
        scope.nginxTypeAnalyzer.loading = false;
        setNginxChartBarData();
      });
    },true));

    let nginxTimerangeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['nginxTimerangeAnalyzer.startTime', 'nginxTimerangeAnalyzer.endTime', 'nginxTimerangeAnalyzer.selectedIpOption'], () => {
      if(!nginxTimerangeHasChanged) {
        nginxTimerangeHasChanged = true;
        return;
      }

      scope.nginxTimerangeAnalyzer.loading = true;

      let resolutionSecond = Math.floor((scope.nginxTimerangeAnalyzer.endTime.getTime() - scope.nginxTimerangeAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
      resolutionSecond = resolutionSecond < 30 ? 30 : resolutionSecond > 3600 ? 3600 : resolutionSecond;
      this.di.manageDataManager.getNginxTimerangeAnalyzer(this.getISODate(scope.nginxTimerangeAnalyzer.startTime), this.getISODate(scope.nginxTimerangeAnalyzer.endTime), resolutionSecond, scope.nginxTimerangeAnalyzer.selectedIpOption.value).then((res) => {
        scope.nginxTimerangeAnalyzer.dataModel = res;
        scope.nginxTimerangeAnalyzer.loading = false;

        if(scope.nginxTimerangeAnalyzer.isRealtime) {
          setRealtimeNginxChartLineData();
        } else {
          setNginxChartLineData();
        }
      }, () => {
        scope.nginxTimerangeAnalyzer.dataModel = [];
        scope.nginxTimerangeAnalyzer.loading = false;
        setNginxChartLineData();
      });
    },true));

    let syslogTimerangeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['syslogAnalyzer.startTime', 'syslogAnalyzer.endTime'], () => {
      if(!syslogTimerangeHasChanged) {
        syslogTimerangeHasChanged = true;
        return;
      }

      scope.syslogAnalyzer.loading = true;

      let resolutionSecond = Math.floor((scope.syslogAnalyzer.endTime.getTime() - scope.syslogAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
      resolutionSecond = resolutionSecond < 30 ? 30 : resolutionSecond > 3600 ? 3600 : resolutionSecond;

      this.getDevicesSyslogAnalyzer(devicesArr, scope.syslogAnalyzer.startTime, scope.syslogAnalyzer.endTime, resolutionSecond).then(() => {
        scope.syslogAnalyzer.loading = false;
        setSyslogChartLineData();
      }, (err) => {
        scope.syslogAnalyzer.dataModel = [];
        scope.syslogAnalyzer.loading = false;
        setSyslogChartLineData();
      });
      //
      // this.di.manageDataManager.getSyslogAnalyzer(this.getISODate(scope.syslogAnalyzer.startTime), this.getISODate(scope.syslogAnalyzer.endTime), resolutionSecond).then((res) => {
      //   scope.syslogAnalyzer.dataModel = res;
      //   scope.syslogAnalyzer.loading = false;
      //   setSyslogChartLineData();
      // }, () => {
      //   scope.syslogAnalyzer.dataModel = [];
      //   scope.syslogAnalyzer.loading = false;
      //   setSyslogChartLineData();
      // });
    },true));

    let filebeatTimerangeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['filebeatAnalyzer.startTime', 'filebeatAnalyzer.endTime', 'filebeatAnalyzer.selectedOption'], () => {
      if(!filebeatTimerangeHasChanged) {
        filebeatTimerangeHasChanged = true;
        return;
      }

      scope.filebeatAnalyzer.loading = true;

      let resolutionSecond = Math.floor((scope.filebeatAnalyzer.endTime.getTime() - scope.filebeatAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
      resolutionSecond = resolutionSecond < 30 ? 30 : resolutionSecond > 3600 ? 3600 : resolutionSecond;
      this.di.manageDataManager.getFilebeatAnalyzer(scope.filebeatAnalyzer.selectedOption.value, this.getISODate(scope.filebeatAnalyzer.startTime), this.getISODate(scope.filebeatAnalyzer.endTime), resolutionSecond).then((res) => {
        scope.filebeatAnalyzer.dataModel = res;
        scope.filebeatAnalyzer.loading = false;
        setFilebeatChartLineData();
      }, () => {
        scope.filebeatAnalyzer.dataModel = [];
        scope.filebeatAnalyzer.loading = false;
        setFilebeatChartLineData();
      });
    },true));

    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }
  
  getDeleteIndiceParams(endtime) { // endtime is timestamp
    return {
      "query" : {
        "range" : {
          "@timestamp" : {
            "lt": endtime
          }
        }
      }
    }
  }
  
  parseIndicesSize(indices) {
    let units = ['KB', 'MB', 'GB'];
    let kbFlag = false, mbFlag = false, gbFlag = false;
    
    indices.forEach(indice => {
      let unit = indice.size ? indice.size.slice(indice.size.length - 2, indice.size.length) : 'kb';
      if(unit.toUpperCase() == 'KB')
        kbFlag = true;
      if(unit.toUpperCase() == 'MB')
        mbFlag = true;
      if(unit.toUpperCase() == 'GB')
        gbFlag = true;
    })
  
    indices.forEach(indice => {
      let num = indice.size ? indice.size.slice(0,indice.size.length - 2) : 0;
      let unit = indice.size ? indice.size.slice(indice.size.length - 2, indice.size.length) : 'kb';
      if(kbFlag) {
        if(unit.toUpperCase() == 'MB')
          indice.size = parseFloat(num) * 1024 + 'KB';
        
        if(unit.toUpperCase() == 'GB')
          indice.size = parseFloat(num) * 1024 * 1024 + 'KB';
        
      } else if(mbFlag) {
        if(unit.toUpperCase() == 'GB')
          indice.size = parseFloat(num) * 1024 + 'MB';
      }
    })
  }

  
  getIndiceTimeSeries(analyzer) {
    let timeseries = [];
    analyzer.forEach((record) => {
      timeseries.push(record.from_as_string);
    });
    return timeseries;
  }
  
  getIndexDataDistribution(index) {
    let defer = this.di.$q.defer();
    let params = {
      "size": 0,
      "aggs" : {
        "max_time" : { "max" : { "field" : "@timestamp" } },
        "min_time" : { "min" : { "field" : "@timestamp" } }
      }
    };
  
    this.di.manageDataManager.getElasticsearchDataByIndexAndQuery(index, params).then(
      (res)=>{
        if(res.data && res.data.aggregations){
          let min_time = res.data.aggregations.min_time.value;
          let max_time = res.data.aggregations.max_time.value;
          
          if(min_time !== null && max_time !== null){
            this.getElasticsearchDataByTimeRange(index, min_time, max_time).then((res) => {
              defer.resolve(res);
            }, () => {
              defer.reject({})
            })
          } else {
            defer.reject({})
          }
        }
        else{
          defer.reject({})
        }
      },
      (err)=>{
        defer.reject({})
      }
    );
    return defer.promise;
  };
  
  getElasticsearchDataByTimeRange(indice, minTime, maxTime) {
    let defer = this.di.$q.defer();
    
    let range_search_json = this.timeSegmentation(minTime, maxTime);
    let search_json = {
      "size":0,
      "aggs": {
        "range": {
          "date_range": {
            "field": "@timestamp",
            "ranges": range_search_json
          }
        }
      }
    }
  
    this.di.manageDataManager.getElasticsearchDataByIndexAndQuery(indice, search_json).then((res)=>{
        let res_data = res.data.aggregations.range.buckets;
        defer.resolve(res_data);
      },
      (err)=>{
        defer.reject({})
      })
    
    return defer.promise;
  }

  getDevicesSyslogAnalyzer(devices, startTime, endTime, period) {
    let deffer = this.di.$q.defer();
    if (!devices.length){
      deffer.resolve([]);
      return deffer.promise;
    }

    let deferredArr = [];

    devices.forEach((device) => {
      let defer = this.di.$q.defer();
      this.di.manageDataManager.getSyslogAnalyzer(device.name, this.getISODate(startTime), this.getISODate(endTime), period).then((data) => {
        defer.resolve({'id': device.id, 'name': device.name, 'analyzer': data});
      });

      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then((arr) => {
      // get top5 cpu used rate
      this.di.$scope.syslogAnalyzer.dataModel = arr;
      deffer.resolve();
    });
    return deffer.promise;
  }
  
  timeSegmentation(min, max) {
    const INTERVAL_COUNT = 24;
    
    let interval = (max - min)/INTERVAL_COUNT;
    let es_search_json = [];
    // { "from": 1.539940696E+12, "to": 1.540940696E+12, "key":"v1" },
    
    this.di._.times(INTERVAL_COUNT, (c)=>{
      let j = {'key':"seq_" + (c + 1)};
      j['from'] = min + c*interval;
      j['to'] = min + (c+1)*interval;
      es_search_json.push(j);
    })
    
    return es_search_json
  };

  getISODate(date) {
    return date.getUTCFullYear() +
      '-' + this.pad( date.getUTCMonth() + 1 ) +
      '-' + this.pad( date.getUTCDate() ) +
      'T' + this.pad( date.getUTCHours() ) +
      ':' + this.pad( date.getUTCMinutes() ) +
      ':' + this.pad( date.getUTCSeconds() ) +
      'Z';
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

  getTimeSeries(dataArr) {
    let timeseries = [];
    dataArr.forEach((data) => {
      timeseries.push(data.timepoint);
    });

    return timeseries;
  }

  getFormattedNumber(num) {
    let numArr = num.toString().split('');
    let numLength = numArr.length;
    let formattedNum = '';
    let diffCount = numLength % 3;
    for(let i = 1; i <= numLength; i++) {
      formattedNum += numArr[i-1];

      if((i - diffCount) % 3 == 0 && i < numLength) {
        formattedNum += ','
      }
    }

    return formattedNum;
  }

  pad(num, count) {
    if(!count){
      count = 2;
    }
    let numStr = num + '';
    if(numStr.length !== count) {
      return '0'.repeat(count - numStr.length) + numStr
    } else
      return num
  };
}

AnalyzerController.$inject = AnalyzerController.getDI();
AnalyzerController.$$ngIsClass = true;
