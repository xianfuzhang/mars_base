export class SystemInfoController {
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
    SystemInfoController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let scope = this.di.$scope;
    scope.role = this.di.roleService.getRole();
    this.translate = this.di.$filter('translate');

    scope.systemModel = {
      isFinish : false,

    };

    scope.labelModel = {
        "commit": "Git Commit",
        "version": this.translate('MODULES.MANAGE.SYSTEMINFO.VERSION'),
        "build_server": this.translate('MODULES.MANAGE.SYSTEMINFO.BUILD_SERVER'),
        "build_date": this.translate('MODULES.MANAGE.SYSTEMINFO.BUILD_TIME'),
        "logstash": this.translate('MODULES.MANAGE.SYSTEMINFO.LOGSTASH_VERSTION'),
        "elasticsearch": this.translate('MODULES.MANAGE.SYSTEMINFO.ELASTIC_VERSTION'),
        "nginx": this.translate('MODULES.MANAGE.SYSTEMINFO.NGINX_VERSTION')
    };

    scope.infoList = ['commit', 'version', 'build_server', 'build_date', 'logstash', 'elasticsearch', 'nginx'];

    let init = () =>{
      scope.systemModel.isFinish = false;
      // scope.systemModel = {
      //     "commit": "b561c7c46c0609151afcfbb857a7d1d97dacafae",
      //     "version": "v1.0.0.0-2-gb561c7c",
      //     "build_server": "manager-Enzo",
      //     "build_date": "12-17-18T13:29:06Z",
      //     "logstash": "logstash-oss:6.1.0",
      //     "elasticsearch": "elasticsearch-oss:6.1.0",
      //     "nginx": "nginx:1.14.0",
      //     "format": "json"
      //   }

      this.di.manageDataManager.getSystemInfo().then((res)=>{
        scope.systemModel = res.data;
        scope.systemModel.isFinish = true;
      },(err)=>{
        this.di.notificationService.renderWarning(scope, err);
      })
    };

    init();

  }
}

SystemInfoController.$inject = SystemInfoController.getDI();
SystemInfoController.$$ngIsClass = true;