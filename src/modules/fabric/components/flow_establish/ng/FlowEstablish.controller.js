/**
 * Created by wls on 2018/6/7.
 */

export class FlowEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '_',
      'deviceDataManager',
      'deviceService'
    ];
  }

  constructor(...args) {
    this.di = {};
    FlowEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const rootScope = this.di.$rootScope;

    this.di.$scope.mac_regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';  // MAC Address regex for validation
    this.di.$scope.ip_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    this.di.$scope.num_regex = '^\d$|^[1-9]+[0-9]*$';



    let initFlow = {
      // tableId: '',
      appId: '',
      groupId: '',
      deviceId: '',
      priority: '',
      timeout: '',
      isPermanent: false,
      treatment: {
        "instructions": []
      },
      selector: {
        "criteria": []
      }
    };

    this.di.$scope.showWizard = false;
    this.di.$scope.title = '添加Flow';
    this.di.$scope.steps = [
      {
        id: 'step1',
        title: 'Common',
        content: require('../template/flow_common'),
      },
      {
        id: 'step2',
        title: 'Instruction',
        content: require('../template/flow_treatment'),
      },
      {
        id: 'step3',
        title: 'Criteria',
        content: require('../template/flow_criteria'),
      }
    ];

    this.di.$scope.instructionSchema = this.di.deviceService.getFlowsInstructionSchema();
    this.di.$scope.criteriaSchema = this.di.deviceService.getFlowsCriteriaSchema();


    let convertList2DisLabel = (list) =>{
      let disLabels = [];
      this.di._.forEach(list, (item)=>{
        disLabels.push({'label': item, 'value':item});
      });

      return {'options': disLabels};
    };

    this.di.$scope.instructionSchemaList = convertList2DisLabel(this.di._.keys(this.di.$scope.instructionSchema));
    this.di.$scope.criteriaSchemaList = convertList2DisLabel(this.di._.keys(this.di.$scope.criteriaSchema));


    this.di.$scope.flowEstablishModel = {
      instructionType: angular.copy(this.di.$scope.instructionSchemaList.options[0]),
      criteriaType: angular.copy(this.di.$scope.criteriaSchemaList.options[0]),
    };

    this.di.$scope.instructionsModel = [
    ];


    this.di.$scope.criteriasModel = [

    ];



    this.di.$scope.subtypeList = [];

    this.di.$scope.open = function(deviceId){
      if(scope.showWizard) return;
        scope.flow = initFlow;
        scope.curDeviceId = deviceId;
        scope.showWizard = true;
        scope.$apply();
    };


    this.di.$scope.removeInstruction = (uuid) =>{
      this.di._.remove(this.di.$scope.instructionsModel, function(n) {
        return n.uuid == uuid;
      });
    };

    this.di.$scope.removeCriteria = (uuid) =>{
      this.di._.remove(this.di.$scope.criteriasModel, function(n) {
        return n.uuid == uuid;
      });
    };

    this.di.$scope.changeInstructionSelect = (uuid, item, $value) => {
      this.di._.forEach(this.di.$scope.instructionsModel, (instruction)=>{
        if(instruction.uuid == uuid){
          let key = '';
          if(!$value){
            key = item.value.value;
          } else {
            key = $value.value;
          }
          let schema = angular.copy(item.list[key]);
          addValue2Schema(schema);
          instruction.subtypeList = schema;
        }
      })
    };

    let addValue2Schema = (schema) => {
      this.di._.forEach(schema, (item)=>{
        item['value'] = '';
        item['uuid'] = (new Date().getTime());
        if(item['type'] == 'object'){
          item['display_label'] = convertList2DisLabel(this.di._.keys(item.list));
          item['value'] = item['display_label']['options'][0];
        }
      });
    };

    this.di.$scope.addInstruction = () =>{
      let type = this.di.$scope.flowEstablishModel.instructionType.value;
      let schema = angular.copy(this.di.$scope.instructionSchema[type]);
      addValue2Schema(schema);
      let len = this.di.$scope.instructionsModel.length;
      this.di.$scope.instructionsModel.push({'type': type, 'uuid':  type +'_'+len + '_' + (new Date().getTime()), 'content': schema, 'subtypeList':[]})
    };

    this.di.$scope.addCriteria = () =>{
      let type = this.di.$scope.flowEstablishModel.criteriaType.value;
      let schema = angular.copy(this.di.$scope.criteriaSchema[type]);
      addValue2Schema(schema);
      let len = this.di.$scope.criteriasModel.length;
      this.di.$scope.criteriasModel.push({'type': type, 'uuid':  type +'_'+len + '_' + (new Date().getTime()), 'content': schema})
    };

    this.di.$scope.cancel = function(formData){
      return true;
    };

    let formatInstructionValue = () => {
      let instructions = [];
      // console.log(this.di.$scope.instructionsModel);
      this.di._.forEach(this.di.$scope.instructionsModel, (instruction)=>{
        let _ins = {'type': instruction.type};
        this.di._.forEach(instruction.content, (item)=>{
          if(item.type === 'object'){
            _ins[item.field] = item.value.value;
            if(item.field === 'subtype'){
              this.di._.forEach(instruction.subtypeList, (subtype)=>{
                // _ins[subtype.field] = subtype.value;
                _ins[subtype.field] = subtype.type === 'int'?Number(subtype.value):subtype.value;
              })
            }
          } else {
            _ins[item.field] = item.type === 'int'?Number(item.value):item.value;
          }
        });
        instructions.push(_ins);
      });
      return instructions;
    };

    let formatCriteriaValue = ()=>{
      let criterias= [];
      this.di._.forEach(this.di.$scope.criteriasModel, (criteria)=>{
        let _ins = {'type': criteria.type};
        this.di._.forEach(criteria.content, (item)=>{
          // _ins[item.field] = item.value;
          _ins[item.field] = item.type === 'int'?Number(item.value):item.value;
        });
        criterias.push(_ins);
      });

      return criterias;
    };

    this.di.$scope.submit = function() {
      let instructions = formatInstructionValue();
      let criteria = formatCriteriaValue();

      let params = {
        priority: Number(scope.flow.priority),
        timeout: Number(scope.flow.timeout),
        isPermanent: scope.flow.isPermanent,
        deviceId: scope.curDeviceId,
        treatment:{
          instructions:instructions
        },
        selector:{
          criteria: criteria
        }
      };

      console.log(params);

      let tmp_appId = 'org.onosproject.core';

      return new Promise((resolve, reject) => {
        deviceDataManager.createFlow(scope.curDeviceId, tmp_appId, params)
          .then(() => {
            scope.flow = angular.copy(initFlow);
            rootScope.$emit('device-flow-refresh');
            resolve(true);
          }, () => {
            scope.switch = angular.copy(initFlow);
            resolve(false);
          });
      });
    };


    unsubscribes.push(this.di.$rootScope.$on('flow-wizard-show', ($event, deviceId) => {
      scope.open(deviceId);
    }));


    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
      // scope.switch = _.cloneDeep(initSwitch);
    })
  }
}

FlowEstablishController.$inject = FlowEstablishController.getDI();
FlowEstablishController.$$ngIsClass = true;


