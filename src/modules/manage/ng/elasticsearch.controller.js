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
    this.scope.pageTitle = this.translate('MODULE.HEADER.MANAGE.ELASTICSEARCH');
    
    let unSubscribers = [];
    let dataModel = {};
    const INTERVAL_COUNT = 30;
    let date = DI.dateService.getTodayObject();
    let before = DI.dateService.getBeforeDateObject(20*60*1000);
    scope.elasticsearchModel = {
      selectedIndice: '',
      indice: {
        'analyzer': [],
        'min_time': '',
        'max_time': ''
      },
      indiceOptions: [],
      summaryLoading: true,
      analyzerLoading: true
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
              this.di.dialogService.createDialog('success', '备份成功！')
                .then((data)=>{
                  scope.loading = false;
                })
            },
            (err) => { // error to save
              this.di.dialogService.createDialog('error', '备份失败！')
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
  
              DI.dialogService.createDialog('success', '清理成功！')
                .then((data)=>{
                  init(); // 初始化
                }, () => {
                  init();
                })
            },
            (err) => { // error to save
              DI.$rootScope.$emit('stop_loading');
              DI.dialogService.createDialog('error', '清理失败！')
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
      scope.loading = true;
      
      this.getIndiceAnalyzer().then(() => {
        setIndiceAnalyzerChartData();
        scope.loading = false;
      }, () => {
        setIndiceAnalyzerChartData();
        scope.loading = false;
      });
    };
  
    scope.resetTimeScale = () => {
      this.getIndiceAnalyzer().then( () => {
        setIndiceAnalyzerChartData();
        scope.loading = false;
      }, () => {
        scope.loading = false;
      })
    }
    
    let init =() =>{
      scope.loading = true;
      
      // get indices sumary
      this.di.manageDataManager.getElasticsearcStatus().then((res) => {
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
          text: '空间占用情况统计'
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: y_label
            },
            ticks: {
              beginAtZero: false,
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
              
              return '占用空间:' + formatSize(value, y_label);
            }
          }
        }
      }
    
      scope.indiceSummaryChartConfig.data = dataArr;
      scope.indiceSummaryChartConfig.labels = labelsArr;
      scope.indiceSummaryChartConfig.series = ['占用空间'];
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
          text: '收录数据总量时间分布',
        },
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'count数量'
            },
            ticks: {
              beginAtZero: false,
            }
          }],
          xAxes: [{
            ticks: {
              callback: function(value, index, values) {
                let d = new Date(value);
                return pad(d.getMonth() + 1) + '-' + d.getDate() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
              }
            }
          }],
        },
        // Container for zoom options
        zoom: {
          // Useful for dynamic data loading
          onZoom: lineChartOnZoom()
        }
      }
    
      scope.indiceAnalyzerChartConfig.data = dataArr;
      scope.indiceAnalyzerChartConfig.labels = labelsArr;
      scope.indiceAnalyzerChartConfig.options = options;
      scope.indiceAnalyzerChartConfig.series = series;
      // this.di.$scope.indiceAnalyzerChartConfig.onClick = cpuChartOnClick(scope.elasticsearchModel.cpu.analyzer, scope.switchCpuPieChartConfig);
      // this.di.$scope.indiceAnalyzerChartConfig.onHover = lineChartOnHover();
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
                  DI.dialogService.createDialog('error', '下载失败！')
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
  
    let lineChartOnZoom = () => {
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
      
        let startTime = new Date(ticks[startIndex]).getTime();
        let endTime = new Date(ticks[endIndex]).getTime();
      
        scope.elasticsearchModel.indice.min_time = startTime;
        scope.elasticsearchModel.indice.max_time = endTime;
      
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
              this.di.dialogService.createDialog('error', '下载失败！')
                .then((data)=>{
                  scope.loading = false;
                });
            })
        }
      }, () => {
        scope.loading = false;
      });
    };
    
    this.di.$timeout(function () {init()});
  
    let indiceTimeHasChanged = false;
    unSubscribers.push(this.di.$scope.$watchGroup(['elasticsearchModel.indice.min_time', 'elasticsearchModel.indice.max_time'], () => {
      if(!indiceTimeHasChanged) {
        indiceTimeHasChanged = true;
        return;
      }
      
      this.getIndiceAnalyzerWithTime().then(() => {
        setIndiceAnalyzerChartData();
        scope.loading = false;
      }, () => {
        setIndiceAnalyzerChartData();
        scope.loading = false;
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
      let unit = indice.size.slice(indice.size.length - 2, indice.size.length);
      if(unit.toUpperCase() == 'KB')
        kbFlag = true;
      if(unit.toUpperCase() == 'MB')
        mbFlag = true;
      if(unit.toUpperCase() == 'GB')
        gbFlag = true;
    })
  
    indices.forEach(indice => {
      let num = indice.size.slice(0,indice.size.length - 2)
      let unit = indice.size.slice(indice.size.length - 2, indice.size.length);
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
  
  getISODate(date) {
    return date.getUTCFullYear() +
      '-' + this.pad( date.getUTCMonth() + 1 ) +
      '-' + this.pad( date.getUTCDate() ) +
      'T' + this.pad( date.getUTCHours() ) +
      ':' + this.pad( date.getUTCMinutes() ) +
      'Z';
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
  
  pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
  }
}

ElasticsearchController.$inject = ElasticsearchController.getDI();
ElasticsearchController.$$ngIsClass = true;

