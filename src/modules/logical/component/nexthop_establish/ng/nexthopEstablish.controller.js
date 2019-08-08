/**
 * Created by wls on 2018/6/7.
 */

export class NexthopEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$log',
      '$q',
      '$timeout',
      '$filter',
      '_',
      'notificationService',
      'logicalDataManager',
      'manageDataManager',
      'deviceDataManager',
      'logicalService'
    ];
  }

  constructor(...args) {
    this.di = {};
    NexthopEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const logicalDataManager = this.di.logicalDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');
    scope.wizardHeight = {"height":'300px'};

    let di = this.di;

    scope.selected = {};
    scope.isTrunkEnable = false;

    scope.nexthopEsModel = {
      name :null,
      ip_addresses:[],
    };

    scope.nexthopGroupDisplayLabel = {'options':[]}

    scope.showWizard = false;
    scope.title = this.translate('MODULES.LOGICAL.TENANT.NEXTHOP.ADD');
    scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/nexthop_establish'),
      }
    ];
    scope.isEdit = false;

    this.di.$scope.open = (tenant, routeName, nexthopName) => {
      if(scope.showWizard) return;

      if(nexthopName){
        scope.isEdit = true;
      } else {
        scope.isEdit = false;
      }

      scope.nexthopEsModel = {
        name :null,
        ip_addresses: []
      };
      scope.nexthopGroupDisplayLabel = {'options':[]};

      scope.tenantName = tenant;
      scope.routeName = routeName;

      if(scope.isEdit){
        this.di.logicalDataManager.getTenantLogicalNexthopGroupByName(tenant, routeName, nexthopName).then((res)=>{
          let nexthop = res.data;
          if(nexthop.nexthop_group_name){
            scope.nexthopEsModel.name =  nexthop.nexthop_group_name;
            scope.nexthopEsModel.ip_addresses =  nexthop.ip_addresses;
          }
          scope.showWizard = true;
        },(err)=>{
          scope.showWizard = true;
        });
      } else {
        scope.showWizard = true;
      }

    };

    scope.addIPAddress = () => {
      let regexp = new RegExp(scope.ip_regex);

      if(!regexp.test(scope.nexthopEsModel.ip_address)
        || scope.nexthopEsModel.ip_addresses.indexOf(scope.nexthopEsModel.ip_address) > -1)
        return;

      scope.nexthopEsModel.ip_addresses.push(scope.nexthopEsModel.ip_address);
    }

    scope.removeSelectedIP = (ip) => {
      let index = scope.nexthopEsModel.ip_addresses.indexOf(ip);
      if(index > -1) {
        scope.nexthopEsModel.ip_addresses.splice(index, 1);
      }

      const length = scope.nexthopEsModel.ip_addresses.length;
      if(length == 0) {
        scope.nexthopEsModel.ip_address = '';
      } else {
        scope.nexthopEsModel.ip_address = scope.segmentModel.ip_addresses[length - 1];
      }
    }

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
        let invalidDoms = out[0].getElementsByClassName('mdc-text-field--invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }

    let translate = this.translate;


    let getSubmitJson = ()=> {
      return {
        "nexthop_group_name": scope.nexthopEsModel.name,
        "ip_addresses": scope.nexthopEsModel.ip_addresses
      }
    };

    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      di.$rootScope.$emit('page_nexthop_es');
      if(!validCurrentDom('nexthop_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }
      let postJson = getSubmitJson();

      return new Promise((resolve, reject) => {
        logicalDataManager.postTenantLogicalNexthopGroup(scope.tenantName, scope.routeName,postJson)
          .then((res) => {
            rootScope.$emit('nexthop-config-success');
            resolve(validJson);
          }, (error) => {
            inValidJson_Copy.errorMessage = error.data;
            resolve(inValidJson_Copy);
          });
      });
    };


    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    unsubscribes.push(this.di.$rootScope.$on('nexthop-wizard-show', ($event, tenant, routeName, nexthopName) => {
      scope.open(tenant, routeName, nexthopName);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

NexthopEstablishController.$inject = NexthopEstablishController.getDI();
NexthopEstablishController.$$ngIsClass = true;


