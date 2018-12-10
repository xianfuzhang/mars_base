export class NTPController {
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
      'tableProviderFactory',
      'dialogService',
    ];
  }

  constructor(...args) {
    this.di = {};
    NTPController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    scope.role = this.di.roleService.getRole();
    this.translate = this.di.$filter('translate');

    scope.ntpmodel = {
      isEnable : false,
      actionsShow:{
        'menu': {'enable': false, 'role': 3},
        'add': {'enable': true, 'role': 3},
        'remove': {'enable': false, 'role': 3},
        'refresh': {'enable': true, 'role': 3},
        'search': {'enable': false, 'role': 3}
      },
      rowActions:[
        {
          'label': this.translate('MODULES.MANAGE.NTP.TABLE.DELETE'),
          'role': 3,
          'value': 'delete'
        }
      ],
      ntpTableProvider:null,
      api: "",
    };

    scope.add = () => {
      this.di.$rootScope.$emit('ntp-wizard-show');
    };

    let flag = true;
    let _formatData =  (data) =>{
      flag = true;
      let ntpServers = data['ntp_servers'];
      scope.ntpmodel.isEnable = data['enabled'];

      if(ntpServers && Array.isArray(ntpServers)){
        return this.di._.map(ntpServers, (server)=>{ return {'host':server}})
      } else {
        return []
      }
    };

    scope.ntpmodel.ntpTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.manageDataManager.getNTP().then((res) => {
          let servers = _formatData(res.data);
          defer.resolve({
            data: servers,
            count: undefined
          });
        },(err)=>{
          this.di.notificationService.renderWarning(scope, err);
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.manageService.getNTPTableSchema(),
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

    scope.onNTPTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.MANAGE.NTP.REMOVE_NTP_SERVER'))
            .then((data) =>{
              this.di.manageDataManager.getNTP().then((res) => {
                let ntp = (res.data);
                this.di._.remove(ntp['ntp_servers'], (server)=>{ return server === event.data.host});

                this.di.manageDataManager.putNTP(ntp).then((res)=>{
                  this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.NTP.REMOVE_NTP_SERVER.SUCCESS'));
                  scope.ntpmodel.api.queryUpdate();
                },(err)=>{
                  this.di.notificationService.renderWarning(scope, err);
                })
              },(err)=>{
                this.di.notificationService.renderWarning(scope, err);
              });
            }, (res) =>{
              this.di.$log.debug('delete ntp server dialog cancel');
            });
        } else if(event.action.value === 'edit'){
          this.di.$rootScope.$emit('ipmac-wizard-show', event.data.host.split('/')[0]);
        }
      }
    };


    scope.changeSwitch = () =>{
      this.di.manageDataManager.getNTP().then((res) => {

        let ntp = (res.data);
        ntp['enabled'] = scope.ntpmodel.isEnable;
        this.di.manageDataManager.putNTP(ntp).then((res)=>{},(err)=>{
          this.di.notificationService.renderWarning(scope, err);
        })

      },(err)=>{
        this.di.notificationService.renderWarning(scope, err);
      });
    }

    scope.onNtpAPIReady = ($api) => {
      scope.ntpmodel.api = $api;
    };

    let unsubscribes = [];

    unsubscribes.push(this.di.$rootScope.$on('ntp-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.NTP.SERVER.CREATE.SUCCESS'));
      scope.ntpmodel.api.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }
}

NTPController.$inject = NTPController.getDI();
NTPController.$$ngIsClass = true;