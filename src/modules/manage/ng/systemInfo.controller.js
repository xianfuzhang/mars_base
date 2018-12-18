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

    };

    scope.labelModel = {
        "commit": "Git Commit",
        "version": "版本",
        "build_server": "编译服务器",
        "build_date": "编译时间",
        "logstash": "logstash版本",
        "elasticsearch": "elasticsearch版本",
        "nginx": "nginx版本",
    };

    scope.infoList = ['commit', 'version', 'build_server', 'build_date', 'logstash', 'elasticsearch', 'nginx'];

    let init = () =>{

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
        scope.systemModel = res;
      },(err)=>{
        this.di.notificationService.renderWarning(scope, err);
      })
    };

    init();

  }
}

SystemInfoController.$inject = SystemInfoController.getDI();
SystemInfoController.$$ngIsClass = true;