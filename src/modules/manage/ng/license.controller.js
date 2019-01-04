export class LicenseController {
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
    ];
  }

  constructor(...args) {
    this.di = {};
    LicenseController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    scope.role = this.di.roleService.getRole();
    this.translate = this.di.$filter('translate');

    scope.licenseModel = {
      uploadBtnDisable: true,
      detail: {},
      // actionsShow: this.di.manageService.getLicenseTableActionsShow(),
      // rowActions: this.di.manageService.getLicenseTableRowActions(),
      licenseTableProvider: null,
      api: null,
    };
  
    scope.reader = new FileReader();
    
    let getLocalDate = (time) => {
      if (time === -1) {
        return '';
      }
      var local_time = '';
      var day = new Date(time);
      local_time += day.getFullYear() + '-';
      local_time += addPrefix((day.getMonth() + 1)) + '-';
      local_time += addPrefix(day.getDate()) + ' ';
      local_time += addPrefix(day.getHours()) + ':';
      local_time += addPrefix(day.getMinutes()) + ':';
      local_time += addPrefix(day.getSeconds());
    
      return local_time;
    
      function addPrefix(num) {
        if (num < 10) {
          return '0' + num;
        }
        else {
          return num;
        }
      }
    }
    
    let _formatData = (res) =>{
      scope.licenseModel.detail.valid = res.valid;
      scope.licenseModel.detail.scenario = res.scenario;
      scope.licenseModel.detail.maxSwitches = res.maxSwitches;
      scope.licenseModel.detail.startTime = getLocalDate(res.startTime);
      scope.licenseModel.detail.expirationTime = getLocalDate(res.expirationTime);
      
      let apps = res['apps'];
      let retApps = [];
      this.di._.forEach(apps, (app)=>{
        let item = {};
        item['name'] = app['name'];
        item['allow'] = app['allow'] ? 'available' : null;
        retApps.push(item);
      });

      return retApps;
    };

    scope._apps = [];

    scope.licenseModel.licenseTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.manageDataManager.getLicense().then((res) => {
          scope._apps = _formatData(res.data);
          defer.resolve({
            data: scope._apps,
            count: undefined
          });
        },(err)=>{
          this.di.notificationService.renderWarning(scope, err);
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.manageService.getLicenseTableSchema(),
          index_name: 'name',
          authManage: {
            support: true,
            currentRole: scope.role
          }
        };
      }
    });

    scope.onApiReady = ($api) => {
      scope.licenseModel.api = $api;
    };
  
    scope.uploadFile = (event) =>{
      scope.licenseModel.uploadBtnDisable = true;
      scope.reader.onload = function (loadEvent) {
        scope.$apply(function () {
          scope.licenseModel.file = scope.reader.result;
          scope.licenseModel.uploadBtnDisable = false;
        });
      };
      scope.reader.readAsArrayBuffer(event.target.files[0]);
    };
    
    scope.save = () => {
      const di = this.di;
      this.di.manageDataManager.postLicense(scope.licenseModel.file).then((res)=>{
        di.$scope.$emit('license-refresh');
      },(err)=>{
        di.notificationService.renderWarning(scope, this.translate('MODULES.MANAGE.LICENSE.UPLOAD.FAILURE'));
      });
    }

    let unsubscribes = [];

    unsubscribes.push(this.di.$scope.$on('license-refresh', ($event) => {
      this.di.notificationService.renderSuccess(scope, this.translate('MODULES.MANAGE.LICENSE.UPLOAD.SUCCESS'));
      scope.licenseModel.api.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }
}

LicenseController.$inject = LicenseController.getDI();
LicenseController.$$ngIsClass = true;