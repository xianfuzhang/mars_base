export class sFlowController {
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
    sFlowController.getDI().forEach((value, index) => {
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
        content: require('../template/sflow'),
      }
    ];
    this.scope.model = {
      port: [],
      collector_ip: null,
      polling_interval: null,
      max_payload_length: null,
      max_header_length: null,
      sample_rate: null,
      duration: null,
      ipHelper: {
        validation: 'false',
        content: this.translate('MODULES.SWITCH.SFLOW.IP.TEXT.CONTENT')
      },
      pollingHelper: {
        validation: 'false',
        persistent: 'true',
        content: this.translate('MODULES.SWITCH.SFLOW.POLLING.TEXT.CONTENT')
      },
      headerHelper: {
        validation: 'false',
        persistent: 'true',
        content: this.translate('MODULES.SWITCH.SFLOW.HEADER.TEXT.CONTENT')
      },
      payloadHelper: {
        validation: 'false',
        persistent: 'true',
        content: this.translate('MODULES.SWITCH.SFLOW.PAYLOAD.TEXT.CONTENT')
      },
      sampleRateHelper: {
        validation: 'false',
        persistent: 'true',
        content: this.translate('MODULES.SWITCH.SFLOW.SAMPLE_RATE.TEXT.CONTENT')
      },
      durationHelper: {
        validation: 'false',
        persistent: 'true',
        content: this.translate('MODULES.SWITCH.SFLOW.DURATION.TEXT.CONTENT')
      },
      deviceOption: null,
      deviceDisplayLabel: {
        options: []
      },
      portOption: null,
      portDisplayLabel: {
        options: []
      },
      membersDetail: []
    };
    this.IP_REG = /^(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))$/;
    this.INT_REG = /^\d*$/;

    this.initActions();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('sflow-wizard-show', ($event, data) => {
      this.scope.devices = data.devices;
      this.scope.open();
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  initActions() {
    this.scope.open = ()  => {
      if(this.scope.showWizard) return;
      this.scope.title = this.translate('MODULES.SWITCH.SFLOW.CREATE.TITLE');
      this.initSelectOptions();
      this.scope.showWizard = true;
    };

    this.scope.submit = () => {
      return new Promise((resolve, reject) => {
        this.scope.formatValidate('ip');
        this.scope.formatValidate('polling');
        if (this.scope.model.ipHelper.validation === 'true' ||
            this.scope.model.pollingHelper.validation === 'true' ||
            this.scope.model.headerHelper.validation === 'true' ||
            this.scope.model.payloadHelper.validation === 'true' ||
            this.scope.model.sampleRateHelper.validation === 'true' ||
            this.scope.model.durationHelper.validation === 'true') {
          resolve({valid: false, errorMessage: ''});
        return;
        }
        let params = {
          'collector_ip': this.scope.model.collector_ip,
          'polling_interval': this.scope.model.polling_interval,
          'port': []
        };
        this.scope.model.membersDetail.forEach((member) => {
          params['port'].push(member.port);
        });
        if (this.scope.model.max_header_length) {
          params['max_header_length'] = this.scope.model.max_header_length;
        }
        if (this.scope.model.max_payload_length) {
          params['max_payload_length'] = this.scope.model.max_payload_length;
        }
        if (this.scope.model.sample_rate) {
          params['sample_rate'] = this.scope.model.sample_rate;
        }
        if (this.scope.model.duration) {
          params['duration'] = this.scope.model.duration;
        }
        this.di.deviceDataManager.createDeviceSFlow(this.scope.model.deviceOption.value, params)
        .then(() => {
          this.scope.$emit('sflow-list-refresh');
          resolve({valid: true, errorMessage: ''});
        }, (err) => {
          resolve({valid: false, errorMessage: err});
        });  
      });
    };

    this.scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    this.scope.changeDevice = ($value) => {
      this.scope.model.portDisplayLabel.options = [];
      let device = this.di._.find(this.scope.devices, {'id': $value.value});
      device.ports.forEach((port) => {
        this.scope.model.portDisplayLabel.options.push({
          'label': port,
          'value': port  
        });
      });
      this.scope.model.portOption = this.scope.model.portDisplayLabel.options[0];
    };

    this.scope.addMember = () => {
      let  port = {
        'device_name': this.scope.model.deviceOption.label,
        'port': this.scope.model.portOption.value
      };
      if (this.di._.findIndex(this.scope.model.membersDetail, 
          {'device_name': port.device_name, 'port': port.port}) === -1 ) {
        this.scope.model.membersDetail.push(port);  
      }
    };

    this.scope.removeSelected = (member) => {
      let index = this.scope.model.membersDetail.indexOf(member);
      if(index > -1) {
        this.scope.model.membersDetail.splice(index, 1);
      }
    };

    this.scope.formatValidate = (field) => {
      switch(field) {
        case 'ip':
          this.scope.model.ipHelper.validation = this.IP_REG.test(this.scope.model.collector_ip) ? 'false' : 'true';
          break;
        case 'polling':
          this.scope.model.pollingHelper.validation = this.INT_REG.test(this.scope.model.polling_interval) ? 
            'false' : 'true';
          if (this.scope.model.pollingHelper.validation === 'true') return;  
          if (this.scope.model.polling_interval < 1 || this.scope.model.polling_interval > 10000000) {
            this.scope.model.pollingHelper.validation = 'true';
          }
          else{
            this.scope.model.pollingHelper.validation = 'false';  
          }  
          break;
        case 'header':
          if (!this.scope.model.max_header_length) {
            this.scope.model.headerHelper.validation = 'false';
            return;
          }  
          this.scope.model.headerHelper.validation = this.INT_REG.test(this.scope.model.max_header_length) ? 
            'false' : 'true';
          if (this.scope.model.headerHelper.validation === 'true') return;  
          if (this.scope.model.max_header_length < 64 || this.scope.model.max_header_length > 256) {
            this.scope.model.headerHelper.validation = 'true';
          }
          else{
            this.scope.model.headerHelper.validation = 'false';  
          }  
          break;
        case 'payload':
          if (!this.scope.model.max_payload_length) {
            this.scope.model.payloadHelper.validation = 'false'; 
            return;
          }  
          this.scope.model.payloadHelper.validation = this.INT_REG.test(this.scope.model.max_payload_length) ? 
            'false' : 'true';
          if (this.scope.model.payloadHelper.validation === 'true') return;  
          if (this.scope.model.max_payload_length < 200 || this.scope.model.max_payload_length > 1500) {
            this.scope.model.payloadHelper.validation = 'true';
          }
          else{
            this.scope.model.payloadHelper.validation = 'false';  
          }  
          break;
        case 'sample_rate':
          if (!this.scope.model.sample_rate) {
            this.scope.model.sampleRateHelper.validation = 'false';
            return;
          } 
          this.scope.model.sampleRateHelper.validation = this.INT_REG.test(this.scope.model.sample_rate) ? 
            'false' : 'true';
          if (this.scope.model.sampleRateHelper.validation === 'true') return;  
          if (this.scope.model.sample_rate < 256 || this.scope.model.sample_rate > 16777215) {
            this.scope.model.sampleRateHelper.validation = 'true';
          }
          else{
            this.scope.model.sampleRateHelper.validation = 'false';  
          }  
          break;
        case 'duration':
          if (!this.scope.model.duration) {
            this.scope.model.durationHelper.validation = 'false';
            return;
          } 
          this.scope.model.durationHelper.validation = this.INT_REG.test(this.scope.model.duration) ? 
            'false' : 'true';
          if (this.scope.model.durationHelper.validation === 'true') return;  
          if (this.scope.model.duration < 0 || this.scope.model.duration > 10000000) {
            this.scope.model.durationHelper.validation = 'true';
          }
          else{
            this.scope.model.durationHelper.validation = 'false';  
          }  
          break;   
      }
    };
  }

  initSelectOptions() {
    this.scope.model.collector_ip = null;
    this.scope.model.polling_interval = null;
    this.scope.model.max_header_length = null;
    this.scope.model.max_payload_length = null;
    this.scope.model.sample_rate = null;
    this.scope.model.duration = null;
    this.scope.model.ipHelper.validation = 'false';
    this.scope.model.pollingHelper.validation = 'false';
    this.scope.model.headerHelper.validation = 'false';
    this.scope.model.payloadHelper.validation = 'false';
    this.scope.model.sampleRateHelper.validation = 'false';
    this.scope.model.durationHelper.validation = 'false';
    this.scope.model.membersDetail = [];
    this.scope.model.deviceDisplayLabel.options = [];
    this.scope.devices.forEach((device) => {
      this.scope.model.deviceDisplayLabel.options.push({
        'label': device.name,
        'value': device.id
      });
    });
    this.scope.model.deviceOption = this.scope.model.deviceDisplayLabel.options[0];
    this.scope.changeDevice(this.scope.model.deviceOption);
  }
}
sFlowController.$inject = sFlowController.getDI();
sFlowController.$$ngIsClass = true;