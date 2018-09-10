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
    if(trans === 'CPU使用率'){
      res = "cpu";
    } else if(trans === '内存使用率'){
      res = "ram";
    } else if(trans === '硬盘使用率'){
      res = "disk";
    } else if(trans === '下载速率'){
      res = "port";
    } else if(trans === '上传速率'){
      res = "port";
    }
    return res;
  }

  getRuleObject(trans){
    let obj = "";
    if(trans === '交换机'){
      obj = "switch";
    } else if(trans === '控制器'){
      obj = "controller";
    }
    return obj;
  }

  getRuleTypeTranslate(type) {
    let tran = "";
    if(type === 'cpu_utilization'){
      tran = "CPU使用率";
    } else if(type === 'ram_used_ratio'){
      tran = "内存使用率";
    } else if(type === 'disk_root_used_ratio'){
      tran = "硬盘使用率";
    } else if(type === 'rx_util'){
      tran = "下载速率";
    } else if(type === 'tx_util'){
      tran = "上传速率";
    }
    return tran;
  }

  getRuleCommonQuery(rule){
    let res = {};
    if(rule.query){
      res['condition'] = rule.query.condition;
      res['continue'] = rule.query.continue;
      if(rule.query.util){
        res['value'] = rule.query.util;
      } else if(rule.query.used_ratio){
        res['value'] = rule.query.used_ratio;
      } else if(rule.query.root_used_ratio){
        res['value'] = rule.query.root_used_ratio;
      }
    } else if(rule.query_rx){
      res['condition'] = rule.query_rx.condition;
      res['continue'] = rule.query_rx.continue;
      res['value'] = rule.query_rx.rx_util;
    } else if(rule.query_tx){
      res['condition'] = rule.query_tx.condition;
      res['continue'] = rule.query_tx.continue;
      res['value'] = rule.query_tx.tx_util;
    }
    return res;
  }


   getDescriptionTranslate(query, type) {
    let trans = "";
    if(type === 'cpu_utilization'){
      trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    } else if(type === 'ram_used_ratio'){
      trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    } else if(type === 'disk_root_used_ratio'){
      trans = (query.condition ==='gt'?"超过":"低于") + query.value + "%持续"+ query.continue + '秒';
    } else if(type === 'rx_util'){
      trans = (query.condition ==='gt'?"超过":"低于") + query.value + "Mbps持续"+ query.continue + '秒';
    } else if(type === 'tx_util'){
      trans = (query.condition ==='gt'?"超过":"低于") + query.value + "Mbps持续"+ query.continue + '秒';
    }
    return trans;
  }

  getAlertTableSchema(){
    return [
      {
        'label': this.translate('MODULES.ALERT.HISTORY.RULE_NAME'),
        'field': 'rule_name',
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
        'label': "规则名",
        'field': 'rule_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': "对象",
        'field': 'from',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': "状态",
        'field': 'status',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': "级别",
        'field': 'alert_level',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': "接收群组",
        'field': 'receive_group',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': "类型",
        'field': 'type',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': "描述",
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
        {label: 'CPU', value: 'cpu'},
        {label: '内存', value: 'ram'},
        {label: '硬盘', value: 'disk'},
        {label: '下载速率', value: 'rx'},
        {label: '上传速率', value: 'tx'}
      ]
    }
  }

  getHcTypeCtrlDisLabel(){
    return {
      options: [
        {label: 'CPU', value: 'cpu'},
        {label: '内存', value: 'ram'},
        {label: '硬盘', value: 'disk'},
      ]
    }
  }

  getHcLevelDisLabel(){
    return {options: [{label: '高', value: 1}, {label: '低', value: 0}]}
  }

  getHcConditionDisLabel(){
    return {options: [{label: '小于', value: 'lt'},{label: '大于', value: 'gt'}]}
  }

  getHcStatusDisLabel(){
    return {on: '开', off: '关'}
  }


}


alertService.$inject = alertService.getDI();
alertService.$$ngIsClass = true;