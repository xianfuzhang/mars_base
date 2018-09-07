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

    let unSubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const rootScope = this.di.$rootScope;

    this.di.$scope.num_regex = '^\d$|^[1-9]+[0-9]*$';

    scope.showWizard = false;
    scope.title = '创建监控规则';
    scope.steps = [
      {
        id: 'step1',
        title: 'Common',
        content: require('../template/add_healthycheck'),
      }
    ];


    let di = this.di;


    scope.healthyCheckAddedModel = {
      switch : "true",
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
      'status': this.di.alertService.getHcStatusDisLabel()
    };

    this.di.$scope.open = function(rule){
      if(scope.showWizard) return;
      clearAll();
      if(rule){
        console.log(rule);
        // di.alertDataManager.getHealthyCheck(object, resource , name).then(
        //   (res)=>{
        //
        //   }
        // );
        let resource = di.alertService.getRuleResource(rule.type);
        let object = di.alertService.getRuleObject(rule.from);
        di.alertDataManager.getHealthyCheck(object, resource , rule.rule_name).then(
          (res)=>{
            scope.healthyCheckAddedModel.name = rule.rule_name;
            scope.healthyCheckAddedModel.object.value = object;
            scope.healthyCheckAddedModel.switch  = res.status === "enabled"?"true":"false";
            scope.healthyCheckAddedModel.level.value = rule.alert_level;
            scope.healthyCheckAddedModel.group.value = rule.receive_group;
            scope.healthyCheckAddedModel.object.value = rule.rule_name;
            scope.healthyCheckAddedModel.query.condition.value

          }
        );

 //        {
 //        “name”:”rule name”,
 //        “status”: “enabled”,
 //        “alert_level”: 1,
 // “receive_group”: “group name”,
 //        “query”:
 //          [
 //            {
 //              "util": 10,
 //        “condition”:”gt”,
 //        “continue”: 180
 //        }
 //        ]
 //

        scope.disModel = true;
      } else {
        scope.disModel = false;
      }

      scope.showWizard = true;
    };

    function clearAll() {

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
        'status': scope.healthyCheckAddedModel.switch === "true"?"enabled":"disabled",
        'alert_level': scope.healthyCheckAddedModel.level.value,
        'receive_group': scope.healthyCheckAddedModel.group.value,
        'query':{
          'condition':  scope.healthyCheckAddedModel.query.condition.value,
          'continue': scope.healthyCheckAddedModel.query.continue
        }
      };

      if(type === 'rx' || type ==='tx' ){
        type = 'port';
        params['query_' + type] = {
          'condition':  scope.healthyCheckAddedModel.query.condition.value,
          'continue': scope.healthyCheckAddedModel.query.continue,
        };
        params['query_' + type][type + '_util'] = value;
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


