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
      'deviceDisplay': {'options': [{'label': '请选择交换机', 'value': null}]},
      'nameDisplay': {'options': [{'label': '请选择时间范围', 'value': null}]},
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
        scope.timeRangeModel.deviceDisplay['options'] = [{'label': '请选择交换机', 'value': null}]
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
        scope.timeRangeModel.deviceDisplay['options'] = [{'label': '请选择交换机', 'value': null}]
        scope.timeRangeModel.deviceDisplay['options'] = scope.timeRangeModel.deviceDisplay['options'].concat(scope.deviceConfigs.map(config => {
          return {'label': config['name'], 'value': config['id']}
        }));

        let timeranges = scope.timeRanges.filter(time_range => {
          return time_range.deviceId === scope.timeRangeModel.curDevice.value
        });
        scope.timeRangeModel.nameDisplay['options'] = [{'label': '请选择时间范围', 'value': null}]
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
      let res = {start: null, end: null, type: 'absolute'};
      if (ab['start']) {
        res.start = getTimeStr(ab['start'])
      }
      res.end = getTimeStr(ab['end']);
      return res;
    };


    let _formatPeriodicTime = (pers) => {
      let format = (t) => {
        return t['day'] + ' ' + full(t['hour']) + ':' + full(t['minute']);
      };
      let res = [];
      pers.forEach(per => {
        res.push({start: format(per['start']), end: format(per['end']), type: 'periodic'})
      });
      return res;

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
            this.di.dialogService.createDialog('warning', this.translate('MODULES.MANAGE.NTP.REMOVE_NTP_SERVER'))
              .then((data) => {
                this.di.manageDataManager.getNTP().then((res) => {
                  let ntp = (res.data);
                  this.di._.remove(ntp['ntp_servers'], (server) => {
                    return server === event.data.host
                  });

                  this.di.manageDataManager.putNTP(ntp).then((res) => {
                    this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.NTP.REMOVE_NTP_SERVER.SUCCESS'));
                    scope.ntpmodel.api.queryUpdate();
                  }, (err) => {
                    this.di.notificationService.renderWarning(scope, err);
                  })
                }, (err) => {
                  this.di.notificationService.renderWarning(scope, err);
                });
              }, (res) => {
                this.di.$log.debug('delete ntp server dialog cancel');
              });
          } else if (event.action.value === 'edit') {
            this.di.$rootScope.$emit('ipmac-wizard-show', event.data.host.split('/')[0]);
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

      this.di.manageDataManager.deleteTimeRangeByDeviceAndName(scope.timeRangeModel.curDevice.value, scope.timeRangeModel.curName.value).then(()=>{
        scope.timeRangeModel.curName = scope.timeRangeModel.nameDisplay['options'][0];
        reInit();
      });
    };

    scope.addName = () =>{

    };



    scope.add = () => {
      // this.di.$rootScope.$emit('ntp-wizard-show');
    };

    scope.deviceChange = ($value) => {
      let device = $value;
      let timeranges = scope.timeRanges.filter(time_range => {
        return time_range.deviceId === device.value
      });
      scope.timeRangeModel.nameDisplay['options'] = [{'label': '请选择时间范围', 'value': null}]
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

    // unsubscribes.push(this.di.$rootScope.$on('ntp-refresh', ($event) => {
    //   this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.NTP.SERVER.CREATE.SUCCESS'));
    //   scope.ntpmodel.api.queryUpdate();
    // }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }


}

TimeRangeController.$inject = TimeRangeController.getDI();
TimeRangeController.$$ngIsClass = true;