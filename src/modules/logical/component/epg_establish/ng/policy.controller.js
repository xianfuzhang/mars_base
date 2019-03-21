export class EGPPolicyEstablishController {
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
    EGPPolicyEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.showWizard = false;
    this.scope.steps = [
      {
        id: 'step1',
        title: this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.INFO'),
        content: require('../template/policy'),
      },
      {
        id: 'step2',
        title: this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE'),
        content: require('../template/rules'),
      }
    ];
    this.scope.tenantsLabel = {
      options: []
    };
    this.scope.groupsLabel = {
      options: []
    };
    this.scope.protocolLabel = {
      options: [
        {
          'label': 'TCP',
          'value': 'TCP'
        },
        {
          'label': 'UDP',
          'value': 'UDP'
        },
        {
          'label': 'ICMP',
          'value': 'ICMP'
        },
       /* {
          'label': this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE.PROTO.OTHER'),
          'value': 'OTHER'
        }*/
      ]
    }

    this.scope.tenantMap = [];

    this.scope.model  = {
      name: null,
      tenantObject: null,
      tenantName: null,
      groupObject: null,
      rules: [],
      nameHelper: {
        'id': 'nameHelper',
        'validation': 'false',
        'content': this.translate('MODULES.TRUNK.CREATE.FORM.NAME.HELP')
      },
      nameDisplayLabel: {
        'id': 'nameLabel',
        'regType': 'nameString'
      },
    };
    this.scope.ruleIndex = 0;
    this.scope.ruleReceived =  [];

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('policy-wizard-show', ($event, data) => {
      this.scope.open(data);
    }));

    unsubscribes.push(this.di.$scope.$watch('model.groupObject', (newValue, oldValue) => {
      if(newValue !== null){
        let ob = this.di._.find(this.scope.tenantMap, {'name': newValue.value});
        if(ob){
          this.di.$scope.model.tenantName = ob.tenant;
        }
      }
    }));



    this.scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });

    this.initActions();
  }

  initActions() {
    this.scope.open = (data)=> {
      if(this.scope.showWizard) return;
      this.initWizardParams(data);
      this.scope.title = '添加Policy';
      this.scope.showWizard = true;
    };

    this.scope.submit = () => {
      return new Promise((resolve, reject) => {
        if (!this.scope.ruleReceived.length) {
          resolve({valid: false, errorMessage: this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE.HELP')});
          return;
        }
        if (!this.validateRule()) {
          resolve({valid: false, errorMessage: ''});
        }
        else {
          this.createPolicy(resolve);
          //resolve({valid: true, errorMessage: ''});
        }
      });  
    };

    this.scope.cancel = () => {
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    this.scope.addRule = () => {
      this.scope.ruleReceived.push({
        'ipProtoObject': this.scope.protocolLabel.options[0],
        'ether_type': '0x0800',
        'src_ip': null,
        'dst_ip': null,
        'icmp_type': null,
        'icmp_code': null,
        'src_port': null,
        'dst_port': null,
        'dst_mac': null,
        'vlan_id': null,
        'action': 'permit',
        'helpers': {
          'srcPortHelper': {
            'id': 'srcPortHelper' + this.scope.ruleIndex,
            'validation': 'false'
          },
          'dstPortHelper': {
            'id': 'dstPortHelper' + this.scope.ruleIndex,
            'validation': 'false'
          },
          'icmpTypeHelper': {
            'id': 'icmpTypeHelper' + this.scope.ruleIndex,
            'validation': 'false'
          },
          'icmpCodeHelper': {
            'id': 'icmpCodeHelper' + this.scope.ruleIndex,
            'validation': 'false'
          },
          'srcIpHelper': {
            'id': 'srcIpHelper' + this.scope.ruleIndex,
            'validation': 'false',
            'persistent': 'true',
            'content': this.di.$filter('translate')('MODULES.LOGICAL.EGP.TAB.POLICY.IP.HELP')
          },
          'dstIpHelper': {
            'id': 'dstIpHelper' + this.scope.ruleIndex,
            'validation': 'false',
            'persistent': 'true',
            'content': this.di.$filter('translate')('MODULES.LOGICAL.EGP.TAB.POLICY.IP.HELP')
          },
          'dstMacHelper': {
            'id': 'dstMacHelper' + this.scope.ruleIndex,
            'validation': 'false',
            'persistent': 'true',
            'content': this.di.$filter('translate')('MODULES.LOGICAL.EGP.TAB.POLICY.MAC.HELP')
          },
          'vlanHelper': {
            'id': 'vlanHelper' + this.scope.ruleIndex,
            'validation': 'false'
          }
        },
        'labels': {
          'srcPortDisplayLabel': {'id': 'srcPortLabel' + this.scope.ruleIndex, 'regType': 'positive_int'},
          'dstPortDisplayLabel': {'id': 'dstPortLabel' + this.scope.ruleIndex, 'regType': 'positive_int'},
          'icmpTypeDisplayLabel': {'id': 'icmpTypeLabel' + this.scope.ruleIndex, 'regType': 'number'},
          'icmpCodeDisplayLabel': {'id': 'icmpCodeLabel' + this.scope.ruleIndex, 'regType': 'number'},
          //'icmpTypeDisplayLabel': 'icmpTypeLabel' + this.scope.ruleIndex,
          //'icmpCodeDisplayLabel': 'icmpCodeLabel' + this.scope.ruleIndex,
          'srcIpDisplayLabel': {'id': 'srcIpLabel' + this.scope.ruleIndex, 'regType': 'ip_mask'},
          'dstIpDisplayLabel': {'id': 'dstIpLabel' + this.scope.ruleIndex, 'regType': 'ip_mask'},
          'dstMacDisplayLabel': {'id': 'dstMacLabel' + this.scope.ruleIndex, 'regType': 'mac'},
          'vlanDisplayLabel': {'id': 'vlanLabel' + this.scope.ruleIndex, 'regType': 'vlan_number'}
        },
        'ruleActions': [
          {
            id: 'check_1_'+ this.scope.ruleIndex, 
            label: this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE.ACTION.PERMIT'), 
            name: 'rule_action_'+ this.scope.ruleIndex,
            value:  'permit'
          },
          {
            id: 'check_2_'+ this.scope.ruleIndex, 
            label: this.translate('MODULES.LOGICAL.EGP.TAB.POLICY.CREATE.RULE.ACTION.DENY'), 
            name: 'rule_action_'+ this.scope.ruleIndex, 
            value:  'deny'
          }
        ]
      });
      this.scope.ruleIndex++;
    };

    this.scope.removeRule = (rule) => {
      let index = this.scope.ruleReceived.indexOf(rule);
      this.scope.ruleReceived.splice(index, 1);
    };

    this.scope.stepValidation = (curSetp, nextStep) => {
      let validation = {
        'valid': true,
        'errorMessage': ''
      };
      if (curSetp === 1 && nextStep === 2) {
        if (!this.validateInfo()) {
          validation.valid = false;
        }
      }
      return validation;
    };
  }

  initWizardParams(data) {
    this.scope.tenantsLabel.options = [];
    this.scope.groupsLabel.options = [];
    this.scope.ruleReceived = [];
    this.scope.ruleIndex = 0;

    this.scope.tenantMap = angular.copy(data.groups);

    data.tenants.forEach((item) => {
      this.scope.tenantsLabel.options.push({
        'label': item.name,
        'value': item.name
      });
    });
    data.groups.forEach((item) => {
      this.scope.groupsLabel.options.push({
        'label': item.name,
        'value': item.name
      });
    });
    this.scope.model.name = null;
    this.scope.model.nameHelper.validation = 'false';
    this.scope.addRule();
  }

  validateInfo() {
    let val = true;
    if (!this.scope.model.name) {
      this.scope.model.nameHelper.validation = 'true';
      val = false;
    }
    return val;
  }

  validateRule() {
    let val = true;
    const INT_REG = /^\d+$/,
      MAC_REG = /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/,
      IP_REG = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-2][0-9]|3[0-2])$/;
    this.scope.ruleReceived.forEach((rule) => {
      if (rule.ipProtoObject.value === 'UDP' || rule.ipProtoObject.value === 'TCP') {
        rule.helpers.srcPortHelper.validation = INT_REG.test(rule.src_port) ? 'false' : 'true';
        rule.helpers.dstPortHelper.validation = INT_REG.test(rule.dst_port) ? 'false' : 'true';
        if (!INT_REG.test(rule.src_port) || !INT_REG.test(rule.dst_port)) val = false;
      }
      else if (rule.ipProtoObject.value === 'ICMP') {
        rule.helpers.icmpTypeHelper.validation = INT_REG.test(rule.icmp_type) ? 'false' : 'true';
        rule.helpers.icmpCodeHelper.validation = INT_REG.test(rule.icmp_code) ? 'false' : 'true';
        if (!INT_REG.test(rule.icmp_type) || !INT_REG.test(rule.icmp_code)) val = false;
      }
      rule.helpers.srcIpHelper.validation = IP_REG.test(rule.src_ip) ? 'false' : 'true';
      rule.helpers.dstIpHelper.validation = IP_REG.test(rule.dst_ip) ? 'false' : 'true';
      
      rule.helpers.dstMacHelper.validation = MAC_REG.test(rule.dst_mac) ? 'false' : 'true';
      rule.helpers.vlanHelper.validation = INT_REG.test(rule.vlan_id) ? 'false' : 'true';
      if (!IP_REG.test(rule.src_ip) || !IP_REG.test(rule.dst_ip) || 
          !MAC_REG.test(rule.dst_mac) || !INT_REG.test(rule.vlan_id)) val = false;
    });
    return val;
  }

  createPolicy(resolve) {
    let params = {
      'tenant': this.scope.model.tenantName,
      'apply_to': this.scope.model.groupObject.value,
      'policy_name': this.scope.model.name,
      'rules': []
    };
    this.scope.ruleReceived.forEach((rule) => {
      let obj = {'match': {}, 'action': null};
      if (rule.ipProtoObject.value === 'UDP' || rule.ipProtoObject.value === 'TCP') {
        obj['match']['src_port'] = parseInt(rule.src_port);
        obj['match']['dst_port'] = parseInt(rule.dst_port);
        obj['match']['ip_proto'] = rule.ipProtoObject.value === 'UDP' ? 17 : 6;
      }
      else if (rule.ipProtoObject.value === 'ICMP') {
        obj['match']['icmp_type'] = parseInt(rule.icmp_type);
        obj['match']['icmp_code'] = parseInt(rule.icmp_code);
        obj['match']['ip_proto'] = 1;
      }
      obj['match']['ether_type'] = '0x0800';
      obj['match']['src_ip'] = rule.src_ip;
      obj['match']['dst_ip'] = rule.dst_ip;
      obj['match']['dst_mac'] = rule.dst_mac;
      obj['match']['vlan_id'] = rule.vlan_id;
      obj['action'] = rule.action;
      params.rules.push(obj);
    });
    this.di.logicalDataManager.createEGPPolicy(params)
    .then(() => {
      this.di.$rootScope.$emit('egp-policy-list-refresh');
      resolve({valid: true, errorMessage: ''});
    }, (msg) => {
      resolve({valid: false, errorMessage: msg});
    });
  }
}
EGPPolicyEstablishController.$inject = EGPPolicyEstablishController.getDI();
EGPPolicyEstablishController.$$ngIsClass = true;