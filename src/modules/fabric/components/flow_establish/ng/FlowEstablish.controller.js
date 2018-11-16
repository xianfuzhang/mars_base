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
    this.di.$scope.num_regex_with_zero = '^\d$|^[1-9]+[0-9]*|0$';
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


    scope.treatmentPageGroup = {};

    let convertList2DisLabel = (list) =>{
      let disLabels = [];

      this.di._.forEach(list, (item)=>{
        disLabels.push({'label': item, 'value':item});
      });

      return {'options': disLabels};
    };

    let classifyGroups = (groups) =>{
      let res_group = {};
      this.di._.forEach(groups, (group)=>{


        let id = group['id'] + '';
        let binaryId = parseInt(id).toString(2) + '';
        let fullBinary = '0'.repeat(32-binaryId.length) + binaryId;
        let typeId = parseInt(fullBinary.substr(0, 4),2) + '';

        group['id'] = '0x' + parseInt(id).toString(16);
        if(res_group[typeId]){
          res_group[typeId].push(group);
        } else {
          res_group[typeId] = [group];
        }
      });
      return res_group;
    };



    scope.instructionSchemaList = convertList2DisLabel(this.di._.keys(this.di.$scope.instructionSchema));
    scope.criteriaSchemaList = convertList2DisLabel(this.di._.keys(this.di.$scope.criteriaSchema));
    scope.tableIdSchemaList = convertList2DisLabel(this.di._.values(this.di.$scope.tableIdSchema));
    scope.table60SchemaList = convertList2DisLabel(this.di._.keys(scope.table60Schema));


    scope.flowEstablishModel = {
      instructionType: angular.copy(scope.instructionSchemaList.options[0]),
      criteriaType: angular.copy(scope.criteriaSchemaList.options[0]),
      tableIdType: scope.tableIdSchemaList.options[5],
      table60SchemaOption: angular.copy(scope.table60SchemaList.options[0]),
    };

    let _addValue2input = (input) =>{
      if(input.input_type && input.input_type === 'select'){
        // let options = [];
        // this.di._.forEach(input.select_value, (item)=>{
        //   options.push({'label': item, 'value':item});
        // });
        input['displayLabel'] = {'options':input.select_value};
        input['value'] = angular.copy(input.displayLabel.options[0])
      } else {
        input['value'] = '';
      }
      if(input['field'] === 'vlan_id'){
        input['field_label'] = 'VLAN';
      } else {
        input['field_label'] = input['field'].replace('_',' ');
      }

    };

    let addValue2FirstInputs = (inputs) => {
      let cpInputs = angular.copy(inputs);
      this.di._.forEach(cpInputs, (input)=>{
        _addValue2input(input);
      });
      return cpInputs;
    };

    scope.groupChanged = () =>{
      _initGroupIdsDisplayLabel();
    };

    scope.outputChange = () => {
      let tableId = scope.flowTypeJson.tableId;
      let type = scope.flowTypeJson.type;
      if(tableId === '30'){
        this.di._.forEach(scope.treatmentPageApplyAction, (item)=>{
          if(item.field == 'output_to_ctrl'){
            if(item.value === true){
              scope.treatmentPageGroup['groups'] = null;
            } else {
              scope.treatmentPageGroup['groups'] = this.di.deviceService.getFlowTableWriteActionMapByFilter(tableId, type);
            }
          }
        })
      }
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
    scope.deviceGroupsMapper = null;
    this.di.$scope.open = (deviceId) => {
      if(scope.showWizard) return;
        scope.flow = initFlow;
        scope.curDeviceId = deviceId;

        this.di.deviceDataManager.getDeviceGroups(scope.curDeviceId).then((res)=>{
          if(res && res.data.groups.length > 0) {
            scope.deviceGroupsMapper = classifyGroups(res.data.groups);
          }
          console.log(scope.flowEstablishModel.tableIdType);
          this.di.$timeout(() => {
            scope.showWizard = true;
            reset();
            scope.$apply();
          });
        });

        // console.log(scope.flowEstablishModel.tableIdType);
        // this.di.$timeout(() => {
        //   scope.showWizard = true;
        //   reset();
        //   scope.$apply();
        // });
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


    let _initGroupsDisplayLabel = () =>{

      scope.treatmentPageGroup.groupsDisplayLabel = {'options':[]};
      this.di._.forEach(scope.treatmentPageGroup['groups'], (group)=>{
        scope.treatmentPageGroup.groupsDisplayLabel.options.push({'label': this.di.deviceService.getGroupNameByKey(group), 'value':group});
      });

      scope.treatmentPageGroup.groupTypeSelected = scope.treatmentPageGroup.groupsDisplayLabel['options'].length > 0?scope.treatmentPageGroup.groupsDisplayLabel['options'][0]:null;
    };


    let _initGroupIdsDisplayLabel = () =>{
      scope.treatmentPageGroup.groupIdDisplayLabel = {'options':[{'label': '请选择Group', 'value':-1}]};
      if(scope.treatmentPageGroup.groupTypeSelected){
        if(scope.deviceGroupsMapper){
          let groups = scope.deviceGroupsMapper[this.di.deviceService.getGroupTypeId(scope.treatmentPageGroup.groupTypeSelected.value)];
          this.di._.forEach(groups, (group)=>{
            scope.treatmentPageGroup.groupIdDisplayLabel.options.push({'label': group['id'], 'value': group['id']});
          });
        }
      }
      scope.treatmentPageGroup.groupSelected = scope.treatmentPageGroup.groupIdDisplayLabel['options'][0]
    };

    let initializeAction = () =>{
      let tableId = scope.flowTypeJson['tableId'];
      let type = scope.flowTypeJson['type'];
      scope.treatmentPageApplyAction = this.di.deviceService.getFlowTableApplyActionMapByTid(tableId);

      scope.treatmentPageGroup['groups'] = this.di.deviceService.getFlowTableWriteActionMapByFilter(tableId, type);



      if(scope.treatmentPageGroup['groups'] !== null){
        _initGroupsDisplayLabel();
        _initGroupIdsDisplayLabel();
      }

    };

    let checkCriteriaValue = () => {
      let status = true;
      let message = '';

      if(!_ifTable60SchemaListContain('vlan_pcp')){
        if(_ifTable60SchemaListContain('vlan_id')){
          status = false;
          message = "VLAN PCP需要设置VLAN ID"
        }
      }

      if(!_ifTable60SchemaListContain('source_ipv4') || !_ifTable60SchemaListContain('destination_ipv4')){
        if(!_ifTable60SchemaListContain('ether_type')){
          let res = _getValueFromSecondInputs('ether_type');
          if(res !== null && res.toLowerCase() !== '0x0800'){
            status = false;
            message = "SOURCE_IPV4/DESTINATION_IPV4 对应的 ETH_TYPE 不正确!";
          }
        }
      }

      if(!_ifTable60SchemaListContain('source_ipv6')|| !_ifTable60SchemaListContain('destination_ipv6') || !_ifTable60SchemaListContain('ipv6_flow_label')){
        if(!_ifTable60SchemaListContain('ether_type')){
          let res = _getValueFromSecondInputs('ether_type');
          if(res !== null && res.toLowerCase() !== '0x86dd'){
            status = false;
            message = "SOURCE_IPV6/DESTINATION_IPV6/IPV6_FLOW_LABEL 对应的 ETH_TYPE 为 0x86dd!";
          }
        }
      }

      if(!_ifTable60SchemaListContain('ip_dscp') || !_ifTable60SchemaListContain('ip_proto') || !_ifTable60SchemaListContain('ip_ecn')){
          let res = _getValueFromSecondInputs('ether_type');
          if(res.toLowerCase() !== '0x86dd' && res.toLowerCase() !== '0x0800'){
            status = false;
            message = "IP_DSCP/IP_PROTO/IP_ECN 对应的 ETH_TYPE 为 0x86dd 或者 0x0800!";
          }
      }

      if(!_ifTable60SchemaListContain('tcp_sport') || !_ifTable60SchemaListContain('tcp_dport')){
        let res = _getValueFromSecondInputs('ip_proto');
        if(res !== null && res !== '6'){
          status = false;
          message = "TCP设置需要 IP_PROTO 为 6!";
        }

        res = _getValueFromSecondInputs('ether_type');
        if(typeof res === 'string' && res.toLowerCase() !== '0x86dd' && res.toLowerCase() !== '0x0800' || res === null){
          status = false;
          message = "TCP对应的 ETH_TYPE 为 0x86dd 或者 0x0800!";
        }
      }

      if(!_ifTable60SchemaListContain('udp_sport') || !_ifTable60SchemaListContain('udp_dport')){
        let res = _getValueFromSecondInputs('ip_proto');
        if(res !== null && res !== '17'){
          status = false;
          message = "UDP设置需要 IP_PROTO 为 17!";
        }

        res = _getValueFromSecondInputs('ether_type');
        if(typeof res === 'string' && res.toLowerCase() !== '0x86dd' && res.toLowerCase() !== '0x0800' || res === null){
          status = false;
          message = "UDP对应的 ETH_TYPE 为 0x86dd 或者 0x0800!";
        }
      }

      if(!_ifTable60SchemaListContain('sctp_sport') || !_ifTable60SchemaListContain('sctp_dport')){
        let res = _getValueFromSecondInputs('ip_proto');
        if(res !== null && res !== '132'){
          res = false;
          message = "SCTP设置需要 IP_PROTO 为 132!";
        }

        res = _getValueFromSecondInputs('ether_type');
        if(typeof res === 'string' && res.toLowerCase() !== '0x86dd' && res.toLowerCase() !== '0x0800' || res === null){
          status = false;
          message = "SCTP对应的 ETH_TYPE 为 0x86dd 或者 0x0800!";
        }
      }

      if(!_ifTable60SchemaListContain('icmpv4_type') || !_ifTable60SchemaListContain('icmpv4_code')){
        let res = _getValueFromSecondInputs('ip_proto');
        if(res !== null && res !== '1'){
          status = false;
          message = "ICMPV4设置需要 IP_PROTO 为 1!";
        }

        res = _getValueFromSecondInputs('ether_type');
        if(res !== null && res.toLowerCase() !== '0x0800'){
          status = false;
          message = "ICMPV4 对应的 ETH_TYPE 为 0x0800!";
        }
      }

      if(!_ifTable60SchemaListContain('icmpv6_type') || !_ifTable60SchemaListContain('icmpv6_code')){
        let res = _getValueFromSecondInputs('ip_proto');
        if(res !== null && res !== '58'){
          status = false;
          message = "ICMPV6设置需要 IP_PROTO 为 58!";
        }

        res = _getValueFromSecondInputs('ether_type');
        if(res !== null && res.toLowerCase() !== '0x86dd'){
          status = false;
          message = "ICMPV6 对应的 ETH_TYPE 为 0x86dd!";
        }
      }

      return {'res':status, 'message':message}
    };


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

        if(scope.flowEstablishModel.tableIdType.value ==='60' && scope.criteriaPageSecondInputs.length === 0){
          inValidJson_Copy['errorMessage'] = "请至少添加一个选择器!";
          return inValidJson_Copy;
        }

        let resJson = checkCriteriaValue();
        if(!resJson.res){
          inValidJson_Copy['errorMessage'] = resJson.message;
          return inValidJson_Copy;
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

    let getReferenceInput = (curOptId) => {
      if(curOptId === 'vlan_pcp'){
        if(_ifTable60SchemaListContain('vlan_id')){
          _addTable60SelectItem('vlan_id');
        }
      } else if(curOptId === 'source_ipv4' || curOptId === 'destination_ipv4'){
        for(let i = 0 ; i< scope.criteriaPageSecondInputs.length; i++){
          let input = scope.criteriaPageSecondInputs[i];
          if(input['source_ipv6'] || input['destination_ipv6'] || input['ipv6_flow_label']){
            let errorMessage = "IPv4和IPv6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv6_type']|| input['icmpv6_code']){
            let errorMessage = "IPv4和IPv6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }

        }
      } else if(curOptId === 'source_ipv6' || curOptId === 'destination_ipv6' || curOptId === 'ipv6_flow_label'){
        for(let i = 0 ; i< scope.criteriaPageSecondInputs.length; i++){
          let input = scope.criteriaPageSecondInputs[i];
          if(input['source_ipv4'] || input['destination_ipv4']){
            let errorMessage = "IPv4和IPv6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv4_type']|| input['icmpv4_code']){
            let errorMessage = "IPv4和IPv6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }
        }
      } else if(curOptId === 'ip_dscp' || curOptId === 'ip_proto' || curOptId === 'ip_ecn'){
        if(_ifTable60SchemaListContain('ether_type')){
          _addTable60SelectItem('ether_type');
        }
      } else if(curOptId === 'tcp_sport' || curOptId === 'tcp_dport'){
        for(let i = 0 ; i< scope.criteriaPageSecondInputs.length; i++){
          let input = scope.criteriaPageSecondInputs[i];
          if(input['udp_sport'] || input['udp_dport'] ){
            let errorMessage = "TCP和UDP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv4_type']|| input['icmpv4_code']){
            let errorMessage = "UDP和ICMPV4不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['sctp_sport'] || input['sctp_dport'] ){
            let errorMessage = "UDP和SCTP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv6_type'] || input['icmpv6_code'] ){
            let errorMessage = "TCP和ICMPV6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }
        }

        if(_ifTable60SchemaListContain('ether_type')){
          _addTable60SelectItem('ether_type');
        }
      } else if(curOptId === 'udp_sport' || curOptId === 'udp_dport'){
        for(let i = 0 ; i< scope.criteriaPageSecondInputs.length; i++){
          let input = scope.criteriaPageSecondInputs[i];
          if(input['tcp_sport'] || input['tcp_dport'] ){
            let errorMessage = "UDP和TCP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv4_type']|| input['icmpv4_code']){
            let errorMessage = "UDP和ICMPV4不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['sctp_sport'] || input['sctp_dport'] ){
            let errorMessage = "UDP和SCTP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv6_type'] || input['icmpv6_code'] ){
            let errorMessage = "TCP和ICMPV6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }
        }

        if(_ifTable60SchemaListContain('ether_type')){
          _addTable60SelectItem('ether_type');
        }
      } else if(curOptId === 'icmpv4_type' || curOptId === 'icmpv4_code'){
        for(let i = 0 ; i< scope.criteriaPageSecondInputs.length; i++){
          let input = scope.criteriaPageSecondInputs[i];
          if(input['tcp_sport'] || input['tcp_dport'] ) {
            let errorMessage = "ICMPV4和TCP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }else if(input['udp_sport'] || input['udp_dport'] ){
            let errorMessage = "ICMPV4和UDP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['sctp_sport'] || input['sctp_dport'] ){
            let errorMessage = "ICMPV4和SCTP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv6_type'] || input['icmpv6_code'] ){
            let errorMessage = "ICMPV4和ICMPV6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['source_ipv6'] || input['destination_ipv6'] || input['ipv6_flow_label']){
            let errorMessage = "IPv4和IPv6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }
        }

      } else if(curOptId === 'sctp_sport' || curOptId === 'sctp_dport'){
        for(let i = 0 ; i< scope.criteriaPageSecondInputs.length; i++){
          let input = scope.criteriaPageSecondInputs[i];
          if(input['tcp_sport'] || input['tcp_dport'] ) {
            let errorMessage = "SCTP和TCP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }else if(input['udp_sport'] || input['udp_dport'] ){
            let errorMessage = "SCTP和UDP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv4_type']|| input['icmpv4_code']){
            let errorMessage = "SCTP和ICMPV4不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv6_type'] || input['icmpv6_code'] ){
            let errorMessage = "SCTP和ICMPV6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }
        }

        if(_ifTable60SchemaListContain('ether_type')){
          _addTable60SelectItem('ether_type');
        }

      } else if(curOptId === 'icmpv6_type' || curOptId === 'icmpv6_code'){
        for(let i = 0 ; i< scope.criteriaPageSecondInputs.length; i++){
          let input = scope.criteriaPageSecondInputs[i];
          if(input['tcp_sport'] || input['tcp_dport'] ) {
            let errorMessage = "ICMPV6和TCP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }else if(input['udp_sport'] || input['udp_dport'] ){
            let errorMessage = "ICMPV6和UDP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['sctp_sport'] || input['sctp_dport'] ){
            let errorMessage = "ICMPV6和SCTP不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['icmpv4_type']|| input['icmpv4_code']){
            let errorMessage = "ICMPV6和ICMPV4不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          } else if(input['source_ipv4'] || input['destination_ipv4']){
            let errorMessage = "IPv4和IPv6不可以同时设置!";
            scope.errorMessage = errorMessage;
            return false;
          }
        }
      }
      scope.errorMessage = '';
      return true;
    };

    scope.addTable60Acl = ()=>{
      let curOptId = scope.flowEstablishModel.table60SchemaOption.value;
      let option = angular.copy(scope.table60Schema[scope.flowEstablishModel.table60SchemaOption.value]);

      if(getReferenceInput(curOptId)){
        _addTable60SelectItem(curOptId);
      }
      // scope.criteriaPageSecondInputs.push(addValue2Table60Input(curOptId, scope.table60Schema[curOptId]));
      // this.di._.remove(scope.table60SchemaList.options, (option)=>{
      //   return option.value === curOptId;
      // });
    };


    let _ifTable60SchemaListContain = (curOptId) => {
      let res = false;
      this.di._.forEach(scope.table60SchemaList.options, (option)=>{
        if(option.value === curOptId){
          res = true;
        }
      });
      return res;
    };

    let _getValueFromSecondInputs = (curOptId) => {
      let value = null;
      this.di._.forEach(scope.criteriaPageSecondInputs,(inputJson)=>{
        if(inputJson[curOptId] && Array.isArray(inputJson[curOptId])){
          this.di._.forEach(inputJson[curOptId], (item)=>{
            if(item['field'] === curOptId){
              if(typeof item['value'] === 'object'){
                value = item['value']['value']
              } else {
                value = item['value'];
              }
            }
          })
        }
      });
      return value;
    };

    let _addTable60SelectItem = (curOptId) => {
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
        if(item['type'] === 'object'){
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
        scope.flowTypeJson = {'res': true, 'tableId':'60', 'type':null};
      } else {
        scope.flowTypeJson = null;
      }

    };

    scope.firstInputChange = (type) =>{
      let resJson = filterTypeOfFirstInputs();
      scope.flowTypeJson = resJson;
      if(resJson.res === false || resJson.type === ''){
        return;
      } else {
        if(resJson.type !== null){
          scope.criteriaPageSecondInputs = addValue2SecondInputs(this.di.deviceService.getFlowTableSecondInputRowByFilter(resJson['tableId'], resJson['type']));
        }
        initializeAction();

      }
    };

    let filterTypeOfFirstInputs = () =>{
      let inputs = scope.criteriaPageFirstInputs;
      let tableId = scope.flowEstablishModel.tableIdType.value;
      if(tableId === '10' || tableId === '60') {
        return {'res': true, 'tableId':tableId, 'type':null};
      }
      if(!validCurrentDom('page_flow_criteria')){
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

      if(ethType.toLowerCase() === '0x0800' && this.di.deviceService.isIpv4MultiMAC(mac)){
        return this.FLOW_TYPES.TABLE20.IPV4_MULTICAST_MAC;
      } else if(ethType.toLowerCase() === '0x86dd' && this.di.deviceService.isIpv6MultiMAC(mac)){
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

      if(ethType.toLowerCase() === '0x0800'){
        return this.FLOW_TYPES.TABLE30.IPV4_MULTICAST;
      } else if(ethType.toLowerCase() === '0x86dd'){
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

      if(ethType.toLowerCase() === '0x0800'){
        return this.FLOW_TYPES.TABLE40.IPV4_MULTICAST;
      } else if(ethType.toLowerCase() === '0x86dd'){
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


   /* let formatInstructionValue = () => {
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
    };*/

    // let formatCriteriaValue = ()=>{
    //   let criterias= [];
    //   this.di._.forEach(this.di.$scope.criteriasModel, (criteria)=>{
    //     let _ins = {'type': criteria.type};
    //     this.di._.forEach(criteria.content, (item)=>{
    //       // _ins[item.field] = item.value;
    //       _ins[item.field] = item.type === 'int'?Number(item.value):item.value;
    //     });
    //     criterias.push(_ins);
    //   });
    //
    //   return criterias;
    // };


    let formatOfdpaCriteriaValue = () =>{
      let criteria = [];

      this.di._.forEach(scope.criteriaPageFirstInputs, (input)=>{
        // criteria.push(this.di.deviceService.getCriteriaObject(input));
        let res = this.di.deviceService.getCriteriaObject(input);
        if(res !== null) criteria.push(res);
      });

      this.di._.forEach(scope.criteriaPageSecondInputs, (inputJson)=>{
        let keys = this.di._.keys(inputJson);
        this.di._.forEach(keys, (key)=>{
          let value = inputJson[key];
          if(value instanceof Array && value.length > 0){
            if(value.length === 1){
              let res = this.di.deviceService.getCriteriaObject(value[0]);
              if(res !== null) criteria.push(res);
            } else if (value.length === 2){

              //暂时先处理mask相关的代码，其他多字段连接类型另加逻辑处理// TODO
              let v0 , v1;
              if(value[0].field.indexOf('mask') !== -1){
                v0 = value[1];
                v1 = value[0];
              } else {
                v0 = value[0];
                v1 = value[1];
              }
              v0.value = v0.value + '/' + v1.value;
              let res = this.di.deviceService.getCriteriaObject(v0);
              if(res !== null) criteria.push(res);

            }
          }
        });

      });

      ofdpaCriteriaCompletion(criteria);

      return criteria;
    };

    let ofdpaCriteriaCompletion = (criteria) => {

      if(!_ifTable60SchemaListContain('source_ipv4') || !_ifTable60SchemaListContain('destination_ipv4')){
        if(_ifTable60SchemaListContain('ether_type')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ether_type', '0x0800'));
        }
      }

      if(!_ifTable60SchemaListContain('source_ipv6')|| !_ifTable60SchemaListContain('destination_ipv6') || !_ifTable60SchemaListContain('ipv6_flow_label')){
        if(_ifTable60SchemaListContain('ether_type')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ether_type', '0x86dd'));
        }
      }

      // if(!_ifTable60SchemaListContain('ip_dscp') || !_ifTable60SchemaListContain('ip_dscp') || !_ifTable60SchemaListContain('ip_dscp')){
      //   if(_ifTable60SchemaListContain('ether_type')){
      //     _addTable60SelectItem('ether_type');
      //   }
      // }

      if(!_ifTable60SchemaListContain('tcp_sport') || !_ifTable60SchemaListContain('tcp_dport')){
        if(_ifTable60SchemaListContain('ip_proto')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ip_proto', 6));
        }
      }

      if(!_ifTable60SchemaListContain('udp_sport') || !_ifTable60SchemaListContain('udp_dport')){
        if(_ifTable60SchemaListContain('ip_proto')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ip_proto', 17));
        }
      }

      if(!_ifTable60SchemaListContain('sctp_sport') || !_ifTable60SchemaListContain('sctp_dport')){
        if(_ifTable60SchemaListContain('ip_proto')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ip_proto', 132));
        }
      }

      if(!_ifTable60SchemaListContain('icmpv4_type') || !_ifTable60SchemaListContain('icmpv4_code')){
        if(_ifTable60SchemaListContain('ip_proto')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ip_proto', 1));
        }

        if(_ifTable60SchemaListContain('ether_type')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ether_type', '0x0800'));
        }

      }

      if(!_ifTable60SchemaListContain('icmpv6_type') || !_ifTable60SchemaListContain('icmpv6_code')){
        if(_ifTable60SchemaListContain('ip_proto')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ip_proto', 58));
        }
        if(_ifTable60SchemaListContain('ether_type')){
          criteria.push(this.di.deviceService.getCriteriaReferenceObject('ether_type', '0x86dd'));
        }
      }
    };

    let formatOfdpaInstructionValue = () =>{
      let treatment = [];

      this.di._.forEach(scope.treatmentPageApplyAction, (action)=>{
        if(action['field'] === 'output_to_ctrl' && action.value === true){
          treatment.push({
            "type": "OUTPUT",
            "port": "CONTROLLER"
          })
        }
        if(action['field'] !== 'output_to_ctrl'){
          let res = this.di.deviceService.getTreatmentObject(action);
          if(res !== null){
            treatment.push(res)
          }
        }
      });

      if(scope.treatmentPageGroup.groups !== null && scope.treatmentPageGroup.groupSelected.value !== -1){
        let groupId = scope.treatmentPageGroup.groupSelected.value;
        if(typeof groupId === 'string'){
          groupId = parseInt(groupId);
        }
        treatment.push({
          "type": "GROUP",
          "groupId": groupId
        })
      }


      //增加goto table
      let gotoTable = this.di.deviceService.getFlowTableGotoTableByFilter(scope.flowTypeJson['tableId'], scope.flowTypeJson['type']);
      if(gotoTable){
        treatment.push({
          "type": "TABLE",
          "tableId": parseInt(gotoTable)
        })
      }

      return treatment;
    };

    let reset = () => {
      scope.flow.priority = '100';
      scope.flow.timeout = '10000';
      scope.flow.isPermanent = true;

      scope.flowEstablishModel.tableIdType = scope.tableIdSchemaList.options[5];
      scope.flowTypeJson = {'res': true, 'tableId':'60', 'type':null};
      initializeAction();

      scope.changeTableId(scope.flowEstablishModel.tableIdType);

    };

    this.di.$scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);
      // if(di.$scope.criteriasModel && di.$scope.criteriasModel.length === 0){
      //   inValidJson_Copy['errorMessage'] = translate('MODULES.SWITCH.DETAIL.CONTENT.NEED_ADD_SELECTOR');
      //   // return inValidJson_Copy;
      //   return new Promise((resolve, reject) => {
      //     resolve(inValidJson_Copy);
      //   });
      // }



      di.$rootScope.$emit('page_flow_instruction');
      if(!validCurrentDom('flow_instruction')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      let instructions = formatOfdpaInstructionValue();
      let criteria = formatOfdpaCriteriaValue();

      if(instructions.length === 0){
        inValidJson_Copy['errorMessage'] = "请配置Flow的处理方式!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      // if(scope.treatmentPageGroup.groups !== null && scope.treatmentPageGroup.groupSelected.value === -1){
      //   inValidJson_Copy['errorMessage'] = "请选择Group ID!";
      //   return new Promise((resolve, reject) => {
      //     resolve(inValidJson_Copy);
      //   });
      // }

      let params = {
        priority: Number(scope.flow.priority),
        timeout: Number(scope.flow.timeout),
        isPermanent: scope.flow.isPermanent,
        deviceId: scope.curDeviceId,
        tableId : Number(scope.flowTypeJson['tableId']),
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



    let ethtype_tips = [{"label":"0x0800", "value":  "Internet Protocol version 4 (IPv4)"},
      {"label":"0x0806", "value":  "Address Resolution Protocol (ARP)"},
      {"label":"0x0842", "value":  "Wake-on-LAN[3]"},
      {"label":"0x22F0", "value":  "Audio Video Transport Protocol as defined in IEEE Std 1722-2011"},
      {"label":"0x8035", "value":  "Reverse Address Resolution Protocol"},
      {"label":"0x8100", "value":  "VLAN-tagged frame (IEEE 802.1Q) & Shortest Path Bridging IEEE 802.1aq[4]"},
      {"label":"0x86DD", "value":  "Internet Protocol Version 6 (IPv6)"},
      {"label":"0x8808", "value":  "Ethernet flow control"},
      {"label":"0x8809", "value":  "Slow Protocols (IEEE 802.3)"},
      {"label":"0x8847", "value":  "MPLS unicast"},
      {"label":"0x8848", "value":  "MPLS multicast"},
      {"label":"0x8863", "value":  "PPPoE Discovery Stage"},
      {"label":"0x8864", "value":  "PPPoE Session Stage"},
      {"label":"0x8870", "value":  "Jumbo Frames[2]"},
      {"label":"0x888E", "value":  "EAP over LAN (IEEE 802.1X)"},
      {"label":"0x8892", "value":  "PROFINET Protocol"},
      {"label":"0x889A", "value":  "HyperSCSI (SCSI over Ethernet)"},
      {"label":"0x88A8", "value":  "Provider Bridging (IEEE 802.1ad) & Shortest Path Bridging IEEE 802.1aq[5]"},
      {"label":"0x88AB", "value":  "Ethernet Powerlink[来源请求]"},
      {"label":"0x88CC", "value":  "链路层发现协议 (LLDP)"},
      {"label":"0x88E1", "value":  "HomePlug AV MME[来源请求]"},
      {"label":"0x88E3", "value":  "Media Redundancy Protocol (IEC62439-2)"},
      {"label":"0x88E5", "value":  "MAC security (IEEE 802.1AE)"},
      {"label":"0x88E7", "value":  "Provider Backbone Bridges (PBB) (IEEE 802.1ah)"},
      {"label":"0x88F7", "value":  "Precision Time Protocol (PTP) over Ethernet (IEEE 1588)"},
      {"label":"0x8902", "value":  "IEEE 802.1ag Connectivity Fault Management (CFM) Protocol / ITU-T Recommendation Y.1731 (OAM)"},
      {"label":"0x8906", "value":  "Fibre Channel over Ethernet (FCoE)"},
      {"label":"0x8914", "value":  "FCoE Initialization Protocol"},
      {"label":"0x8915", "value":  "RDMA over Converged Ethernet (RoCE)"},
      {"label":"0x892F", "value":  "High-availability Seamless Redundancy (HSR)"},
      {"label":"0x9000", "value":  "Ethernet Configuration Testing Protocol[6]"},
      {"label":"0x9100", "value":  "VLAN-tagged (IEEE 802.1Q) frame with double tagging[7]"}];

    scope.showToolTip = ($event) => {
      this.di.$rootScope.$emit("show_tooltip",{event:$event, value: ethtype_tips});
    };

    scope.hideToolTip = ($event) => {
      this.di.$rootScope.$emit("hide_tooltip");
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


