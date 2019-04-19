export class EcnEstablishController {
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
    EcnEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.showWizard = false;
    this.scope.dscp_regex = '^[1-9][0-9]?|100$';
    this.scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/ecn_establish'),
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
      threshold: null,
      update: false,
      thresholdHelper: {
        'id': 'thresholdHelp',
        'persistent': 'true',
        'content': this.di.$filter('translate')('MODULES.LOGICAL.QOS.TAB.ECN.THRESHOLD.HELP')
      },
      thresholdDisplayLabel: {
        'id': 'thresholdLabel'
      }
    }

    this.scope.open = (data)  => {
      if(this.scope.showWizard) return;
      this.scope.model.thresholdHelper.persistent = 'true';
      this.scope.model.thresholdHelper.validation = 'false';
      if (data) {
        this.scope.title = this.di.$filter('translate')('MODULES.LOGICAL.QOS.ECN.UPDATE_COS');
        this.scope.model.update = true;
        this.scope.model.queueObject = this.di._.find(this.scope.queuesLabel.options, {'value': data.queue});
        this.scope.model.threshold = data.threshold;
      }
      else {
        this.scope.title = this.di.$filter('translate')('MODULES.LOGICAL.QOS.ECN.CREATE_COS');
        this.scope.model.update = false;
        this.scope.model.queueObject = this.scope.queuesLabel.options[0];
        this.scope.model.threshold = null;
      }
      this.scope.showWizard = true;
    };

    let unsubscribes = [];
    unsubscribes.push(this.di.$rootScope.$on('ecn-wizard-show', ($event, data) => {
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


    this.scope.submit = () => {
      return new Promise((resolve, reject) => {

        this.di.$rootScope.$emit('page_qos_ecn');
        if(!validCurrentDom('ecn_establish')) {
          this.scope.model.thresholdHelper.validation = 'true';
          resolve({valid: false, errorMessage: ''});
        } else {
          this.scope.model.thresholdHelper.validation = 'false';
          let params = {
            'queue': this.scope.model.queueObject.value,
            'ecn_threshold': this.scope.model.threshold
          };
          this.di.logicalDataManager.postECN(params)
          .then(() => {
            this.di.$rootScope.$emit('ecn-list-refresh', {update: this.scope.model.update});
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

  validateThreshold() {
    const DSCP_REG = /^([0-9])+$/;
    return this.scope.model.threshold ? DSCP_REG.test(this.scope.model.threshold) : false;
  }
}

EcnEstablishController.$inject = EcnEstablishController.getDI();
EcnEstablishController.$$ngIsClass = true;