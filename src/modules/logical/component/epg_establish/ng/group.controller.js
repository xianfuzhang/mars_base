export class EGPGroupEstablishController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '_',
      '$rootScope',
      'logicalDataManager'
    ];
  }
   constructor(...args){
    this.di = {};
    EGPGroupEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.showWizard = false;
    this.scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/group'),
      }
    ];
    this.scope.tenantsLabel = {
      options: []
    };
    this.scope.model = {
      name: null,
      tenantObject: null,
      address: null,
      mac_addresses: [],
      nameHelper: {
        'id': 'nameHelper',
        'validation': 'false',
      },
      nameDisplayLabel: {
        'id': 'nameLabel'
      },
      addressHelper: {
        'id': 'thresholdHelp',
        'validation': 'false',
        'persistent': 'true',
        'content': this.di.$filter('translate')('MODULES.LOGICAL.EGP.TAB.GROUP.MAC.HELP')
      },
      addressDisplayLabel: {
        'id': 'addressLabel'
      }
    }

    this.scope.open = (data)  => {
      if(this.scope.showWizard) return;
      this.initMDLParams(data);
      this.scope.title = '添加Group';
      this.scope.showWizard = true;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('group-wizard-show', ($event, data) => {
      this.scope.open(data);
    }));

    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
    this.initActions();
  }

  initActions() {
    this.scope.addMACAddress = () => {
      const MAC_REG = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/;
      const RANGE_MAC_REG = /^(([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2})\/(([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2})$/;
      
      if(!(MAC_REG.test(this.scope.model.address)||RANGE_MAC_REG.test(this.scope.model.address))
        || this.scope.model.mac_addresses.indexOf(this.scope.model.address) > -1)
        return;
      this.scope.model.mac_addresses.push(this.scope.model.address);
    }
  
    this.scope.removeSelectedMAC = (mac) => {
      let index = this.scope.model.mac_addresses.indexOf(mac);
      if(index > -1) {
        this.scope.model.mac_addresses.splice(index, 1);
      }
    };

    this.scope.submit = () => {
      return new Promise((resolve, reject) => {
        if(!this.validate()) {
          resolve({valid: false, errorMessage: ''});
        }
        else {
          this.scope.addMACAddress();
          let params = {
            'name': this.scope.model.name,
            'tenant': this.scope.model.tenantObject.value,
            'mac': this.scope.model.mac_addresses
          };
          this.di.logicalDataManager.createEGPGroup(params)
          .then(() => {
            this.di.$rootScope.$emit('egp-group-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            resolve({valid: false, errorMessage: err});
          });  
        }
      });
    };

    this.scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };
  }

  initMDLParams(data) {
    this.scope.model.name = null;
    this.scope.model.address = null;
    this.scope.model.mac_addresses = [];
    this.scope.tenantsLabel.options = [];
    this.scope.model.nameHelper.validation = 'false';
    this.scope.model.addressHelper.persistent = 'true';
    this.scope.model.addressHelper.validation = 'false';

    data.forEach((item) => {
      this.scope.tenantsLabel.options.push({
        'label': item.name,
        'value': item.name
      });
    });
    this.scope.model.tenantObject = this.scope.tenantsLabel.options[0];
  }

  validate() {
    let val = true;
    if (!this.scope.model.name) {
      this.scope.model.nameHelper.validation = 'true';
      val = false;
    }
    if (!this.scope.model.mac_addresses.length && !this.scope.model.address) {
      this.scope.model.addressHelper.validation = 'true';
      val = false;
    }
    return val;
  }
}
EGPGroupEstablishController.$inject = EGPGroupEstablishController.getDI();
EGPGroupEstablishController.$$ngIsClass = true;