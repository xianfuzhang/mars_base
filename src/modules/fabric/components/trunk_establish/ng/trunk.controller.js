export class TrunkController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '_',
      'deviceDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    TrunkController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.edit = false;
    this.scope.showWizard = false;
    this.scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/trunk'),
      }
    ];
    this.scope.model = {
      name: null,
      is_mlag: false,
      disableMLAG: true,
      group: null,
      members: [],
      membersDetail: [],
      nameHelper: {
        validation: 'false',
        content: this.translate('MODULES.TRUNK.CREATE.FORM.NAME.HELP')
      },
      nameDisplayLabel: {
        'regType': 'nameString'
      },
      mlagEnableLabel: {
        id: 'check_1', 
        label: this.translate('MODULES.PORT.MLAG.ENABLE'),
        name: 'radio_1', 
        value:  true
      },
      mlagDsiableLabel: {
        id: 'check_2', 
        label: this.translate('MODULES.PORT.MLAG.DISABLE'),
        name: 'radio_1', 
        value:  false
      },
      groupDisplayLabel: {
        options: []
      },
      deviceDisplayLabel: {
        options: []
      },
      portDisplayLabel: {
        options: []
      },
      leafGroupDisplayLabel: {
        options: []
      }
    };

    this.initActions();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('trunk-wizard-show', ($event, data) => {
      this.scope.edit = data.edit || false;
      this.scope.availableDevices = data.availableDevices || [];
      this.scope.leafGroups = data.leafGroups || {};
      this.scope.trunk = data.trunk;
      this.scope.open(data);
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  initActions() {
    this.scope.open = (data)  => {
      if(this.scope.showWizard) return;
      this.scope.title = this.scope.edit ? '修改端口聚合' : '创建端口聚合';
      this.initSelectOptions();
      this.scope.showWizard = true;
    };

    this.scope.submit = () => {
      return new Promise((resolve, reject) => {
        if (!this.scope.model.name) {
          this.scope.model.nameHelper.validation = 'true';
          resolve({valid: false, errorMessage: ''});
        }
        else {
          let members = [];
          if (this.scope.model.is_mlag) {
            members = this.scope.model.leafGroupOption['value'];
          }
          else {
            this.scope.model.membersDetail.forEach((member) => {
              members.push({
                'device_id': member.device_id,
                'port': member.port
              });
            });  
          }
          let params = {
            'name': this.scope.model.name,
            'is_mlag': this.scope.model.is_mlag,
            'group': this.scope.model.groupOption.value,
            'members': members
          };
          this.di.deviceDataManager.createLogicalPort(params)
          .then(() => {
            this.di.$rootScope.$emit('trunk-list-refresh');
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

    this.scope.changeDevice = ($value) => {
      this.scope.model.groupDisplayLabel.options = [];
      this.scope.model.portDisplayLabel.options = [];
      let device = this.di._.find(this.scope.availableDevices, {'id': $value.value});
      device.ports.forEach((port) => {
        this.scope.model.portDisplayLabel.options.push({
          'label': port,
          'value': port  
        });
      });
      device.groups.forEach((group) => {
        this.scope.model.groupDisplayLabel.options.push({
          'label': group,
          'value': group
        });
      });
      this.scope.model.portOption = this.scope.model.portDisplayLabel.options[0];
      if (this.scope.edit) {
        this.scope.model.groupOption = this.di._.find(this.scope.model.groupDisplayLabel.options, 
          {'value': this.scope.trunk.group});
      }
      else {
        this.scope.model.groupOption = this.scope.model.groupDisplayLabel.options[0];  
      }
    };

    this.scope.addMember = () => {
      if (!this.scope.model.is_mlag && this.scope.model.membersDetail.length >= 8) return;
      let member = {
        'device_id': this.scope.model.deviceOption.value,
        'port': this.scope.model.portOption.value,
        'device_name': this.scope.model.deviceOption.label 
      };
      if (this.di._.findIndex(this.scope.model.membersDetail, 
          {'device_id': member.device_id, 'port': member.port}) === -1 ) {
        this.scope.model.membersDetail.push(member);  
      }
    };

    this.scope.removeSelected = (member) => {
      let index = this.scope.model.membersDetail.indexOf(member);
      if(index > -1) {
        this.scope.model.membersDetail.splice(index, 1);
      }
    };

    this.scope.supportMLAG = (state) => {
      this.scope.model.membersDetail = [];
      //rest device support mlag
      this.scope.model.deviceDisplayLabel.options = [];
      this.scope.availableDevices.forEach((item) => {
        if (state && item.protocol === 'rest') {
          this.scope.model.deviceDisplayLabel.options.push({
            'label': item.name,
            'value': item.id
          });  
        } 
        else if (!state){
          this.scope.model.deviceDisplayLabel.options.push({
            'label': item.name,
            'value': item.id
          });  
        }
      });
      this.scope.model.deviceOption = this.scope.model.deviceDisplayLabel.options[0];
      this.scope.changeDevice(this.scope.model.deviceOption);
    };
  }

  initSelectOptions() {
    this.scope.model.nameHelper.validation = 'false';
    this.scope.model.is_mlag = false;
    this.scope.model.deviceDisplayLabel.options = [];
    this.scope.model.leafGroupDisplayLabel.options = [];
    this.scope.availableDevices.forEach((item) => {
      if (item.protocol === 'rest') this.scope.model.disableMLAG = false;
      this.scope.model.deviceDisplayLabel.options.push({
        'label': item.name,
        'value': item.id
      });
    });

    if (this.scope.edit) {
      this.scope.model.name = this.scope.trunk.name;
      this.scope.model.deviceOption = this.di._.find(this.scope.model.deviceDisplayLabel.options, 
        {'value': this.scope.trunk.members[0]['device_id']});
      this.scope.model.membersDetail = [];
      this.scope.trunk.members.forEach((member) => {
        this.scope.model.membersDetail.push({
          'device_id': member.device_id,
          'port': member.port,
          'device_name': this.scope.model.deviceOption.label 
        });
      });
    }
    else {
      this.scope.model.name = null;
      this.scope.model.membersDetail = [];
      this.scope.model.deviceOption = this.scope.model.deviceDisplayLabel.options[0];
    }

    if (Object.keys(this.scope.leafGroups).length === 0) {
      this.scope.model.disableMLAG = true;
    }
    else {
      for (let key in this.scope.leafGroups) {
        this.scope.model.leafGroupDisplayLabel.options.push({
          'label': key,
          'value': this.scope.leafGroups[key]
        });
      }
      this.scope.model.leafGroupOption = this.scope.model.leafGroupDisplayLabel.options[0];
    }

    this.scope.changeDevice(this.scope.model.deviceOption);
  }
}
TrunkController.$inject = TrunkController.getDI();
TrunkController.$$ngIsClass = true;