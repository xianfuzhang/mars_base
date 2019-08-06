// import {MDCRipple} from '@material/ripple';
export class ElasticsearchController {
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
      'manageDataManager',
      'modalManager',
    ];
  }
  
  constructor(...args) {
    this.di = {};
    ElasticsearchController.getDI().forEach((value, index) => {
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

    this.scope.pageTitle = this.translate('MODULE.HEADER.MANAGE.ELASTICSEARCH');
    
    let unSubscribers = [];
    let dataModel = {};
    const INTERVAL_COUNT = 30;
    let date = DI.dateService.getTodayObject();
    let before = DI.dateService.getBeforeDateObject(20*60*1000);

    const CHART_GRID_NUM = 36; // chart grid number
    let ngxin_before = this.di.dateService.getBeforeDateObject(60*1000*60 * 24); // 前一天
    let nginx_begin_time = new Date(ngxin_before.year, ngxin_before.month, ngxin_before.day, ngxin_before.hour, ngxin_before.minute, 0);
    let nginx_end_time = new Date(date.year, date.month, date.day, date.hour, date.minute, 0);

    scope.elasticsearchModel = {
      selectedIndice: '',
      indice: {
        'analyzer': [],
        'min_time': '',
        'max_time': ''
      },
      indiceOptions: [],
      summaryLoading: true,
      analyzerLoading: true,
    };

    scope.nginxTypeAnalyzer = {
      selectedOption: {},
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
      selectedOption: {},
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
      selectedIpOption: null,
      ipOptions: [{
        label: '--' + this.translate('MODULES.MANAGE.ELASTICSEARCH.SELECT_ALL_IP') +'--',
        value: ''
      }],
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
      selectedOption: {},
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

    scope.indiceSummaryChartConfig = {
      data: [],
      labels: [],
      options: {},
      colors: []
    }
  
    scope.indiceAnalyzerChartConfig = {
      data: [],
      labels: [],
      options: {},
      series: [],
      onClick: () => {}
    }

    scope.backup = () => {
      scope.loading = true;
    
      DI.modalManager.open({
        template: require('../template/inputFilenameDialog.html'),
        controller: 'inputFilenameDialogController',
        windowClass: 'show-input-filename-modal',
        resolve: {
          dataModel: () => {
          }
        }
      })
        .result.then((data) => {
        if(!data || data.canceled) {
          scope.loading = false;
          return;
        } else if (data && !data.canceled) {
          let filename = data.data.filename;
        
          this.di.manageDataManager.putBackupElasticsearch(filename).then(
            (res) => { // success to save
              this.di.dialogService.createDialog('success', this.translate('MODULES.MANAGE.ELASTICSEARCH.BACKUP.SUCCESS'))
                .then((data)=>{
                  scope.loading = false;
                })
            },
            (err) => { // error to save
              this.di.dialogService.createDialog('error', this.translate('MODULES.MANAGE.ELASTICSEARCH.BACKUP.FAILED'))
                .then((data)=>{
                  scope.loading = false;
                })
            }
          )
        }
      });
    };

    scope.clear = (defaultTime) => {
      let begin_date, end_date, begin_time, end_time;
  
      DI.modalManager.open({
        template: require('../template/selectDateDialog.html'),
        controller: 'selectDateDialogController',
        windowClass: 'date-rate-modal',
        resolve: {
          dataModel: () => {
            return {
              'defaultTime': defaultTime ? defaultTime : '',
              'indiceSelectedOption': scope.elasticsearchModel.indiceSelectedOption,
              'indiceOptions': scope.elasticsearchModel.indiceOptions
            };
          }
        }
      }).result.then((data) => {
        if(!data || data.canceled) {
          scope.loading = false;
        } else if (data && !data.canceled) {
          scope.loading = true;
          DI.$rootScope.$emit('start_loading');
          
          let endtime = data.data.endtime.getTime();
          let params = this.getDeleteIndiceParams(endtime);
  
          DI.manageDataManager.deleteElasticsearcIndexByTime(this.scope.elasticsearchModel.selectedIndice, params).then(
            (res) => { // success to save
              DI.$rootScope.$emit('stop_loading');
  
              DI.dialogService.createDialog('success', this.translate('MODULES.MANAGE.ELASTICSEARCH.CLEAR.SUCCESS'))
                .then((data)=>{
                  init(); // 初始化
                }, () => {
                  init();
                })
            },
            (err) => { // error to save
              DI.$rootScope.$emit('stop_loading');
              DI.dialogService.createDialog('error', this.translate('MODULES.MANAGE.ELASTICSEARCH.CLEAR.FAILED'))
                .then((data)=>{
                  scope.loading = false;
                  
                }, (data)=>{
                  scope.loading = false;
                })
            }
          )
        }
      });
    };
    
    scope.indiceSelect = ($value) => {
      scope.elasticsearchModel.selectedIndice = $value.value;
      scope.elasticsearchModel.analyzerLoading = true;
      
      this.getIndiceAnalyzer().then(() => {
        setIndiceAnalyzerChartData();
        scope.elasticsearchModel.analyzerLoading = false;
      }, () => {
        setIndiceAnalyzerChartData();
        scope.elasticsearchModel.analyzerLoading = false;
      });
    };
  
    scope.resetTimeScale = (chartType) => {
      switch(chartType) {
        case 'indice-analyzer':
          scope.elasticsearchModel.analyzerLoading = true;

          this.getIndiceAnalyzer().then( () => {
            setIndiceAnalyzerChartData();
            scope.elasticsearchModel.analyzerLoading = false;
          }, () => {
            scope.elasticsearchModel.analyzerLoading = false;
          })
          break;
      }
    }

    let init =() =>{
      scope.loading = true;

      // get indices sumary
      this.di.manageDataManager.getElasticsearcStatus().then((res) => {
        res.data.indices.forEach((indice) => {
          if(indice.size === undefined) {
            indice.size = '0kb'
          }
        })
        dataModel['indices'] = res.data.indices;
  
        scope.elasticsearchModel.indiceOptions = [];
        res.data.indices.forEach((indice) => {
          scope.elasticsearchModel.indiceOptions.push({label: indice.name, value: indice.name})
        });
  
        setIndiceSummaryChartData(dataModel.indices);
        scope.elasticsearchModel.summaryLoading = false;
  
        if(scope.elasticsearchModel.indiceOptions.length == 0) return;
  
        scope.elasticsearchModel.indiceSelectedOption = scope.elasticsearchModel.indiceOptions[0]
        scope.elasticsearchModel.selectedIndice = scope.elasticsearchModel.indiceOptions[0].value;
        
        // get indice size by time
        this.getIndiceAnalyzer().then( () => {
          setIndiceAnalyzerChartData();
          scope.elasticsearchModel.analyzerLoading = false;
          scope.loading = false;
        }, () => {
          scope.loading = false;
        })
      })
    };

    let setIndiceSummaryChartData = (indices) => {
      let dataArr = [], labelsArr = [];
    
      this.parseIndicesSize(indices);
      let y_label = indices[0].size.slice(indices[0].size.length - 2, indices[0].size.length);
      let size = [];
  
      DI._.forEach(indices, (indice)=>{
        let name = '';
        labelsArr.push(indice.name);
        size.push(indice.size.slice(0, indice.size.length - 2));
      });
      dataArr.push(size);
      
      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.MANAGE.ELASTICSEARCH.SPACE_STATIC')
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: y_label
            },
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return getFormattedNumber(value);
              }
            }
          }],
          xAxes: [{
            barThickness: 50,
          }],
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem) => {
              let value = parseFloat(tooltipItem.yLabel);
              
              return this.translate('MODULES.MANAGE.ELASTICSEARCH.STORAGE_USAGE_NUM', {'number': formatSize(value, y_label)});
            }
          }
        }
      }
    
      scope.indiceSummaryChartConfig.data = dataArr;
      scope.indiceSummaryChartConfig.labels = labelsArr;
      scope.indiceSummaryChartConfig.series = [this.translate('MODULES.MANAGE.ELASTICSEARCH.STORAGE_USAGE')];
      scope.indiceSummaryChartConfig.colors = [{backgroundColor: 'rgb(250,128,114)'}];
      scope.indiceSummaryChartConfig.options = options;
      scope.indiceSummaryChartConfig.onClick = barChartOnClick(indices);
    };
    
    let setIndiceAnalyzerChartData = () => {
      //indice analyzer
      let memoryCols = [], dataArr = [], series = [scope.elasticsearchModel.selectedIndice];
      let records = this.getIndiceChartData(this.scope.elasticsearchModel.indice.analyzer);
      let labelsArr = scope.elasticsearchModel.indice.analyzer.length > 0 ?
        this.getIndiceTimeSeries(scope.elasticsearchModel.indice.analyzer) : [];
  
      if(records.length) {
        records.forEach((item) =>{
          let arr = [];
          arr.push(scope.elasticsearchModel.selectedIndice);
          arr = arr.concat(item.data);
          dataArr.push(arr);
        });
      }
  
      const pad = this.pad;
      let options = {
        title: {
          display: true,
          // text: this.translate('MODULES.MANAGE.ELASTICSEARCH.DATA_TIME'),
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: this.translate('MODULES.MANAGE.ELASTICSEARCH.COUNT')
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
                let d = new Date(value);
                return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
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
          // Useful for dynamic data loading
          onZoom: lineChartOnZoom('indice-analyzer')
        }
      }
    
      scope.indiceAnalyzerChartConfig.data = dataArr;
      scope.indiceAnalyzerChartConfig.labels = labelsArr;
      scope.indiceAnalyzerChartConfig.options = options;
      scope.indiceAnalyzerChartConfig.series = series;
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
            value.pointRadius = 2;
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
          case 'indice-analyzer':
            scope.elasticsearchModel.indice.min_time = startTime.getTime();
            scope.elasticsearchModel.indice.max_time = endTime.getTime();
            break;
          // case 'nginx-analyzer':
          //   scope.nginxTimerangeAnalyzer.startTime = startTime;
          //   scope.nginxTimerangeAnalyzer.endTime = endTime;
          //   break;
          // case 'syslog-analyzer':
          //   scope.syslogAnalyzer.startTime = startTime;
          //   scope.syslogAnalyzer.endTime = endTime;
          //   break;
          // case 'filebeat-analyzer':
          //   scope.filebeatAnalyzer.startTime = startTime;
          //   scope.filebeatAnalyzer.endTime = endTime;
          //   break;
        }

        scope.$apply()
      }
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
  
    let download = () => {
      scope.loading = true;
      let indiceOptions = scope.elasticsearchModel.indiceOptions;
      this.di.modalManager.open({
        template: require('../template/generateCSVFileDialog.html'),
        controller: 'generateCSVFileDialogController',
        windowClass: 'date-rate-modal',
        resolve: {
          dataModel: () => {
            return {
              'indiceOptions': indiceOptions,
            };
          }
        }
      })
        .result.then((data) => {
        if(!data || data.canceled) {
          scope.loading = false;
          return;
        } else if (data && !data.canceled) {
          this.di.manageDataManager.getElasticsearchCSVFile()
            .then(res => {
              let arr = res.data.file.split('/');
              this.di.$window.location.href = this.di.appService.getDownloadFileUrl(arr[arr.length - 1]);
              scope.loading = false;
              // let DI = this.di;
              // DI.$rootScope.$emit('start_loading');
              // DI.appService.downloadFileWithAuth(url, arr[arr.length - 1]).then(() => {
              //   DI.$rootScope.$emit('stop_loading');
              //   scope.loading = false;
              // }, () => {
              //   DI.$rootScope.$emit('stop_loading');
              //   scope.loading = false;
              //   this.di.dialogService.createDialog('error', '下载失败！')
              //     .then((data)=>{
              //       scope.loading = false;
              //     });
              // });
            
            }, (error) => {
              this.di.dialogService.createDialog('error',  this.translate('MODULES.MANAGE.ELASTICSEARCH.DOWNLOAD_FAILED'))
                .then((data)=>{
                  scope.loading = false;
                });
            })
        }
      }, () => {
        scope.loading = false;
      });
    };

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
  
    let indiceTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['elasticsearchModel.indice.min_time', 'elasticsearchModel.indice.max_time'], () => {
      if(!indiceTimeHasChanged) {
        indiceTimeHasChanged = true;
        return;
      }

      scope.elasticsearchModel.analyzerLoading = true;

      this.getIndiceAnalyzerWithTime().then(() => {
        setIndiceAnalyzerChartData();
        scope.elasticsearchModel.analyzerLoading = false;
      }, () => {
        setIndiceAnalyzerChartData();
        scope.elasticsearchModel.analyzerLoading = false;
      });
  
      
    },true));

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

    // let nginxTimerangeHasChanged = false;
    // unSubscribers.push(this.di.$scope.$watchGroup(['nginxTimerangeAnalyzer.startTime', 'nginxTimerangeAnalyzer.endTime', 'nginxTimerangeAnalyzer.selectedIpOption'], () => {
    //   if(!nginxTimerangeHasChanged) {
    //     nginxTimerangeHasChanged = true;
    //     return;
    //   }
    //
    //   scope.nginxTimerangeAnalyzer.loading = true;
    //
    //   let resolutionSecond = Math.floor((scope.nginxTimerangeAnalyzer.endTime.getTime() - scope.nginxTimerangeAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
    //   resolutionSecond = resolutionSecond < 30 ? 30 : resolutionSecond > 3600 ? 3600 : resolutionSecond;
    //   this.di.manageDataManager.getNginxTimerangeAnalyzer(this.getISODate(scope.nginxTimerangeAnalyzer.startTime), this.getISODate(scope.nginxTimerangeAnalyzer.endTime), resolutionSecond, scope.nginxTimerangeAnalyzer.selectedIpOption.value).then((res) => {
    //     scope.nginxTimerangeAnalyzer.dataModel = res;
    //     scope.nginxTimerangeAnalyzer.loading = false;
    //     setNginxChartLineData();
    //   }, () => {
    //     scope.nginxTimerangeAnalyzer.dataModel = [];
    //     scope.nginxTimerangeAnalyzer.loading = false;
    //     setNginxChartLineData();
    //   });
    // },true));

    // let syslogTimerangeHasChanged = false;
    // unSubscribers.push(this.di.$scope.$watchGroup(['syslogTimerangeAnalyzer.startTime', 'syslogTimerangeAnalyzer.endTime'], () => {
    //   if(!syslogTimerangeHasChanged) {
    //     syslogTimerangeHasChanged = true;
    //     return;
    //   }
    //
    //   scope.syslogAnalyzer.loading = true;
    //
    //   let resolutionSecond = Math.floor((scope.syslogAnalyzer.endTime.getTime() - scope.syslogAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
    //   resolutionSecond = resolutionSecond < 30 ? 30 : resolutionSecond > 3600 ? 3600 : resolutionSecond;
    //   this.di.manageDataManager.getSyslogAnalyzer(this.getISODate(scope.syslogAnalyzer.startTime), this.getISODate(scope.syslogAnalyzer.endTime), resolutionSecond).then((res) => {
    //     scope.syslogAnalyzer.dataModel = res;
    //     scope.syslogAnalyzer.loading = false;
    //     setSyslogChartLineData();
    //   }, () => {
    //     scope.syslogAnalyzer.dataModel = [];
    //     scope.syslogAnalyzer.loading = false;
    //     setSyslogChartLineData();
    //   });
    // },true));

    // let filebeatTimerangeHasChanged = false;
    // unSubscribers.push(this.di.$scope.$watchGroup(['filebeatAnalyzer.startTime', 'filebeatAnalyzer.endTime', 'filebeatAnalyzer.selectedOption'], () => {
    //   if(!filebeatTimerangeHasChanged) {
    //     filebeatTimerangeHasChanged = true;
    //     return;
    //   }
    //
    //   scope.filebeatAnalyzer.loading = true;
    //
    //   let resolutionSecond = Math.floor((scope.filebeatAnalyzer.endTime.getTime() - scope.filebeatAnalyzer.startTime.getTime()) / 1000 / CHART_GRID_NUM);
    //   resolutionSecond = resolutionSecond < 30 ? 30 : resolutionSecond > 3600 ? 3600 : resolutionSecond;
    //   this.di.manageDataManager.getFilebeatAnalyzer(scope.filebeatAnalyzer.selectedOption.value, this.getISODate(scope.filebeatAnalyzer.startTime), this.getISODate(scope.filebeatAnalyzer.endTime), resolutionSecond).then((res) => {
    //     scope.filebeatAnalyzer.dataModel = res;
    //     scope.filebeatAnalyzer.loading = false;
    //     setFilebeatChartLineData();
    //   }, () => {
    //     scope.filebeatAnalyzer.dataModel = [];
    //     scope.filebeatAnalyzer.loading = false;
    //     setFilebeatChartLineData();
    //   });
    // },true));

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
  
  getIndiceAnalyzer() {
    let defer = this.di.$q.defer();
  
    this.getIndexDataDistribution(this.scope.elasticsearchModel.selectedIndice).then((res)=>{
      this.di.$scope.elasticsearchModel.indice.analyzer = res;
      defer.resolve();
    },(err)=>{
      this.di.$scope.elasticsearchModel.indice.analyzer = []
      defer.reject(err)
    });
    return defer.promise;
  }
  
  getIndiceAnalyzerWithTime() {
    let defer = this.di.$q.defer();
  
    let minTime = this.scope.elasticsearchModel.indice.min_time
    let maxTime = this.scope.elasticsearchModel.indice.max_time
    let indice = this.scope.elasticsearchModel.selectedIndice;
    
    this.getElasticsearchDataByTimeRange(indice, minTime, maxTime).then((res) => {
      this.scope.elasticsearchModel.indice.analyzer = res;
      defer.resolve();
    }, (err) => {
      this.scope.elasticsearchModel.indice.analyzer = [];
      defer.reject(err)
    })
    
    return defer.promise;
  }
  
  getIndiceChartData(analyzer) {
    let indices = [];
    let data = [], indiceObj = {};
    analyzer.forEach((record) =>{
      let utilize = record.doc_count;
      data.push(utilize);
    });
    // indiceObj['name'] = analyzer.name;
    // indiceObj['avarage'] = this.di._.sum(data)/data.length;
    indiceObj['data'] = data;
    indices.push(indiceObj);
    
    // devices = this.di._.orderBy(devices, 'avarage', 'desc');
    return indices;
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

  getSyslogTimeSeries(dataArr) {
    let timeseries = [];

    if(!dataArr.length) return timeseries;

    let first = false;
    for(let key in dataArr) {
      if(first) continue;

      first = true;
      dataArr[key].forEach((data) => {
        timeseries.push(data.timepoint);
      })
    }

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

ElasticsearchController.$inject = ElasticsearchController.getDI();
ElasticsearchController.$$ngIsClass = true;

