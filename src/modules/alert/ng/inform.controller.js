import
{MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';
export class InformController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$filter',
      '$q',
      '$log',
      '$uibModal',
      'appService',
      'tableProviderFactory',
      'alertDataManager',
      'dialogService',
      'alertService'
    ];
  }

  constructor(...args) {
    this.di = {};
    InformController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');

    scope.tabSelected = null;
    scope.tabs = this.di.alertService.getInformTabSchema();

    let email_server_component = {};
    let wechat_server_component = {};

    scope.informModel = {
      receiveGroupTb:{
        actionsShow:{'menu': false, 'add': true, 'remove': false, 'refresh': true, 'search': false},
        rowActions:[
          {
            'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.EDIT'),
            'value': 'edit'
          },
          {
            'label': this.translate('MODULES.ALERT.RECEIVE_GROUP.DELETE'),
            'value': 'delete'
          }

        ],
        informTableProvider:null,
        informAPI: "",
      },
      emailSchema: this.di.alertService.getEmailTableSchema(),
      wechatSchema: this.di.alertService.getWechatTableSchema(),
      groups: [],
      groupDetails:null
    };

    scope.onTabChange= (tab) => {
      if (tab){
        scope.tabSelected = tab;
        if(tab.value === 'server_config'){
          //这边如果不用timeout 则会显示不全
          setTimeout(initServerConfig);
        }
      }
    };

    scope.onRGTableRowSelectAction = (event) => {
      if (event.data && event.action) {
        if (event.action.value === 'delete') {
          // this.confirmDialog(this.translate('MODULES.ALERT.RECEIVE_GROUP.REMOVE_GROUP'))
          this.di.dialogService.createDialog('warning', this.translate('MODULES.ALERT.RECEIVE_GROUP.REMOVE_GROUP'))
            .then((data) =>{
              this.di.alertDataManager.deleteReceiveGroup(event.data.group_name)
                .then((res) =>{
                  scope.informModel.receiveGroupTb.informAPI.queryUpdate();
                });
            }, (res) =>{
              this.di.$log.debug('delete receive group dialog cancel');
            });
        } else if(event.action.value === 'edit') {
          this.di.$rootScope.$emit('receivegroup-wizard-show',event.data.group_name);
        }
      }
    };

    scope.onTableRowClick = (event) => {
      if (event.$data){
        scope.informModel.groupDetails = null;


        scope.informModel.receiveGroupTb.informAPI.setSelectedRow(event.$data.group_name);
        let group = this.di._.find(scope.informModel.groups, {'name': event.$data.group_name});

        setTimeout(function () {
          scope.informModel.groupDetails = group;
          scope.$apply();
        })

        // scope.$apply();

      }
    };

    scope.onInformAPIReady = ($api) => {
      scope.informModel.receiveGroupTb.informAPI = $api;
    };

    scope.saveServerConfig = () =>{
      let param = getServerConfigFromComponent();
      if(validateServerConfig(param)){
        this.di.alertDataManager.setAlertGroupBasicConfig(param)
          .then((res) => {

          },(error) => {

          });
      }
    };

    scope.clearServerConfig = () =>{
      this.di.alertDataManager.deleteAlertGroupBasicConfig()
        .then((res) => {
          clearServerConfig();
        }, () => {
          clearServerConfig();
        });
    };

    let validateServerConfig = (param) => {
      let email = param.smtp;
      // this.di._.forEach(email, (item)=>{
      //   if(email[item] === ''){
      //     console.log("Email Log is not valid")
      //   }
      // });
      //
      // let wechat = param.wechat;
      // this.di._.forEach(wechat, (item)=>{
      //   if(wechat[item] === ''){
      //     console.log("微信配置不完整")
      //   }
      // })

      //TODO 弹框提示

      return true;//or false

    };

    function clearServerConfig(){
      email_server_component.user.value = "";
      email_server_component.passwd.value = "";
      email_server_component.port.value = "";
      email_server_component.domain.value = "";

      wechat_server_component.domain.value = "";
      wechat_server_component.tokenUrl.value = "";
      wechat_server_component.sendUrl.value = "";
      wechat_server_component.corpId.value = "";
    }

    function getServerConfigFromComponent(){
      let emailConfig = {};
      emailConfig.smtp_host = email_server_component.domain.value;
      emailConfig.smtp_port = email_server_component.port.value;
      emailConfig.smtp_ssl = false;
      emailConfig.user = email_server_component.user.value;
      emailConfig.password = email_server_component.passwd.value;

      let wechatConfig = {};
      wechatConfig.host = wechat_server_component.domain.value;
      wechatConfig.token_url = wechat_server_component.tokenUrl.value;
      wechatConfig.send_url = wechat_server_component.sendUrl.value;
      wechatConfig.corpid = wechat_server_component.corpId.value;
      return {'wechat' : wechatConfig, 'smtp': emailConfig}
    }


    scope.addReceiveGroup = () =>{
      this.di.$rootScope.$emit('receivegroup-wizard-show');
    };

    // scope.batchRemove = ($value) => {
    //   if ($value.length) {
    //     this.confirmDialog(this.translate('MODULES.ALERT.DIALOG.CONTENT.REMOVE_ALERT_HISTORIES'))
    //       .then((data) =>{
    //         this.batchDeleteAlertHistory($value);
    //       }, (res) =>{
    //         this.di.$log.debug('delete user account dialog cancel');
    //       });
    //   }
    // };

    unSubscribers.push(this.di.$rootScope.$on("receivegroup-refresh",()=>{
      scope.informModel.receiveGroupTb.informAPI.queryUpdate();
    }));

    scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });

    function formatTbGroups(groups) {
      let res = [];
      for(let i = 0; i< groups.length; i++){
        let g = {};
        g['group_name'] = groups[i].name;
        g['email_group'] = "";
        for(let j = 0 ; j < groups[i].receive.email.length;j++){
          g['email_group'] += groups[i].receive.email[j].name;
          g['email_group'] += " ";
        }

        g['wechat_group'] = "";
        for(let j = 0 ; j < groups[i].receive.wechat.length;j++){
          g['wechat_group'] += groups[i].receive.wechat[j].department;
          g['wechat_group'] += " ";
        }
        res.push(g);
      }
      return res;

    }

    scope.informModel.receiveGroupTb.informTableProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.di.alertDataManager.getAllReceiveGroup().then((res) => {

          //取消选中
          scope.informModel.groupDetails = null;
          if(scope.informModel.receiveGroupTb.informAPI){
            scope.informModel.receiveGroupTb.informAPI.setSelectedRow();
          }

          if(res === null){
            scope.informModel.groups = [];

            defer.resolve({
              data: [],
              count: undefined
            });
          } else {
            scope.informModel.groups = res.groups;
            let groups = formatTbGroups(res.groups);

            defer.resolve({
              data: groups,
              count: res.count
            });
          }
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.alertService.getReceiveGroupTableSchema(),
          index_name: 'group_name',
          rowCheckboxSupport: true,
          rowActionsSupport: true
        };
      }
    });



    let innerModel = {};
    let DI = this.di;
    let init =() =>{
      let scope = this.di.$scope;
      scope.tabSelected = scope.tabs[0];

      email_server_component = {
        'domain': new MDCTextField(document.querySelector('#email_domain_component')),
        'port': new MDCTextField(document.querySelector('#email_port_component')),
        'user': new MDCTextField(document.querySelector('#email_user_component')),
        'passwd': new MDCTextField(document.querySelector('#email_passwd_component')),
        // 'sender': new MDCTextField(document.querySelector('#sender_component'))
      };

      wechat_server_component = {
        'domain': new MDCTextField(document.querySelector('#wechat_domain_component')),
        'tokenUrl': new MDCTextField(document.querySelector('#wechat_token_url_component')),
        'sendUrl': new MDCTextField(document.querySelector('#wechat_send_url_component')),
        'corpId': new MDCTextField(document.querySelector('#corp_id_component'))
      };

      // let promises = [];
      // let serverConfigDefer = this.di.$q.defer(),
      //   receiveGroupDefer = this.di.$q.defer();
      this.di.alertDataManager.getAlertGroupBasicConfig().then((res)=>{
        innerModel['server_config'] = res;
        // setTimeout(function () {
        //   DI.$rootScope.$emit('stop_loading');
        // },1000);
        DI.$rootScope.$emit('stop_loading');
        // initServerConfig();

        // serverConfigDefer.resolve();
      });
      // promises.push(serverConfigDefer.promise);
      // promises.push(receiveGroupDefer.promise);

      // this.di.$rootScope.$emit('start_loading');

      // Promise.all(promises).then(()=>{
      //   setTimeout(function () {
      //     initServerConfig();
      //     // initReceiveGroups();
      //     DI.$scope.$apply();
      //     DI.$rootScope.$emit('stop_loading');
      //   },2000)
      // });
    };

    let initServerConfig = ()=>{
      let emailConfig = innerModel.server_config.smtp||{};
      email_server_component.domain.value = emailConfig.smtp_host?emailConfig.smtp_host:"";
      email_server_component.port.value = emailConfig.smtp_port?emailConfig.smtp_port:"";
      email_server_component.user.value = emailConfig.user?emailConfig.user:"";
      email_server_component.passwd.value = emailConfig.password?emailConfig.password:"";

      let wechatConfig = innerModel.server_config.wechat||{};
      wechat_server_component.domain.value = wechatConfig.host?wechatConfig.host:"";
      wechat_server_component.tokenUrl.value = wechatConfig.token_url?wechatConfig.token_url:"";
      wechat_server_component.sendUrl.value = wechatConfig.send_url?wechatConfig.send_url:"";
      wechat_server_component.corpId.value = wechatConfig.corpid?wechatConfig.corpid:"";
    };

    let initReceiveGroups = ()=>{

    };

    setTimeout(init)

  }


}

InformController.$inject = InformController.getDI();
InformController.$$ngIsClass = true;