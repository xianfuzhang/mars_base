export class AlertController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$filter',
      '$q',
      '$log',
      //'$uibModal',
      'dialogService',
      'appService',
      'tableProviderFactory',
      'alertDataManager',
      'alertService'
    ];
  }

  constructor(...args) {
    this.di = {};
    AlertController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');


    scope.configurationModel = {
      subjectList: [],
      subjectListDisable: 'true',
      currentSubjectClass: '',
      currentSubject: '',
      configurationShow: '',
      isEditable: false
    };

    scope.alertModel = {
      actionsShow: {'menu': true, 'add': false, 'remove': true, 'refresh': true, 'search': false},
      rowActions: [
        {
          'label': this.translate('MODULES.ALERT.HISTORY.DELETE'),
          'value': 'delete'
        }
      ],
      alertTableProvider: null,
      alertAPI: null
    };

    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.alertModel.alertAPI.setSelectedRow(event.$data.uuid);
      }
    };


    scope.onAlertAPIReady = ($api) => {
      scope.alertModel.alertAPI = $api;
    };

    this.init();


    scope.onTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          this.di.dialogService.createDialog('warning', this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORY'))
          //this.confirmDialog(this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORY'))
            .then((data) =>{
              this.di.alertDataManager.deleteAlertHistory(event.data.uuid)
                .then((res) =>{
                  scope.alertModel.alertAPI.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('delete alert history dialog cancel');
            });
        }
      }
    };


    scope.batchRemove = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORIES'))
        //this.confirmDialog(this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORIES'))
          .then((data) =>{
            this.batchDeleteAlertHistory($value);
          }, (res) =>{
            this.di.$log.debug('delete user account dialog cancel');
          });
      }
    };

    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }

  init(){
    let m = this.di.alertDataManager;
    this.di.$scope.alertModel.alertTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.alertDataManager.getAlertHistories(params).then((res) => {
          defer.resolve({
            data: res.data.history,
            count: 100
          });
        });

        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.alertService.getAlertTableSchema(),
          index_name: 'uuid',
          rowCheckboxSupport: true,
          rowActionsSupport: true
        };
      }
    });
  }
  /**
  confirmDialog(content) {
    let defer = this.di.$q.defer();
    this.di.$uibModal
      .open({
        template: require('../../../components/mdc/templates/dialog.html'),
        controller: 'dialogCtrl',
        backdrop: true,
        resolve: {
          dataModel: () => {
            return {
              type: 'warning',
              headerText: this.translate('MODULES.ALERT.DIALOG.HEADER'),
              contentText: content,
            };
          }
        }
      })
      .result.then((data) => {
      if(data) {
        defer.resolve(data);
      }
      else {
        defer.reject(null);
      }
    });

    return defer.promise;
  }
  **/

  batchDeleteAlertHistory(arr) {
    let uuids = [];
    arr.forEach((item) => {
      uuids.push(item.uuid)
    });
    let scope = this.di.$scope;
    let defer = this.di.$q.defer();
    this.di.alertDataManager.deleteAlertHistoriesSelected(uuids)
      .then(() => {
        scope.alertModel.alertAPI.queryUpdate();
        defer.resolve();
      }, () => {
        scope.alertModel.alertAPI.queryUpdate();
        defer.resolve();
      });

  }

}

AlertController.$inject = AlertController.getDI();
AlertController.$$ngIsClass = true;