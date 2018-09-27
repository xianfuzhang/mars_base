/**
 * Created by wls on 2018/6/7.
 */
import {MDCRipple} from '@material/ripple';

export class AddHealthyCheckController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'alertDataManager',
      'alertService',
    ];
  }

  constructor(...args) {
    this.di = {};
    AddHealthyCheckController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });


    let translate = this.di.$filter('translate');
    let unSubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const rootScope = this.di.$rootScope;

    this.di.$scope.num_regex = '^\d$|^[1-9]+[0-9]*$';

    scope.showWizard = false;

    scope.steps = [
      {
        id: 'step1',
        title: 'Common',
        content: require('../template/add_healthycheck'),
      }
    ];


    let di = this.di;


    scope.healthyCheckAddedModel = {
      switch : true,
      query : {

      }
    };
    scope.mode ='edit';
    // scope.mode ='edit';
    scope.disModel = false;

    scope.displayLabel ={
      'object': this.di.alertService.getHcObjectDisLabel(),
      'swtType': this.di.alertService.getHcTypeSwtDisLabel(),
      'ctrlType': this.di.alertService.getHcTypeCtrlDisLabel(),
      'level': this.di.alertService.getHcLevelDisLabel(),
      'condition': this.di.alertService.getHcConditionDisLabel(),
      'status': this.di.alertService.getHcStatusDisLabel(),
      'group':null
    };

    this.di.$scope.open = function(rule){
      if(scope.showWizard) return;
      clearAll();
      if(rule){
        scope.title = translate('MODULES.ALERT.ADD_HEALTHY_CHECK.TITLE.EDIT');
        console.log(rule);
        let resource = di.alertService.getRuleResource(rule.type);
        let object = di.alertService.getRuleObject(rule.from);

        let groupDefer = di.$q.defer();
        let healthDefer = di.$q.defer();
        let promises = [];

        let groups = null;
        let health = null;

        di.alertDataManager.getAllReceiveGroup().then((res) => {
          groups = res.group;

          groupDefer.resolve();
        });
        promises.push(groupDefer.promise);

        di.alertDataManager.getHealthyCheck(object, resource , rule.rule_name).then(
          (res)=>{
            health = res;
            healthDefer.resolve();
          }
        );
        promises.push(healthDefer.promise);
        Promise.all(promises).then(()=>{
          scope.showWizard = true;
          let res= health;
          scope.displayLabel.group = formatGroups(groups);

          setTimeout(function () {
            scope.healthyCheckAddedModel.name = rule.rule_name;
            scope.healthyCheckAddedModel.object = di._.find(scope.displayLabel['object']['options'], {'value':object});
            scope.healthyCheckAddedModel.switch = res.status === "enabled"?true:false;
            scope.$apply();

            scope.healthyCheckAddedModel.level = di._.find(scope.displayLabel['level']['options'], {'value':res.alert_level});
            if(resource === 'port' && res.query_rx ){
              resource = 'rx';
            } else if(resource === 'port' && res.query_tx) {
              resource = 'tx';
            }

            scope.healthyCheckAddedModel.type = object === 'switch'?di._.find(scope.displayLabel['swtType']['options'], {'value':resource}):di._.find(scope.displayLabel['ctrlType']['options'], {'value':resource});

            let query = di.alertService.getRuleCommonQuery(res);
            scope.healthyCheckAddedModel.query.condition = di._.find(scope.displayLabel['condition']['options'], {'value':query.condition});
            scope.healthyCheckAddedModel.query.value = query.value;
            scope.healthyCheckAddedModel.query.continue = query.continue;
            scope.$apply();
          })
        });


        scope.disModel = true;
      } else {
        scope.title = translate('MODULES.ALERT.ADD_HEALTHY_CHECK.TITLE.CREATE');
        di.alertDataManager.getAllReceiveGroup().then((res) => {
          scope.displayLabel.group = formatGroups(res.group);
          scope.showWizard = true;
        });
        scope.disModel = false;
      }
    };

    function clearAll() {
      scope.healthyCheckAddedModel = {
        switch : true,
        query : {

        }
      };
    }

    function formatGroups(groups){
      let res = {'options':[]};

      di._.forEach(groups, (group)=>{
        res.options.push({'label':group.name, 'value':group.name});
      });
      return res;
    }
    
    this.di.$scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    this.di.$scope.submit = function() {

      let value = Number(scope.healthyCheckAddedModel.query.value);
      let object = scope.healthyCheckAddedModel.object.value;
      let type = scope.healthyCheckAddedModel.type.value;
      let params = {
        'name': scope.healthyCheckAddedModel.name,
        'status': scope.healthyCheckAddedModel.switch === true?"enabled":"disabled",
        'alert_level': scope.healthyCheckAddedModel.level.value,
        'receive_group': scope.healthyCheckAddedModel.group.value,
        // 'query':{
        //   'condition':  scope.healthyCheckAddedModel.query.condition.value,
        //   'continue': scope.healthyCheckAddedModel.query.continue
        // }
      };

      if(type === 'rx' || type ==='tx' ){
        params['query_' + type] = {
          'condition':  scope.healthyCheckAddedModel.query.condition.value,
          'continue': scope.healthyCheckAddedModel.query.continue,
        };
        params['query_' + type][type + '_util'] = value;

        type = 'port';
      } else {
        params['query'] = {
          'condition':  scope.healthyCheckAddedModel.query.condition.value,
          'continue': scope.healthyCheckAddedModel.query.continue,
        };
        if(type === 'cpu'){
          params['query']['util'] = value;
        } else if(type === 'ram'){
          params['query']['used_ratio'] = value;
        } else if(type === 'disk'){
          params['query']['root_used_ratio'] = value;
        }
      }
      params.query = [params.query];
      return new Promise((resolve, reject) => {
        di.alertDataManager.setHealthyCheck(object, type , params)
          .then(() => {
            rootScope.$emit('healthycheck-refresh');
            resolve(true);
          }, () => {
            resolve(false);
          });
      });
    };


    unSubscribes.push(this.di.$rootScope.$on('addhealthycheck-wizard-show', ($event, rule) => {
      scope.open(rule);
    }));


    this.di.$scope.$on('$destroy', () => {
      unSubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

AddHealthyCheckController.$inject = AddHealthyCheckController.getDI();
AddHealthyCheckController.$$ngIsClass = true;


