/**
 * Created by wls on 2018/6/7.
 */

export class StaticRouteEstablishController {
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
    StaticRouteEstablishController.getDI().forEach((value, index) => {
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

    scope.staticRouteEsModel = {
      name :null,
      ip:null,
      nextHopGroup : null
    };

    scope.nexthopGroupDisplayLabel = {'options':[]}

    scope.showWizard = false;
    scope.title = this.translate('MODULES.LOGICAL.TENANT.STATICROUTE.ADD');
    scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/staticroute_establish'),
      }
    ];
    scope.isEdit = false;

    this.di.$scope.open = (tenant, routeName, staticRouteName) => {
      if(scope.showWizard) return;

      if(staticRouteName){
        scope.isEdit = true;
      } else {
        scope.isEdit = false;
      }

      scope.staticRouteEsModel = {
        name :null,
        ip:null,
        nextHopGroup : null
      };
      scope.nexthopGroupDisplayLabel = {'options':[]};

      scope.tenantName = tenant;
      scope.routeName = routeName;

      let nexthopDefer = this.di.$q.defer();
      let staticRouteDefer = this.di.$q.defer();
      let promises = [];
      let _nexthopGroups = [];
      let _staticRoute = null;

      this.di.logicalDataManager.getTenantLogicalNexthopGroup(tenant, routeName).then((res)=>{
        _nexthopGroups = res.data.nextHops;
        nexthopDefer.resolve();
      },(err)=>{
        nexthopDefer.reject(err)
      });
      promises.push(nexthopDefer.promise);

      if(scope.isEdit){
        this.di.logicalDataManager.getTenantLogicalStaticRouteByName(tenant, routeName, staticRouteName).then((res)=>{
          _staticRoute = res.data;
          staticRouteDefer.resolve();
        },(err)=>{
          staticRouteDefer.reject(err);
        });
        promises.push(staticRouteDefer.promise);
      }

      Promise.all(promises).then(()=>{
        _nexthopGroups.forEach((nexthop)=>{
          scope.nexthopGroupDisplayLabel.options.push({'label':nexthop.nexthop_group_name, 'value':nexthop.nexthop_group_name});
        });
        scope.staticRouteEsModel.nextHopGroup = scope.nexthopGroupDisplayLabel.options[0];

        if(scope.isEdit && _staticRoute.name){
          scope.staticRouteEsModel.name =  _staticRoute.name;
          scope.staticRouteEsModel.ip =  _staticRoute.dest + '/' + _staticRoute.prefix_len;
          // scope.staticRouteEsModel.nextHopGroup =  _staticRoute.nextHop;
          scope.nexthopGroupDisplayLabel.options.forEach((nexthop)=>{
            if(nexthop === _staticRoute.nexthop_group){
              scope.staticRouteEsModel.nextHopGroup = nexthop;
            }
          })
        }
        scope.showWizard = true;
        scope.$apply();
      })
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


    let getSubmitJson = ()=> {
      let ip_dict = scope.staticRouteEsModel.ip.split('/');
      return {
        'name': scope.staticRouteEsModel.name,
        'dest': ip_dict[0],
        'prefix_len': ip_dict[1],
        'nexthop_group': scope.staticRouteEsModel.nextHopGroup.value
      }
    }
    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      di.$rootScope.$emit('page_staticroute_es');
      if(!validCurrentDom('staticroute_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }
      let postJson = getSubmitJson();

      return new Promise((resolve, reject) => {
        logicalDataManager.postTenantLogicalStaticRoute(scope.tenantName, scope.routeName,postJson)
          .then((res) => {
            rootScope.$emit('staticroute-config-success');
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

    unsubscribes.push(this.di.$rootScope.$on('staticroute-wizard-show', ($event, tenant, routeName, staticRouteName) => {
      scope.open(tenant, routeName, staticRouteName);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

StaticRouteEstablishController.$inject = StaticRouteEstablishController.getDI();
StaticRouteEstablishController.$$ngIsClass = true;


