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
    this.scope.pageTitle = this.translate('MODULE.HEADER.MANAGE.ELASTICSEARCH');
    
    let unSubscribers = [];
    let dataModel = {};
    let date = this.di.dateService.getTodayObject();
    let before = this.di.dateService.getBeforeDateObject(20*60*1000);
    this.scope.dashboardModel = {
      indice: {
        'analyzer': [],
      },
      indiceOptions: []
    };
  
    this.scope.backup = () => {
      this.scope.loading = true;
      
      this.di.modalManager.open({
        template: require('../template/inputFilenameDialog.html'),
        controller: 'inputFilenameDialogController',
        windowClass: 'date-rate-modal',
        resolve: {
          dataModel: () => {
            // return {
            //   'filename': 'backup',
            // };
          }
        }
      })
      .result.then((data) => {
        if(data.canceled) {
          this.scope.loading = false;
          return;
        } else if (data && !data.canceled) {
          let filename = data.data.filename;
        
          this.di.manageDataManager.putBackupElasticsearch(filename).then(
            (res) => { // success to save
              this.di.dialogService.createDialog('success', '备份成功！')
                .then((data)=>{
                  this.scope.loading = false;
                })
            },
            (err) => { // error to save
              this.di.dialogService.createDialog('error', '备份失败！')
                .then((data)=>{
                  this.scope.loading = false;
                })
            }
          )
        }
      });
    };
  
    this.scope.download = () => {
      this.scope.loading = true;
      let indiceOptions = this.scope.dashboardModel.indiceOptions;
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
        if(data.canceled) {
          this.scope.loading = false;
          return;
        } else if (data && !data.canceled) {
          this.di.manageDataManager.getElasticsearchCSVFile()
            .then(res => {
              let arr = res.data.file.split('/')
              // let fileUrl = this.di.appService.getDownloadFileUrl(arr[arr.length - 1]);
              this.di.$window.location.href = '/download/' + arr[arr.length - 1];
              this.scope.loading = false;
            }, (error) => {
              this.di.dialogService.createDialog('error', '下载失败！')
                .then((data)=>{
                  this.scope.loading = false;
                });
            })
        }
      });
    };
    
    this.scope.clear = (defaultTime) => {
      let begin_date, end_date, begin_time, end_time;
  
      this.di.modalManager.open({
        template: require('../template/selectDateDialog.html'),
        controller: 'selectDateDialogController',
        windowClass: 'date-rate-modal',
        resolve: {
          dataModel: () => {
            return {
              'defaultTime': defaultTime ? defaultTime : '',
              'indiceSelectedOption': this.scope.dashboardModel.indiceSelectedOption,
              'indiceOptions': this.scope.dashboardModel.indiceOptions
            };
          }
        }
      }).result.then((data) => {
        if(data.canceled) {
          this.scope.loading = false;
        } else if (data && !data.canceled) {
          this.scope.loading = true;
          this.di.$rootScope.$emit('start_loading');
          
          let endtime = data.data.endtime.getTime();
          let params = this.getDeleteIndiceParams(endtime);
  
          this.di.manageDataManager.deleteElasticsearcIndexByTime(this.scope.dashboardModel.selectedIndice, params).then(
            (res) => { // success to save
              this.di.$rootScope.$emit('stop_loading');
              
              this.di.dialogService.createDialog('success', '清理成功！')
                .then((data)=>{
                  init(); // 初始化
                }, () => {
                  init();
                })
            },
            (err) => { // error to save
              this.di.$rootScope.$emit('stop_loading');
              this.di.dialogService.createDialog('error', '清理失败！')
                .then((data)=>{
                  this.scope.loading = false;
                  
                }, (data)=>{
                  this.scope.loading = false;
                })
            }
          )
        }
      });
    };
    
    this.scope.indiceSelect = ($value) => {
      this.scope.dashboardModel.selectedIndice = $value.value;
      this.scope.loading = true;
      
      this.getIndiceAnalyzer().then(() => {
        convertIndiceAnalyzer();
        this.scope.loading = false;
      }, () => {
        convertIndiceAnalyzer();
        this.scope.loading = false;
      });
    };
    
    const DI = this.di;
    
    let init =() =>{
      this.scope.loading = true;
      
      let scope = this.scope;
      // get indices sumary
      this.di.manageDataManager.getElasticsearcStatus().then((res) => {
        dataModel['indices'] = res.data.indices;
  
        this.scope.dashboardModel.indiceOptions = [];
        res.data.indices.forEach((indice) => {
          this.scope.dashboardModel.indiceOptions.push({label: indice.name, value: indice.name})
        });
  
        chartIndiceSummary(dataModel.indices, 'indice-summary');
  
        if(this.scope.dashboardModel.indiceOptions.length == 0) return;
  
        this.scope.dashboardModel.indiceSelectedOption = this.scope.dashboardModel.indiceOptions[0]
        this.scope.dashboardModel.selectedIndice = this.scope.dashboardModel.indiceOptions[0].value;
        
        // get indice size by time
        this.getIndiceAnalyzer().then( () => {
          convertIndiceAnalyzer();
          scope.loading = false;
        }, () => {
          scope.loading = false;
        })
      })
    };
    
    let chartIndiceSummary = (indices, bindTo) =>{
      this.parseIndicesSize(indices);
      let y_label = indices[0].size.slice(indices[0].size.length - 2, indices[0].size.length);
      let category= [], rxs = [], size = ['占用空间'];
      
      this.di._.forEach(indices, (indice)=>{
        let name = '';
        category.push(indice.name);
        size.push(indice.size.slice(0, indice.size.length - 2));
      });
      rxs.push(size);
      
      let chart = this.di.c3.generate({
        bindto: '#' + bindTo,
        data: {
          columns: rxs,
          type: 'bar',
          groups: [['占用空间']]
        },
        color: {
          pattern: ['#0077cb']
        },
        axis: {
          x: {
            type: 'category',
            height: 40,
            categories: category
          },
          y:{
            label: y_label,
          }
        },
        tooltip: {
          format: {
            value: (d) => {
              if(y_label.toUpperCase() == 'KB'){
                if(d >= 1024 && d < 1024 * 1024) {
                  return (d / 1024).toFixed(2) + 'MB'
                } else if(d >= 1024 * 1024){
                  return (d / (1024 * 1024)).toFixed(2) + 'GB'
                } else {
                  return d.toFixed(2) + 'KB'
                }
              } else if(y_label.toUpperCase() == 'MB') {
                if(d < 0.1) {
                  return (d * 1024).toFixed(2) + 'KB'
                } else if(d >= 1024) {
                  return (d / 1024).toFixed(2) + 'GB'
                } else {
                  return d.toFixed(2) + 'MB'
                }
              }
            }
          }
        }
      });
    }
  
    let convertIndiceAnalyzer = () => {
      //indice analyzer
      let memoryCols = [];
      let records = this.getIndiceChartData(this.scope.dashboardModel.indice.analyzer);
      let x_axis = this.scope.dashboardModel.indice.analyzer.length > 0 ?
        this.getIndiceTimeSeries(this.scope.dashboardModel.indice.analyzer) : ['x'];
      
      memoryCols.push(x_axis);
      if(records.length) {
        records.forEach((item) =>{
          let arr = [];
          arr.push(this.scope.dashboardModel.selectedIndice);
          arr = arr.concat(item.data);
          memoryCols.push(arr);
        });
      }
    
      let scope = this.scope;
      let indiceChart = this.di.c3.generate({
        bindto: '#indiceAnalyzer',
        data: {
          x: 'x',
          type: 'area-spline',
          columns: memoryCols,
          xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
          onclick: (d, element) => {
            
            let time = d.x.getFullYear() + '-' + this.pad(d.x.getMonth() + 1) + '-' + this.pad(d.x.getDate()) + 'T' + this.pad(d.x.getHours()) + ':' + this.pad(d.x.getMinutes());
            
            scope.clear(time)
          }
        },
        color: {
          pattern: ['#009f0e']
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: (d) => {
                return this.pad(d.getMonth() + 1) + '-' + d.getDate() + ' ' + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
              }
            }
          },
          y: {
            label: 'count数量',
            tick: {
              format: function (d) { return d; }
            }
          }
        },
        tooltip: {
          format: {
            title: (val) => {
              return this.pad(val.getMonth() + 1) + '-' + this.pad(val.getDate()) + ' '
                + this.pad(val.getHours()) + ':' + this.pad(val.getMinutes());
            },
            value: (val, ratio, id, index) => {
              let sum = 0;
              for(let i=0;i < index + 1; i++){
                sum += memoryCols[1][i + 1]
              }
              return '总量：' + sum + ', 新增：' + val;
            }
          }
        }
      });
    };
    
    this.di.$timeout(function () {init()});
    
    this.scope.$on('$destroy', () => {
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
  
    this.getIndexDataDistribution(this.scope.dashboardModel.selectedIndice).then((res)=>{
      this.di.$scope.dashboardModel.indice.analyzer = res;
      defer.resolve();
    },(err)=>{
      this.di.$scope.dashboardModel.indice.analyzer = []
      defer.reject(err)
    });
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
    let timeseries = ['x'];
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
  
    let intervalCount = 12;
    let timeSegmentation = (min, max) =>{
      let interval = (max - min)/intervalCount;
      let es_search_json = [];
      // { "from": 1.539940696E+12, "to": 1.540940696E+12, "key":"v1" },
    
      this.di._.times(intervalCount, (c)=>{
        let j = {'key':"seq_" + (c + 1)};
        j['from'] = min + c*interval;
        j['to'] = min + (c+1)*interval;
        es_search_json.push(j);
      })
    
      return es_search_json
    };
    
    this.di.manageDataManager.getElasticsearchDataByIndexAndQuery(index, params).then(
      (res)=>{
        if(res.data && res.data.aggregations){
          let min_time = res.data.aggregations.min_time.value;
          let max_time = res.data.aggregations.max_time.value;
          
          if(min_time !== null && max_time !== null){
            let range_search_json = timeSegmentation(min_time, max_time);
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
            
            this.di.manageDataManager.getElasticsearchDataByIndexAndQuery(index, search_json).then((res)=>{
                let res_data = res.data.aggregations.range.buckets;
                defer.resolve(res_data);
              },
              (err)=>{
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
  
  pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
  }
}

ElasticsearchController.$inject = ElasticsearchController.getDI();
ElasticsearchController.$$ngIsClass = true;

