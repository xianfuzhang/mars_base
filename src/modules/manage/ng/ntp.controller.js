export class NTPController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
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

    scope.regex = {
      ttl_regex: '^[1-9]$|^[1-9][0-9]$|^1[0-9]{2}$|^2[0-4][0-9]$|^25[0-5]$',
      delay_regex: '^([2-9]|10)$',
      timeout_regex: '^(1[5-9][0-9]|2[0-9]{2}|300)$',
      dhcp_int_regex: '^([0-9]|[1-9][0-9]{0,5}|1[0-9]{6}|2[0-4][0-9]{5}|25[0-8][0-9]{4}|259[0-1]{3}|2592000)$'
    };


    scope.ntpmodel = {
      isEnable : false,
      actionsShow:{
        'menu': {'enable': true, 'role': 3},
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
    let data = null;

    let init = () =>{
      this.di.manageDataManager.getNTP().then((res) => {
        data = res.data;
        initializeData(data)
      },(err)=>{
        this.di.notificationService.renderWarning(scope, err);
      });
    };

    let initializeData = (data) =>{
      
    };
    // init();

    scope.add = () => {
      this.di.$rootScope.$emit('ntp-wizard-show');
    };

    let _formatData =  (data) =>{
      let ntpServers = data['ntp_servers'];
      scope.ntpmodel.isEnable = data['enabled'];
      if(ntpServers && Array.isArray(ntpServers)){
        return this.di._.map(ntpServers, (server)=>{ return {'host':server}})
      } else {
        return []
      }
    };


    scope.onNtpAPIReady = ($api) => {
      scope.ntpmodel.api = $api;
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