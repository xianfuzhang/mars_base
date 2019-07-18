export class TimeRangeController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$timeout',
      '$filter',
      '$q',
      '$log',
      '$uibModal',
      'roleService',
      'appService',
      'notificationService',
      'manageService',
      'manageDataManager',
      'deviceDataManager',
      'tableProviderFactory',
      'dialogService',
    ];
  }

  constructor(...args) {
    this.di = {};
    TimeRangeController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    scope.role = this.di.roleService.getRole();
    this.translate = this.di.$filter('translate');


    scope.deviceConfigs = null;
    scope.timeRanges = null;
    scope.timeRangeModel = {
      // 'deviceDisplay': {'hint':'交换机', 'options':[]},
      'deviceDisplay': {'options': [{'label': this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_DEVICE'), 'value': null}]},
      'nameDisplay': {'options': [{'label': this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_NAME'), 'value': null}]},
      'curDevice': null,
      'curName': null,
      'times': [],
      actionsShow: {
        'menu': {'enable': false, 'role': 3},
        'add': {'enable': true, 'role': 3},
        'remove': {'enable': false, 'role': 3},
        'refresh': {'enable': true, 'role': 3},
        'search': {'enable': false, 'role': 3}
      },
      rowActions: [
        {
          'label': this.translate('MODULES.MANAGE.NTP.TABLE.DELETE'),
          'role': 3,
          'value': 'delete'
        }
      ],
      provider: null,
      api: null
    };

    let init = () => {
      let promises = [];
      let deviceConfigsDefer = this.di.$q.defer();
      let timeRangeDefer = this.di.$q.defer();
      let scope = this.di.$scope;

      this.di.deviceDataManager.getDeviceConfigs().then((res) => {
        scope.deviceConfigs = res;
        // deviceConfigs = angular.copy(res);
        deviceConfigsDefer.resolve();
      });
      promises.push(deviceConfigsDefer.promise);

      this.di.manageDataManager.getTimeRanges().then((res) => {
        scope.timeRanges = res.data['timeRanges'];
        timeRangeDefer.resolve();
      });
      promises.push(timeRangeDefer.promise);

      Promise.all(promises).then(() => {
        scope.timeRangeModel.deviceDisplay['options'] = [{'label':  this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_DEVICE'), 'value': null}]
        scope.timeRangeModel.deviceDisplay['options'] = scope.timeRangeModel.deviceDisplay['options'].concat(scope.deviceConfigs.map(config => {
          return {'label': config['name'], 'value': config['id']}
        }));
        initDevice();
      });
    };


    let reInit = () =>{
      let promises = [];
      let deviceConfigsDefer = this.di.$q.defer();
      let timeRangeDefer = this.di.$q.defer();
      let scope = this.di.$scope;

      this.di.deviceDataManager.getDeviceConfigs().then((res) => {
        scope.deviceConfigs = res;
        // deviceConfigs = angular.copy(res);
        deviceConfigsDefer.resolve();
      });
      promises.push(deviceConfigsDefer.promise);

      this.di.manageDataManager.getTimeRanges().then((res) => {
        scope.timeRanges = res.data['timeRanges'];
        timeRangeDefer.resolve();
      });
      promises.push(timeRangeDefer.promise);

      Promise.all(promises).then(() => {
        scope.timeRangeModel.deviceDisplay['options'] = [{'label':  this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_DEVICE'), 'value': null}]
        scope.timeRangeModel.deviceDisplay['options'] = scope.timeRangeModel.deviceDisplay['options'].concat(scope.deviceConfigs.map(config => {
          return {'label': config['name'], 'value': config['id']}
        }));

        let timeranges = scope.timeRanges.filter(time_range => {
          return time_range.deviceId === scope.timeRangeModel.curDevice.value
        });
        scope.timeRangeModel.nameDisplay['options'] = [{'label': this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_NAME'), 'value': null}]
        scope.timeRangeModel.nameDisplay['options'] = scope.timeRangeModel.nameDisplay['options'].concat(timeranges.map(time_range => {
          return {'label': time_range['name'], 'value': time_range['name']}
        }));

        initTimeRangeTable(scope.timeRangeModel.curName.value)
      });
    }

    let full = (v) => {
      if (typeof v === 'number' ) {
        if(v < 10) {
          return '0' + v;
        } else {
          return v;
        }
      }

      if(typeof v === 'string'){
        let x = parseInt(v);
        if(x < 10) {
          return '0' + x;
        } else {
          return v;
        }
      }
    }

    let getTimeStr = (rangetime) => {
      return rangetime['year'] + '-' + full(rangetime['month']) + '-' + full(rangetime['day']) + ' ' + full(rangetime['hour']) + ':' + full(rangetime['minute']);
    };

    let _formatAbsoluteTime = (ab) => {
      let res = {start: null, end: null, type: 'absolute',  typeStr: this.translate('MODULES.TIMERANGES.ESTABLISH.RANGE.ABSOLUTE')};
      if (ab['start']) {
        res.start = getTimeStr(ab['start'])
      }
      res.end = getTimeStr(ab['end']);
      return res;
    };


    let _formatPeriodicTime = (pers) => {
      let format = (t) => {
        return translate_per_day(t['day']) + ' ' + full(t['hour']) + ':' + full(t['minute']);
      };
      let res = [];
      pers.forEach(per => {
        res.push({start: format(per['start']), end: format(per['end']), type: 'periodic', _start: per['start'], _end: per['end'], typeStr: this.translate('MODULES.TIMERANGES.ESTABLISH.RANGE.PERIODIC')})
      });
      return res;

    };

    let translate_per_day = (day) => {
      let types = this.di.manageService.getTimeRangePeriodicType();
      let dayItem = types.filter((type)=>{
        return type.value === day;
      });
      if(dayItem[0]){
        return dayItem[0].label
      } else {
        return day;
      }
    };

    let _formatTimes = (name) => {
      let deviceTimeRanges = scope.timeRanges.filter((timerange) => {
        return timerange.deviceId === scope.timeRangeModel.curDevice.value;
      });
      if (deviceTimeRanges.length === 0) {
        return [];
      }
      let ranges = deviceTimeRanges.filter((timerange) => {
        return timerange.name === name
      });
      if (ranges.length > 0) {
        let range = ranges[0];
        let res = [];
        if (range['absolute']) {
          res.push(_formatAbsoluteTime(range['absolute']))
        }
        if (range['periodic']) {
          res = res.concat(_formatPeriodicTime(range['periodic']))
        }
        return res;
      }
      return [];
    };

    let initTimeRangeTable = (name) => {
      if(name === null){
        return ;
      }
      scope.timeRangeModel.times = _formatTimes(name);
      console.log(scope.timeRangeModel.times);
      // scope.timeRangeModel.provider = null;

      scope.timeRangeModel.provider = this.di.tableProviderFactory.createProvider({
        query: (params) => {
          let defer = this.di.$q.defer();
          this.di.$timeout(() => {
            defer.resolve({
              data: scope.timeRangeModel.times,
              count: undefined
            });
            scope.timeRangeModel.api.queryUpdate();
          });
          return defer.promise;
        },
        getSchema: () => {
          return {
            schema: this.di.manageService.getTimeRangeTableSchema(),
            index_name: 'host',
            rowCheckboxSupport: false,
            rowActionsSupport: true,
            authManage: {
              support: true,
              currentRole: scope.role
            }
          };
        }
      });

      scope.onTableRowSelectAction = (event) => {
        if (event.data && event.action) {
          if (event.action.value === 'delete') {
            this.di.dialogService.createDialog('warning', this.translate('MODULES.TIMERANGES.CONFIRM.DELETE_RANGE'))
              .then((data) => {
                if (event.data.type === 'absolute'){
                  this.di.manageDataManager.deleteTimeRangeAbsolute(scope.timeRangeModel.curDevice.value, scope.timeRangeModel.curName.value).then((res)=>{
                    this.di.notificationService.renderSuccess(scope,this.translate('MODULES.TIMERANGES.MESSAGE.DELETE_RANGE.SUCCESS'));
                    reInit();
                  }, err=>{
                    this.di.notificationService.renderWarning(scope,err.data);
                  });
                } else if(event.data.type === 'periodic'){
                  let time_key = event.data['_start']['day'] + '_' +
                                 event.data['_start']['hour'] + '_' +
                                 event.data['_start']['minute'] + '_to_' +
                                 event.data['_end']['day'] + '_' +
                                 event.data['_end']['hour'] + '_' +
                                 event.data['_end']['minute'];
                    this.di.manageDataManager.deleteTimeRangePeri(scope.timeRangeModel.curDevice.value, scope.timeRangeModel.curName.value, time_key).then(res=>{
                      this.di.notificationService.renderSuccess(scope,this.translate('MODULES.TIMERANGES.MESSAGE.DELETE_RANGE.SUCCESS'));
                      reInit();
                    }, err=>{
                      this.di.notificationService.renderWarning(scope,err.data);
                    });

                } else {
                  console.error('un-correct type is:' + event.data.type)
                }
              }, (res) => {
                this.di.$log.debug('delete time range dialog cancel');
              });
          }
        }
      };

      scope.onAPIReady = ($api) => {
        scope.timeRangeModel.api = $api;
      };
    };

    let initDevice = () => {
      scope.timeRangeModel.curDevice = scope.timeRangeModel.deviceDisplay.options[0];
    };


    scope.removeName = () =>{

      this.di.dialogService.createDialog('warning', this.translate('MODULES.TIMERANGES.CONFIRM.DELETE_NAME'))
        .then((data)=>{
          this.di.manageDataManager.deleteTimeRangeByDeviceAndName(scope.timeRangeModel.curDevice.value, scope.timeRangeModel.curName.value).then(()=>{
            this.di.notificationService.renderSuccess(scope, this.translate('MODULES.TIMERANGES.MESSAGE.DELETE_NAME.SUCCESS'));
            scope.timeRangeModel.curName = scope.timeRangeModel.nameDisplay['options'][0];
            reInit();
          }, err=>{
            this.di.notificationService.renderWarning(scope,err.data);
          });
        }, res=>{
          this.di.$log.debug('delete time range dialog cancel');
        });
    };

    scope.addName = () =>{
      this.di.$rootScope.$emit('timerange-name-wizard-show', scope.timeRangeModel.curDevice);
    };



    scope.add = () => {
      this.di.$rootScope.$emit('timerange-wizard-show', scope.timeRangeModel.curDevice, scope.timeRangeModel.curName);
    };

    scope.deviceChange = ($value) => {
      let device = $value;
      let timeranges = scope.timeRanges.filter(time_range => {
        return time_range.deviceId === device.value
      });
      scope.timeRangeModel.nameDisplay['options'] = [{'label': this.translate('MODULES.TIMERANGES.DISPLAY.SELECT_NAME'), 'value': null}]
      scope.timeRangeModel.nameDisplay['options'] = scope.timeRangeModel.nameDisplay['options'].concat(timeranges.map(time_range => {
        return {'label': time_range['name'], 'value': time_range['name']}
      }));
      scope.timeRangeModel.curName = scope.timeRangeModel.nameDisplay['options'][0];
    };

    scope.nameChange = ($value) => {
      let name = $value.value;
      initTimeRangeTable(name)
    };

    init();

    let unsubscribes = [];

    unsubscribes.push(this.di.$rootScope.$on('timerange-name-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.TIMERANGES.MESSAGE.CREATE_NAME.SUCCESS'));
      reInit();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }


}

TimeRangeController.$inject = TimeRangeController.getDI();
TimeRangeController.$$ngIsClass = true;