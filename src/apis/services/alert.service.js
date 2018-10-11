/**
 * Created by wls on 2018/7/17.
 */
export class alertService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    alertService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }


  getRuleResource(trans){
    let res = "";
    if(trans ===  this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.CPU')){
      res = "cpu";
    } else if(trans === this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.MEM')){
      res = "ram";
    } else if(trans === this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.DISK')){
      res = "disk";
    } else if(trans === this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.RX')){
      res = "port";
    } else if(trans === this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.TX')){
      res = "port";
    }
    return res;
  }

  getRuleObject(trans){
    let obj = "";
    if(trans === this.translate('MODULES.ALERT.HEALTHY_CHECK.OBJECT.SWITCH')){
      obj = "switch";
    } else if(trans ===  this.translate('MODULES.ALERT.HEALTHY_CHECK.OBJECT.CONTROLLER')){
      obj = "controller";
    }
    return obj;
  }

  getRuleTypeTranslate(type) {
    let tran = "";
    if(type === 'cpu_utilization'){
      tran = this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.CPU');
    } else if(type === 'ram_used_ratio'){
      tran = this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.MEM');
    } else if(type === 'disk_root_used_ratio'){
      tran = this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.DISK');
    } else if(type === 'rx_util'){
      tran = this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.RX');
    } else if(type === 'tx_util'){
      tran = this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.TX');
    }
    return tran;
  }

  getRuleCommonQuery(rule){
    let res = {};
    if(rule.query){
      res['condition'] = rule.query[0].condition;
      res['continue'] = rule.query[0].continue;
      if(rule.query[0].util){
        res['value'] = rule.query[0].util;
      } else if(rule.query[0].used_ratio){
        res['value'] = rule.query[0].used_ratio;
      } else if(rule.query[0].root_used_ratio){
        res['value'] = rule.query[0].root_used_ratio;
      }
    } else if(rule.query_rx){
      res['condition'] = rule.query_rx[0].condition;
      res['continue'] = rule.query_rx[0].continue;
      res['value'] = rule.query_rx[0].rx_util;
    } else if(rule.query_tx){
      res['condition'] = rule.query_tx[0].condition;
      res['continue'] = rule.query_tx[0].continue;
      res['value'] = rule.query_tx[0].tx_util;
    }
    return res;
  }


   getDescriptionTranslate(query) {
    let trans = "";
    let type = query.type;
    let pre = query.condition ==='gt'?this.translate('MODULES.ALERT.HEALTHY_CHECK.CONDITION.GT'):this.translate('MODULES.ALERT.HEALTHY_CHECK.CONDITION.LT');
    let middle = '';
    if(type === 'cpu_utilization'){
     middle = "%";
    } else if(type === 'ram_used_ratio'){
     middle = "%";
    } else if(type === 'disk_root_used_ratio'){
     middle = "%";
    } else if(type === 'rx_util'){
     middle = "Mbps";
    } else if(type === 'tx_util'){
     middle = "Mbps";
    }
     middle += this.translate('MODULES.ALERT.HEALTHY_CHECK.CONDITION.CONTINUE');

    let last = this.translate('MODULES.ALERT.HEALTHY_CHECK.CONDITION.SECOND');
    // if(type === 'cpu_utilization'){
    //   trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    // } else if(type === 'ram_used_ratio'){
    //   trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    // } else if(type === 'disk_root_used_ratio'){
    //   trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    // } else if(type === 'rx_util'){
    //   trans = (query.condition ==='gt'?"超过":"低于") + query.value + "Mbps持续"+ query.continue + '秒';
    // } else if(type === 'tx_util'){
    //   trans = (query.condition ==='gt'?"超过":"低于") + query.value + "Mbps持续"+ query.continue + '秒';
    // }
    return pre + query.value + middle + query.continue + last;
  }

  getAlertTableSchema(){
    return [
      {
        'label': this.translate('MODULES.ALERT.HISTORY.RULE_NAME'),
        'field': 'name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.ALERT_LEVEL'),
        'field': 'alert_level',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.RECEIVE_GROUP'),
        'field': 'receive_group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.FROM'),
        'field': 'from',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HISTORY.MSG'),
        'field': 'msg',
        'layout': {'visible': true, 'sortable': true,}
      }
    ];
  }


  getInformTabSchema() {
    return [
      {
        'label': this.translate('MODULES.ALERT.INFORM.TAB.RECEIVE_GROUP'),
        'value': 'receive_group',
        'type': 'receive_group'
      },
      {
        'label': this.translate('MODULES.ALERT.INFORM.TAB.SERVER_CONFIG'),
        'value': 'server_config',
        'type': 'server_config'
      }
    ];
  }

  getReceiveGroupTabSchema() {
    return [
      {
        'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.WECHAT'),
        'value': 'wechat',
        'type': 'wechat'
      },
      {
        'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.EMAIL'),
        'value': 'email',
        'type': 'email'
      }
    ];
  }



  getReceiveGroupTableSchema(){
    return [
      {
        'label': this.translate("MODULES.ALERT.INFORM.RGTABLE.GROUP_NAME"),
        'field': 'group_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate("MODULES.ALERT.INFORM.RGTABLE.EMAIL_GROUP"),
        'field': 'email_group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate("MODULES.ALERT.INFORM.RGTABLE.WECHAT_GROUP"),
        'field': 'wechat_group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }


  getHealthyCheckTableSchema(){
    return [
      {
        'label': this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.RULE_NAME'),
        'field': 'rule_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.OBJECT'),
        'field': 'from',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.STATUS'),
        'field': 'status',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.ALERT_LEVEL'),
        'field': 'alert_level',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.RECEIVE_GROUP'),
        'field': 'receive_group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.TYPE'),
        'field': 'type',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.DESCRIPTION'),
        'field': 'description',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      }
    ];
  }


  getWechatTableSchema() {
    return [
      {
        'title': this.translate('MODULES.ALERT.RECEIVE_GROUP.WECHAT.DEPARTMENT'),
        'field': 'department',
        'sortable': "department",
        'show': true
      },
      {
        'title': this.translate('MODULES.ALERT.RECEIVE_GROUP.WECHAT.AGENTID'),
        'field': 'agentId',
        'sortable': "agentId",
        'show': true
      },
      {
        'title': this.translate('MODULES.ALERT.RECEIVE_GROUP.WECHAT.SECRET'),
        'field': 'agent_corpsecret',
        'sortable': "agent_corpsecret",
        'show': true
      }
    ]
  }

  getEmailTableSchema() {
    return [
      {
        'title': this.translate('MODULES.ALERT.RECEIVE_GROUP.EMAIL.NAME'),
        'field': 'name',
        'sortable': "name",
        'show': true
      },
      {
        'title': this.translate('MODULES.ALERT.RECEIVE_GROUP.EMAIL.ADDRESS'),
        'field': 'email',
        'sortable': "email",
        'show': true
      }
    ]
  }


  getHcObjectDisLabel(){
    return {options: [{label: '交换机', value: 'switch'}, {label: '控制器', value: 'controller'}]}
  }

  getHcTypeSwtDisLabel(){
    return {
      options: [
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.CPU'), value: 'cpu'},
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.MEM'), value: 'ram'},
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.DISK'), value: 'disk'},
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.RX'), value: 'rx'},
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.TX'), value: 'tx'}
      ]
    }
  }

  getHcTypeCtrlDisLabel(){
    return {
      options: [
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.CPU'), value: 'cpu'},
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.MEM'), value: 'ram'},
        {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.DISK'), value: 'disk'},
      ]
    }
  }

  getHcLevelDisLabel(){
    return {options: [
              {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.LEVEL.HIGHT'), value: 1},
              {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.LEVEL.LOW'), value: 0}
            ]}
  }

  getHcConditionDisLabel(){
    return {options: [
              {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.QUERY.GT'), value: 'gt'} ,
              {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.QUERY.LT'), value: 'lt'}]}
  }

  getHcStatusDisLabel(){
    return {on: this.translate('MODULES.ALERT.HEALTHY_CHECK.STATUS.ENABLED'), off: this.translate('MODULES.ALERT.HEALTHY_CHECK.STATUS.DISABLED')}
  }


}


alertService.$inject = alertService.getDI();
alertService.$$ngIsClass = true;