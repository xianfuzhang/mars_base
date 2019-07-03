/**
 * Created by wls on 2018/6/7.
 */

export class VlanIpEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'deviceDataManager',
      'vlanDataManager',
      'notificationService',
      'deviceService'
    ];
  }

  constructor(...args) {
    this.di = {};
    VlanIpEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const vlanDataManager = this.di.vlanDataManager;
    const rootScope = this.di.$rootScope;
    const _ = this.di._;
    const translate = this.di.$filter('translate');
    scope.wizardHeight = {"height":'400px'};
    scope.showWizard = false;
    scope.title = translate('MODULES.VLAN.IP.ES.TITLE.ADD');
    scope.steps = [
      {
        id: 'step1',
        title: '',
        content: require('../template/vlan_ip_establish.html')
      }
    ];

    let base_vlanIpModel = {
      device: null,
      vlan_id: '',
      ip: null,
      mask: null
    }

    scope.vlanIpModel = {};

    scope.displayLabel = {'options': []}

  
    const init = () => {
      // init group
      scope.vlanIpModel = this.di._.cloneDeep(base_vlanIpModel);
      scope.displayLabel = {'options': []};
    }
  
    init();
  
    let inValidJson = {
      valid: false,
      errorMessage: ''
    };
  
  
    let validJson = {
      valid: true,
      errorMessage: ''
    };

    scope.isEdit = false;

    scope.open = (vlanIpObj) => {
      if(scope.showWizard) return;

      if(vlanIpObj){
        scope.isEdit = true;
        scope.title = translate('MODULES.VLAN.IP.ES.TITLE.EDIT');
      } else {
        scope.isEdit = false;
        scope.title = translate('MODULES.VLAN.IP.ES.TITLE.ADD');
      }

      scope.vlanIpModel = this.di._.cloneDeep(base_vlanIpModel)
      scope.displayLabel = {'options': []};

      deviceDataManager.getDeviceConfigs().then((configs) => {
        this.di._.forEach(configs, (config) => {
          if(config['id'].toLocaleLowerCase().indexOf('rest') != -1){
            scope.displayLabel.options.push({'label': config['name'], 'value': config['id']})
          }
        });
        if(scope.displayLabel.options.length === 0){
          this.di.notificationService.renderWarning(scope,translate('MODULES.VLAN.IP.DIALOG.MESSAGE.NO_DEVICE_4_OPERATION'));
          return;
        }

        if(scope.isEdit){
          scope.vlanIpModel.device = scope.displayLabel.options.find(d => d.value === vlanIpObj['device_id']);
          setTimeout(function () {
            scope.vlanIpModel.vlan_id = vlanIpObj['vlan'];
            scope.vlanIpModel.ip = vlanIpObj['ip'];
            scope.vlanIpModel.mask = vlanIpObj['mask'];
          })
        }
        scope.showWizard = true;
      }, (err) => {
        this.di.notificationService.renderWarning(scope, err.data);
      });
    };
    
    scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if(out && out.length === 1){
        let invalidDoms = out[0].getElementsByClassName('mdc-text-field--invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }

    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      rootScope.$emit('page_vlanIp_es');
      if(!validCurrentDom('vlan_ip_es')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      const param = {
        'devices':[
          {
            'device-id': scope.vlanIpModel.device.value,
            'vlans': [
              {
                'vlan': scope.vlanIpModel.vlan_id,
                'ip': scope.vlanIpModel.ip,
                'mask': scope.vlanIpModel.mask,
              }
            ]
          }
        ]
      }

      return new Promise((resolve, reject) => {
        vlanDataManager.createVlanIp(param)
          .then(() => {
            if(scope.isEdit){
              rootScope.$emit('vlan-ip-list-refresh', true);
            } else {
              rootScope.$emit('vlan-ip-list-refresh', false);
            }

            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            resolve({valid: false, errorMessage: err});
          });
      });
    };
  

    
    unsubscribes.push(this.di.$rootScope.$on('vlan-ip-wizard-show', ($event, vlanIpObj) => {
      scope.open(vlanIpObj);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

VlanIpEstablishController.$inject = VlanIpEstablishController.getDI();
VlanIpEstablishController.$$ngIsClass = true;