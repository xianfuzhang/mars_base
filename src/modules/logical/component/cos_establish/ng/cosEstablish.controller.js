export class CosEstablishController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '_',
      '$rootScope',
      'logicalDataManager',
      'regexService'
    ];
  }
  constructor(...args){
    this.di = {};
    CosEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.showWizard = false;
    this.scope.steps = [
      {
        id: 'step1',
        title: '',
        content: require('../template/cos_establish'),
      }
    ];
    this.scope.queuesLabel = {
      options: [
        {'label': '0', 'value': 0},
        {'label': '1', 'value': 1},
        {'label': '2', 'value': 2},
        {'label': '3', 'value': 3},
        {'label': '4', 'value': 4},
        {'label': '5', 'value': 5},
        {'label': '6', 'value': 6},
        {'label': '7', 'value': 7}
      ]
    };
    this.scope.model = {
      queueObject: null,
      dscp: null,
      update: false,
      dscpHelper: {
        'id': 'dscpHelp',
        'persistent': 'true',
        'content': this.di.$filter('translate')('MODULES.LOGICAL.QOS.TAB.COS.DSCP.HELP')
      },
      dscpDisplayLabel: {
        'id': 'dscpLabel',
        'regType': 'dscp_number'
      }
    }

    this.scope.open = (data)  => {
      if(this.scope.showWizard) return;
      this.scope.model.dscpHelper.persistent = 'true';
      this.scope.model.dscpHelper.validation = 'false';
      if (data) {
        this.scope.title = '更新COS';
        this.scope.model.update = true;
        this.scope.model.queueObject = this.di._.find(this.scope.queuesLabel.options, {'value': data.queue});
        this.scope.model.dscp = data.dscp.toString();
      }
      else {
        this.scope.title = '添加COS';
        this.scope.model.update = false;
        this.scope.model.queueObject = this.scope.queuesLabel.options[0];
        this.scope.model.dscp = null;
      }
      this.scope.showWizard = true;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('cos-wizard-show', ($event, data) => {
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
    this.scope.submit = () => {
      return new Promise((resolve, reject) => {
        if(!this.validateDSCP()) {
          this.scope.model.dscpHelper.validation = 'true';
          resolve({valid: false, errorMessage: ''});
        }
        else {
          this.scope.model.dscpHelper.validation = 'false';
          let params = {
            'queue': this.scope.model.queueObject.value,
            'dscp': this.scope.model.dscp.split(',')
          };
          this.di.logicalDataManager.postCOS(params)
          .then(() => {
            this.di.$rootScope.$emit('cos-list-refresh', {update: this.scope.model.update});
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

  validateDSCP() {
    return this.scope.model.dscp? this.di.regexService.excute('dscp_number', this.scope.model.dscp.toString()) : false;
  }
}

CosEstablishController.$inject = CosEstablishController.getDI();
CosEstablishController.$$ngIsClass = true;