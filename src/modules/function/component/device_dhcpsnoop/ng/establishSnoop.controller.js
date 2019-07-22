export class EstablishSnoopCtrl {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$rootScope',
      '$q',
      'regexService',
      'deviceDataManager',
      'snoopDataManager',
      'notificationService'
    ];
  }
  constructor(...args){
    this.di = {};
    EstablishSnoopCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
    let scope = this.di.$scope;
    scope.showWizard = false;
    scope.steps = [
      {
        id: 'step1',
        content: require('../template/snooping'),
      }

    ];
    scope.model = {
      device: null,
      deviceDisplayLabel: {
        'options': [], 
      },
      vlanType: 'all',
      vlanTypeLabel: {
        allLabel: {
          id: 'check_1',
          label: this.translate("MODULE.FUNCTIONS.SOOPING.ESTABLISH.VLAN.ALL"),
          name: 'radio_1', 
          value: 'all'
        },
        otherLabel: {
          id: 'check_2',
          label: this.translate("MODULE.FUNCTIONS.SOOPING.ESTABLISH.VLAN.OTHER"),
          name: 'radio_1', 
          value: 'other'
        }
      },
      vlanRangeDisplayLabel: {
        'regType': 'vlanRange'
      },
      vlanHelper: {
        persistent: 'true',
        validation: 'true',
        content: this.translate('MODULE.FUNCTIONS.SOOPING.ESTABLISH.VLAN.HELP')
      }
    }  

    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = () => {
      let params = {'deviceId': scope.model.device.value, vlans: []};
      
      return new Promise((resolve, reject) => {
        if (scope.model.vlanType === 'all') {
          params.vlans.push('all');
        }
        else {
          if (scope.model.vlanHelper.validation === 'true') {
            return resolve({valid: false, errorMessage: this.di.$filter('translate')("MODULE.FUNCTIONS.SOOPING.ESTABLISH.VLAN.EMPTY")});
          }
          params.vlans = params.vlans.concat(scope.model.vlanRange.split(','));
        }
        this.di.snoopDataManager.createDeviceSnoop(params)
          .then(() => {
            scope.$emit('dhcp-snoop-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            resolve({valid: false, errorMessage: err});
          });
      });
    };

    scope.open = () => {
      if(scope.showWizard) return;
      scope.showWizard = true;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('dhcp-snoop-wizard-show', ($event, params) => {
      scope.createFlag = params ? false : true;
      scope.title = params ? this.translate("MODULE.FUNCTIONS.SOOPING.ESTABLISH.UPDATE.TITLE") 
        : this.translate("MODULE.FUNCTIONS.SOOPING.ESTABLISH.CREATE.TITLE");
      if (scope.createFlag) {
        scope.model.vlanType = 'all';
        scope.model.vlanRange = null;
      }  
      this.di.deviceDataManager.getDeviceConfigs().then((devices)=>{
        scope.model.deviceDisplayLabel.options = [];
        devices.forEach((device) => {
          if (device.protocol === 'rest') {
            scope.model.deviceDisplayLabel.options.push({
              'label': device.name,
              'value': device.id
            });
          }
        });
        if (scope.model.deviceDisplayLabel.options.length === 0) {
          this.di.notificationService.renderWarning(scope, this.translate('MODULES.VLAN.GUEST.CREATE.NO_REST_DEVICE'));
          return;
        }
        scope.model.device = scope.model.deviceDisplayLabel.options[0];
        scope.open();
      });
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }  
}
EstablishSnoopCtrl.$inject = EstablishSnoopCtrl.getDI();
EstablishSnoopCtrl.$$ngIsClass = true;