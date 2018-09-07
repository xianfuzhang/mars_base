/**
 * Created by wls on 2018/6/7.
 */
import {MDCRipple} from '@material/ripple';

export class ReceiveGroupEstablishController {
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
    ReceiveGroupEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const deviceDataManager = this.di.deviceDataManager;
    const rootScope = this.di.$rootScope;

    this.di.$scope.mac_regex = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';  // MAC Address regex for validation
    this.di.$scope.ip_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    this.di.$scope.num_regex = '^\d$|^[1-9]+[0-9]*$';

    scope.groupName = "";

    scope.showWizard = false;
    scope.title = '添加接收群组';
    scope.steps = [
      {
        id: 'step1',
        title: 'Common',
        content: require('../template/add_receive_group'),
      }
    ];


    let di = this.di;

    // setTimeout(function () {
      // scope.groupTabSelected = null;
      // scope.groupTab = di.alertService.getInformTabSchema();
      //
      // scope.groupTabSelected = scope.groupTab[0];
    // })


    scope.addedReceiverModel = [];

    // scope.addedReceiverModel = [{'type':'wechat', 'name':'侧同事', 'agentId':'dasdfa-asdf-adsf', 'secret':'dasdfasdf'},
    //                         {'type':'email', 'name':'邮箱111', 'email':'dasdfa@asdf-adsf'}]

    scope.removeReceiver = (rec) =>{
      let index = scope.addedReceiverModel.indexOf(rec);
      scope.addedReceiverModel.splice(index, 1);
    };

    scope.addEmailReceiver = () =>{
      scope.addedReceiverModel.push({'type':'email', 'name':'','email':''})
    };

    scope.addWechatReceiver = () =>{
      scope.addedReceiverModel.push({'type':'wechat', 'name':'', 'agentId':'', 'secret':''})
    };

    scope.onGroupTabChange= (tab) => {
      if (tab){
        scope.groupTabSelected = tab;
        // this.prepareTableData();
        // this.init(scope.tabSelected);
      }
    };


    this.di.$scope.open = function(groupName){
      if(scope.showWizard) return;
      clearAll();
      if(groupName)
        di.alertDataManager.getReceiveGroup(groupName).then(
          (res)=>{
            scope.groupName =  res.name;
            let wechat = res.receive.wechat;
            let email = res.receive.email;
            if(email instanceof Array && email.length >0){
              di._.forEach(email, (item)=>{
                scope.addedReceiverModel.push({'type':'email', 'name':item.name, 'email':item.email})
              })
            }

            if(wechat instanceof Array && wechat.length >0){
              di._.forEach(wechat, (item)=>{
                scope.addedReceiverModel.push({'type':'wechat', 'name':item.department, 'agentId':item.agentId, 'secret':item.agent_corpsecret})
              })
            }
          }
        )

      scope.showWizard = true;
        // scope.$apply();
    };

    function clearAll() {
      scope.groupName = "";
      scope.addedReceiverModel = [];

    }
    
    this.di.$scope.cancel = function(formData){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    this.di.$scope.submit = function() {
      let params = {
        name: scope.groupName,
        receive:{
          'wechat':[],
          'email':[]
        }
      };
      for(let index=0; index < scope.addedReceiverModel.length; index++){
        let rec = scope.addedReceiverModel[index];
        let item = {};
        if(rec.type === 'email'){
          item.name = rec.name;
          item.email = rec.email;
          params.receive.email.push(item);
        } else if(rec.type === 'wechat'){
          item.department = rec.name;
          item.agentId = rec.agentId;
          item.agent_corpsecret = rec.secret;
          params.receive.email.push(item);
        } else {
          console.error("Unknown receive group type : " + rec.type)
        }
      }

      console.log(params);

      return new Promise((resolve, reject) => {
        di.alertDataManager.addReceiveGroup(params)
          .then(() => {
            rootScope.$emit('receivegroup-refresh');
            resolve(true);
          }, () => {
            resolve(false);
          });
      });
    };


    unsubscribes.push(this.di.$rootScope.$on('receivegroup-wizard-show', ($event, groupName) => {
      scope.open(groupName);
    }));


    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

ReceiveGroupEstablishController.$inject = ReceiveGroupEstablishController.getDI();
ReceiveGroupEstablishController.$$ngIsClass = true;


