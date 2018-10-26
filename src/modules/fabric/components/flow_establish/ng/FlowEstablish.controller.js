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
      '$filter',
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
    this.translate = this.di.$filter('translate');

    this.di.$scope.mac_regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';  // MAC Address regex for validation
    this.di.$scope.ip_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    this.di.$scope.num_regex = '^\d$|^[1-9]+[0-9]*$';
    this.di.$scope.ipv6_regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;

    this.FLOW_TYPES = {
      'TABLE20': {
        'UNICAST_MAC': 'unicast_mac',
        'IPV4_MULTICAST_MAC':'ipv4_multicast_mac',
        'IPV6_MULTICAST_MAC':'ipv6_multicast_mac',
      },
      'TABLE30':{
        'IPV4_MULTICAST':'ipv4_multicast',
        'IPV6_MULTICAST':'ipv6_multicast'
      },
      'TABLE40':{
        'IPV4_MULTICAST':'ipv4_multicast',
        'IPV6_MULTICAST':'ipv6_multicast'
      },
      'TABLE50':{
        'UNICAST_VLAN_BRIDGE': 'unicast_vlan_bridge',
        'MULTICAST_VLAN_BRIDGE': 'multicast_vlan_bridge',
        'DLF_VLAN_BRIDGE': 'dlf_vlan_bridge'
      }
    };

    let di = this.di;

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
        title: this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.COMMON'),
        content: require('../template/flow_common'),
      },
      {
        id: 'step2',
        title: this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.SELECTOR'),
        content: require('../template/flow_criteria'),
      },
      {
        id: 'step3',
        title: this.translate('MODULES.SWITCH.DETAIL.FLOW.COLUMN.TREATMENT'),
        content: require('../template/flow_treatment'),
      },

    ];

    this.di.$scope.instructionSchema = this.di.deviceService.getFlowsInstructionSchema();
    this.di.$scope.criteriaSchema = this.di.deviceService.getFlowsCriteriaSchema();
    this.di.$scope.tableIdSchema = this.di.deviceService.getFlowTableList();
    scope.table60Schema = this.di.deviceService.getFlowTableAclOptionList();


    let convertList2DisLabel = (list) =>{
      let disLabels = [];

      this.di._.forEach(list, (item)=>{
        disLabels.push({'label': item, 'value':item});
      });

      return {'options': disLabels};
    };

    scope.instructionSchemaList = convertList2DisLabel(this.di._.keys(this.di.$scope.instructionSchema));
    scope.criteriaSchemaList = convertList2DisLabel(this.di._.keys(this.di.$scope.criteriaSchema));
    scope.tableIdSchemaList = convertList2DisLabel(this.di._.values(this.di.$scope.tableIdSchema));
    scope.table60SchemaList = convertList2DisLabel(this.di._.keys(scope.table60Schema));


    scope.flowEstablishModel = {
      instructionType: angular.copy(scope.instructionSchemaList.options[0]),
      criteriaType: angular.copy(scope.criteriaSchemaList.options[0]),
      tableIdType: angular.copy(scope.tableIdSchemaList.options[0]),
      table60SchemaOption: angular.copy(scope.table60SchemaList.options[0]),
    };

    let _addValue2input = (input) =>{
      if(input.input_type && input.input_type === 'select'){
        let options = [];
        this.di._.forEach(input.select_value, (item)=>{
          options.push({'label': item, 'value':item});
        });
        input['displayLabel'] = {'options':options};
        input['value'] = angular.copy(input.displayLabel.options[0])
      } else {
        input['value'] = '';
      }
    }

    let addValue2FirstInputs = (inputs) => {
      let cpInputs = angular.copy(inputs);
      this.di._.forEach(cpInputs, (input)=>{
        _addValue2input(input);
      });
      return cpInputs;
    };

    let addValue2SecondInputs = (inputs) => {
      let cpInputs = angular.copy(inputs);
      let kvInputs = [];
      this.di._.forEach(cpInputs, (input)=>{
        _addValue2input(input);
        let kvInput = {};
        kvInput[input.field] = [input];
        kvInputs.push(kvInput);
      });
      return kvInputs;
    };

    let addValue2Table60Input = (field, input) => {
      let cpInputs = angular.copy(input);
      this.di._.forEach(cpInputs, (input)=>{
        _addValue2input(input);
      });

      let kvInput = {};
      kvInput[field] = cpInputs;
      return kvInput;
    };

    this.di.$scope.criteriaPageFirstInputs = addValue2FirstInputs(this.di.deviceService.getFlowTableFirstInputRowByTableId(scope.flowEstablishModel.tableIdType.value));
    this.di.$scope.criteriaPageSecondInputs = [];

    this.di.$scope.instructionsModel = [
    ];


    this.di.$scope.criteriasModel = [

    ];

    this.di.$scope.changeModel = {
      timeoutChange: false,
      priorityChange:false,
    };

    this.di.$scope.subtypeList = [];

    this.di.$scope.open = (deviceId) => {
      if(scope.showWizard) return;
        scope.flow = initFlow;
        scope.curDeviceId = deviceId;
        reset();
        this.di.$timeout(() => {
          scope.showWizard = true;
        });
    };


    let inValidJson = {
      valid: false,
      errorMessage: ''
    };


    let validJson = {
      valid: true,
      errorMessage: ''
    };


    
    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if(out && out.length === 1){
        let invalidDoms = out[0].getElementsByClassName('ng-invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }


    let translate = this.translate;
    this.di.$scope.stepValidation = function (curStep, nextStep) {
      let inValidJson_Copy = angular.copy(inValidJson);

      if(curStep === 1){
        if(nextStep > 2){
          return inValidJson_Copy;
        }

        di.$rootScope.$emit('page_flow_common');
        if(!validCurrentDom('flow_common')){
          return inValidJson_Copy
        }
      } else if(curStep === 2){
        if(nextStep > 3) {
          return inValidJson_Copy;
        }
        if(nextStep === 1) {
          return validJson;
        }

        di.$rootScope.$emit('page_flow_criteria');
        if(!validCurrentDom('flow_criteria')){
          return inValidJson_Copy
        }
      }
      return validJson;
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

    scope.addTable60Acl = ()=>{
      let curOptId = scope.flowEstablishModel.table60SchemaOption.value;
      let option = angular.copy(scope.table60Schema[scope.flowEstablishModel.table60SchemaOption.value]);

      scope.criteriaPageSecondInputs.push(addValue2Table60Input(curOptId, scope.table60Schema[curOptId]));

      this.di._.remove(scope.table60SchemaList.options, (option)=>{
        return option.value === curOptId;
      });

      scope.flowEstablishModel.table60SchemaOption = scope.table60SchemaList.options[0];
    };

    scope.delTable60Acl = (field)=> {
      this.di._.remove(scope.criteriaPageSecondInputs, (input)=>{
        let keys = this.di._.keys(input);
        for(let i =0 ; i < keys.length; i ++){
          if(keys[i] === field){
            return true;
          }
        }
        return false;
      });
      scope.table60SchemaList.options.push({'label':field, 'value':field});
    };

    this.di.$scope.changeInstructionSelect = (uuid, item, $value) => {
      this.di._.forEach(this.di.$scope.instructionsModel, (instruction)=>{
        if(instruction.uuid === uuid){
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
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };


    scope.changeTableId = (item) =>{
      scope.criteriaPageFirstInputs = addValue2FirstInputs(this.di.deviceService.getFlowTableFirstInputRowByTableId(item.value));
      scope.criteriaPageSecondInputs = [];
      if(item.value === '60'){
        scope.table60SchemaList = convertList2DisLabel(this.di._.keys(scope.table60Schema));
      }
    };

    scope.firstInputChange = (type) =>{
      let resJson = filterTypeOfFirstInputs();
      if(resJson.res === false || resJson.type === ''){
        return;
      } else {
        scope.criteriaPageSecondInputs = addValue2SecondInputs(this.di.deviceService.getFlowTableSecondInputRowByFilter(resJson['tableId'], resJson['type']));
      }
    };

    let filterTypeOfFirstInputs = () =>{
      let inputs = scope.criteriaPageFirstInputs;
      let tableId = scope.flowEstablishModel.tableIdType.value;
      if(tableId === '10' || tableId === '60') {
        return {'res': false};
      }
      if(!validCurrentDom('flow_instruction')){
        return {'res':false};
      }

      if(tableId === '20'){
        return {'res':true,'tableId':tableId, 'type':_filterTable_20(inputs)};
      } else if(tableId === '30'){
        return {'res':true,'tableId':tableId, 'type':_filterTable_30(inputs)};
      } else if(tableId === '40'){
        return {'res':true,'tableId':tableId, 'type':_filterTable_40(inputs)};
      } else if(tableId === '50'){
        return {'res':true,'tableId':tableId, 'type':_filterTable_50(inputs)};
      } {
        return {'res':false};
      }
    };

    let _filterTable_20 = (inputs) =>{

      let mac = null, ethType = null;
      this.di._.forEach(inputs, (input)=>{
        if(input.field === 'destination_mac'){
          mac =  input.value;
        } else if(input.field === 'ether_type'){
          ethType =  input.value.value;
        }
      });

      if(ethType === '0x0800' && this.di.deviceService.isIpv4MultiMAC(mac)){
        return this.FLOW_TYPES.TABLE20.IPV4_MULTICAST_MAC;
      } else if(ethType === '0x86dd' && this.di.deviceService.isIpv6MultiMAC(mac)){
        return this.FLOW_TYPES.TABLE20.IPV6_MULTICAST_MAC;
      } else if(mac.search(this.di.$scope.mac_regex) !== -1){
        return this.FLOW_TYPES.TABLE20.UNICAST_MAC;
      } else {
        return '';
      }
    };

    let _filterTable_30 = (inputs) =>{
      let ethType = null;
      this.di._.forEach(inputs, (input)=>{
        if(input.field === 'ether_type'){
          ethType =  input.value.value;
        }
      });

      if(ethType === '0x0800'){
        return this.FLOW_TYPES.TABLE30.IPV4_MULTICAST;
      } else if(ethType === '0x86dd'){
        return this.FLOW_TYPES.TABLE30.IPV6_MULTICAST;
      }
    };

    let _filterTable_40 = (inputs) =>{
      let ethType = null;
      this.di._.forEach(inputs, (input)=>{
        if(input.field === 'ether_type'){
          ethType =  input.value.value;
        }
      });

      if(ethType === '0x0800'){
        return this.FLOW_TYPES.TABLE40.IPV4_MULTICAST;
      } else if(ethType === '0x86dd'){
        return this.FLOW_TYPES.TABLE40.IPV6_MULTICAST;
      }
    };

    let _filterTable_50 = (inputs) =>{
      let mac = null;
      this.di._.forEach(inputs, (input)=>{
        if(input.field === 'destination_mac'){
          mac =  input.value;
        }
      });

      if(mac){
        let firstByteStr = parseInt(mac.substr(0, 2)).toString(2);
        let bit = firstByteStr.substr(firstByteStr.length-1);
        if(bit === '1'){
          return this.FLOW_TYPES.TABLE50.MULTICAST_VLAN_BRIDGE;
        } else {
          return this.FLOW_TYPES.TABLE50.UNICAST_VLAN_BRIDGE;
        }
      } else {
        return this.FLOW_TYPES.TABLE50.DLF_VLAN_BRIDGE;
      }
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


    let reset = () => {
      scope.instructionsModel = [];
      scope.criteriasModel = [];
      scope.flow.priority = '';
      scope.flow.timeout = '';
      scope.flow.isPermanent = false;

    };

    this.di.$scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);
      if(di.$scope.criteriasModel && di.$scope.criteriasModel.length === 0){
        inValidJson_Copy['errorMessage'] = translate('MODULES.SWITCH.DETAIL.CONTENT.NEED_ADD_SELECTOR');
        // return inValidJson_Copy;
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      di.$rootScope.$emit('page_flow_criteria');
      if(!validCurrentDom('flow_criteria')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

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


