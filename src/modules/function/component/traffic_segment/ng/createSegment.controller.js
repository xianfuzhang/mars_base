export class CreateSegmentCtrl {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$rootScope',
      '$q',
      'appService',
      'regexService',
      'functionDataManager',
      'notificationService'
    ];
  }
  constructor(...args){
    this.di = {};
    CreateSegmentCtrl.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
    let scope = this.di.$scope;
    scope.showWizard = false;
    scope.steps = [
      {
        id: 'step1',
        content: require('../template/createSegment'),
      }

    ];
    scope.model = {
      device: null,
      session: null,
      vlans: null,
      uplinks: [],
      downlinks: [],
      addedPorts: [],
      devicePorts: {},
      deviceDisplayLabel: {
        'options': [], 
      },
      sessionDisplayLabel: {
        'options': []
      },
      portDisplayLabel: {
        options: []
      },
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
        validation: 'false',
        content: this.translate('MODULE.FUNCTIONS.TRAFFIC.CREATE.VLAN.HELP')
      }
    }
    
    scope.changeDevice = (device)  => {
      scope.model.portDisplayLabel.options = [];
      console.log(device);
      scope.model.devicePorts[device.value].forEach((p) => {
        scope.model.portDisplayLabel.options.push({
          'label': p,
          'value': p
        });
      });
    };

    scope.addLinkPort = (type) => {
      if (type === 'uplink') {
        let index = scope.model.addedPorts.indexOf(scope.model.up_link.value);
        if (index === -1) {
          scope.model.addedPorts.push(scope.model.up_link.value);
          scope.model.uplinks.push(scope.model.up_link.value);
        }
      }
      else {
        let index = scope.model.addedPorts.indexOf(scope.model.down_link.value);
        if (index === -1) {
          scope.model.addedPorts.push(scope.model.down_link.value);
          scope.model.downlinks.push(scope.model.down_link.value);
        }
      }
    }

    scope.removeSelected = (type, index, value) => {
      if (type === 'uplink') {
        scope.model.uplinks.splice(index, 1);
      }
      else {
        scope.model.downlinks.splice(index, 1);
      }
      let i = scope.model.addedPorts.indexOf(value);
      if (i > -1) scope.model.addedPorts.splice(i, 1);
    };

    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = () => {
      let deviceId = scope.model.device.value,
          params = {
            'sessionId': scope.model.session.value
          };
      
      return new Promise((resolve, reject) => {
        if (scope.model.session.value > 4) {
          if (!scope.model.vlans) {
            scope.model.vlanHelper.validation = 'true';
            return resolve({valid: false, errorMessage: this.di.$filter('translate')("MODULE.FUNCTIONS.TRAFFIC.CREATE.NEED_EXCLUDE_VLAN")});
          }
          else {
            scope.model.vlanHelper.validation = this.di.regexService.excute('excludeVlan', scope.model.vlans) ?'false' : 'true';
          }
          if (scope.model.downlinks.length === 0) {
            return resolve({valid: false, errorMessage: this.di.$filter('translate')("MODULE.FUNCTIONS.TRAFFIC.CREATE.NEED_DOWNLINK_PORT")});
          }
          params['excludeVlans'] = scope.model.vlans.split(',');
        }
        params['uplinks'] = scope.model.uplinks;
        params['downlinks'] = scope.model.downlinks;
        this.di.functionDataManager.createTrafficSegment(deviceId, params)
          .then(() => {
            scope.$emit('traffic-segment-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            resolve({valid: false, errorMessage: err.data&&err.data.message || err.statusText});
          });
      });
    };

    scope.open = () => {
      if(scope.showWizard) return;
      scope.showWizard = true;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('traffic-segment-wizard-show', ($event, params) => {
      scope.title =  this.translate("MODULE.FUNCTIONS.TRAFFIC.CREATE.TITLE");
      scope.model.deviceDisplayLabel.options = [];
      scope.model.sessionDisplayLabel.options = [];
      scope.model.portDisplayLabel.options = [];
      for (let id in params) {
        scope.model.deviceDisplayLabel.options.push({
          'label': params[id]['name'],
          'value': id
        });
        scope.model.devicePorts[id] = params[id]['ports'];
      }
      if (scope.model.deviceDisplayLabel.options.length === 0) {
        this.di.notificationService.renderWarning(scope, this.translate('MODULE.FUNCTIONS.TRAFFIC.CREATE.NO_DEVICE'));
        return;
      }
      scope.model.device = scope.model.deviceDisplayLabel.options[0];
      for (let i = 0; i< this.di.appService.CONST.MAX_TRAFFIC_SEGMENT_SESSION; i++) {
        scope.model.sessionDisplayLabel.options.push({
          'label': i + 1,
          'value': i + 1
        });
      }
      scope.model.devicePorts[scope.model.device.value].forEach((val) => {
        scope.model.portDisplayLabel.options.push({
          'label': val,
          'value': val
        });
      });
      scope.model.up_link = scope.model.portDisplayLabel.options[0];
      scope.model.down_link = scope.model.portDisplayLabel.options[0];
      scope.open();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }  
}
CreateSegmentCtrl.$inject = CreateSegmentCtrl.getDI();
CreateSegmentCtrl.$$ngIsClass = true;