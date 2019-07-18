export class updateDeviceLbdCtrl {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$rootScope',
      'loopbackDataManager',
      'notificationService'
    ];
  }
  constructor(...args){
    this.di = {};
    updateDeviceLbdCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
    let scope = this.di.$scope;
    scope.showWizard = false;
    scope.steps = [
      {
        id: 'step1',
        content: require('../template/updateDeviceLbd'),
      }

    ];
    scope.model = {
      origin: null,
      status: null,
      statusLabel: {
        enableLabel: {
          id: 'check_1', 
          label: this.translate("MODULES.LOOPBACK.STATUS.ENABLE"),
          name: 'radio_1', 
          value:  true
        },
        disableLabel: {
          id: 'check_2', 
          label: this.translate("MODULES.LOOPBACK.STATUS.DISABLE"),
          name: 'radio_1', 
          value:  false
        }
      },
      action: null,
      actionLabel: {
        noneLabel: {
          id: 'check_3', 
          label: this.translate("MODULES.LOOPBACK.ACTION.NONE"),
          name: 'radio_2', 
          value: 'none'
        },
        blockLabel: {
          id: 'check_4', 
          label: this.translate("MODULES.LOOPBACK.ACTION.BLOCK"),
          name: 'radio_2', 
          value: 'block'
        },
        shutdownLabel: {
          id: 'check_5', 
          label: this.translate("MODULES.LOOPBACK.ACTION.SHUTDOWN"),
          name: 'radio_2', 
          value: 'shutdown'
        }
      },
      trap: null,
      trapLabel: {
        noneLabel: {
          id: 'check_6',
          label: this.translate("MODULES.LOOPBACK.TRAP.NONE"),
          name: 'radio_3', 
          value: 'none'
        },
        recoverLabel: {
          id: 'check_7',
          label: this.translate("MODULES.LOOPBACK.TRAP.RECOVER"),
          name: 'radio_3', 
          value: 'recover'
        },
        detectLabel: {
          id: 'check_8',
          label: this.translate("MODULES.LOOPBACK.TRAP.DETECT"),
          name: 'radio_3', 
          value: 'detect'
        },
        bothLabel: {
          id: 'check_9',
          label: this.translate("MODULES.LOOPBACK.TRAP.BOTH"),
          name: 'radio_3', 
          value: 'both'
        }
      },
      interval: null,
      intervalHelper: {
        persistent: 'true',
        validation: 'false',
        content: this.translate('MODULES.LOOPBACK.UPDATE.INTERVAL.HELP')
      },
      intervalDisplayLabel: {
        'regType': 'intervalNumber'
      },
      recover: null,
      recoverHelper: {
        persistent: 'true',
        validation: 'false',
        content: this.translate('MODULES.LOOPBACK.UPDATE.RECOVER.HELP')
      },
      recoverDisplayLabel: {
        'regType': 'recoverNumber'
      },
    }  

    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = () => {
      return new Promise((resolve, reject) => {
        if (scope.model.intervalHelper.validation === 'true' || scope.model.recoverHelper.validation === 'true') {
          resolve({valid: false, errorMessage: ''});
          return;
        }
        let deviceId = scope.model.origin.deviceId, 
          params = {
            'status': scope.model.status,
            'interval': scope.model.interval,
            'recover': scope.model.recover,
            'action': scope.model.action,
            'trap': scope.model.trap
          };
        this.di.loopbackDataManager.updateDeviceLoopbackDetection(deviceId, params)
          .then(() => {
            this.di.notificationService.renderSuccess(scope, this.translate('MODULES.LOOPBACK.UPDATE.SUCCESS'));
            scope.$emit('device-lbd-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            resolve({valid: false, errorMessage: err});
          });
      });
    };

    scope.open = (params) => {
      scope.model.origin = params;
      scope.model.status = params.status;
      scope.model.action = params.action;
      scope.model.trap = params.trap;
      scope.model.interval = params.interval;
      scope.model.recover = params.recover;

      scope.title = this.translate("MODULES.LOOPBACK.UPDATE.TITLE") + '(' + params.device + ')';
      if(scope.showWizard) return;
      scope.showWizard = true;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('update-device-lbd-wizard-show', ($event, params) => {
      scope.open(params);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }  
}
updateDeviceLbdCtrl.$inject = updateDeviceLbdCtrl.getDI();
updateDeviceLbdCtrl.$$ngIsClass = true;