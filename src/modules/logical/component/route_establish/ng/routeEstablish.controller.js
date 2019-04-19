/**
 * Created by wls on 2018/6/7.
 */

export class RouteEstablishController {
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
    RouteEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const logicalDataManager = this.di.logicalDataManager;
    const rootScope = this.di.$rootScope;
    this.translate = this.di.$filter('translate');
    scope.wizardHeight = {"height":'200px'};

    let di = this.di;

    scope.selected = {};
    scope.isTrunkEnable = false;

    scope.routeEsModel = {
      name :null,
      curSegment:null,
      segments:[],
      segmentDisplayLabel : []
    };

    scope.showWizard = false;
    scope.title = this.translate('MODULES.LOGICAL.ROUTE.ADD');
    scope.steps = [
      {
        id: 'step1',
        title: 'info',
        content: require('../template/route_establish'),
      }
    ];
    scope.isEdit = false;

    this.di.$scope.open = (tenant, tenantType) => {
      if(scope.showWizard) return;

      scope.routeEsModel = {
        name :null,
        curSegment:null,
        segments:[],
        tenantRouters: [],
        segmentDisplayLabel : {options:[]},
        tenantRouterDisplayLabel: {options:[]}
      };

      scope.tenantName = tenant;
      scope.tenantType = tenantType;

      let segmentDefer = this.di.$q.defer();
      let routeDefer = this.di.$q.defer();
      let allrouteDefer = this.di.$q.defer();
      let promises = [];
      let _segments = [];
      let _router = [];
      let _allRouters = [];

      this.di.logicalDataManager.getTenantSegments(tenant).then((res)=>{
        _segments = res.data.tenantSegments;
        segmentDefer.resolve();
      },(err)=>{
        segmentDefer.reject(err)
      });
      promises.push(segmentDefer.promise);

      this.di.logicalDataManager.getLoigcalAllRoute().then((res)=>{
        _allRouters = res.data.routers;
        allrouteDefer.resolve();
      },(err)=>{
        allrouteDefer.reject(err)
      });
      promises.push(allrouteDefer.promise);

      this.di.logicalDataManager.getLoigcalRouteByTenant(tenant).then((res)=>{
        // _router = res.data.routers;
        //TODO wls 后期恢复成上面的数据获取方式
        let keys = this.di._.keys(res.data);
        if(keys.length > 0){
          _router =  res.data[keys[0]];
        }
        routeDefer.resolve();
      },(err)=>{
        routeDefer.reject(err);
      });
      promises.push(routeDefer.promise);

      Promise.all(promises).then(()=>{
        scope.routeEsModel.segmentDisplayLabel.options = [];
        scope.routeEsModel.tenantRouterDisplayLabel.options = [];
        _segments.forEach((segment)=>{
          if(segment.type === 'vlan')
            scope.routeEsModel.segmentDisplayLabel.options.push({'label':segment.name, 'value': segment.name})
        });

        _allRouters.forEach((router)=>{
          if(router.interfaces && Array.isArray(router.interfaces) && router.interfaces.length > 0){
            scope.routeEsModel.tenantRouterDisplayLabel.options.push({'label':router.tenant + '/' + router.name, 'value': router.tenant + '/' + router.name})
          }
        });

        if(_router.length > 0){
          scope.routeEsModel.name = _router[0].name;
          scope.routeEsModel.segments = _router[0].interfaces;
          this.di._.remove(scope.routeEsModel.segmentDisplayLabel.options, (item)=>{
              return this.di._.indexOf(scope.routeEsModel.segments, item.value) !== -1
          })
        }
        scope.routeEsModel.curSegment = scope.routeEsModel.segmentDisplayLabel.options[0];
        scope.routeEsModel.curTenantRouter = scope.routeEsModel.tenantRouterDisplayLabel.options[0];
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
        let invalidDoms = out[0].getElementsByClassName('mdc-text-field--invalid');
        if(invalidDoms && invalidDoms.length > 0){
          return false;
        }
      }
      return true;
    }

    let translate = this.translate;


    scope.addSegment = () =>{
      scope.routeEsModel.segments.push(scope.routeEsModel.curSegment.value);
      this.di._.remove(scope.routeEsModel.segmentDisplayLabel.options, (item)=>{
        return scope.routeEsModel.curSegment.value === item.value;
      });

      if(scope.routeEsModel.segmentDisplayLabel.options.length > 0)
        scope.routeEsModel.curSegment = scope.routeEsModel.segmentDisplayLabel.options[0];
    };

    scope.removeSelectedSegment = (segment) => {
      scope.routeEsModel.segmentDisplayLabel.options.push({'label':segment, 'value':segment});
      this.di._.remove(scope.routeEsModel.segments, (item)=>{
        return segment === item;
      });
      if(scope.routeEsModel.segmentDisplayLabel.options.length > 0)
        scope.routeEsModel.curSegment = scope.routeEsModel.segmentDisplayLabel.options[0];
    };


    scope.addTenantRouter = () =>{
      scope.routeEsModel.tenantRouters.push(scope.routeEsModel.curTenantRouter.value);
      this.di._.remove(scope.routeEsModel.tenantRouterDisplayLabel.options, (item)=>{
        return scope.routeEsModel.curTenantRouter.value === item.value;
      });

      if(scope.routeEsModel.tenantRouterDisplayLabel.options.length > 0)
        scope.routeEsModel.curTenantRouter = scope.routeEsModel.tenantRouterDisplayLabel.options[0];
    };

    scope.removeSelectedTenantRouter = (tenantRouter) => {
      scope.routeEsModel.tenantRouterDisplayLabel.options.push({'label':tenantRouter, 'value':tenantRouter});
      this.di._.remove(scope.routeEsModel.tenantRouters, (item)=>{
        return tenantRouter === item;
      });
      if(scope.routeEsModel.tenantRouterDisplayLabel.options.length > 0)
        scope.routeEsModel.curTenantRouter = scope.routeEsModel.tenantRouterDisplayLabel.options[0];
    };

    let getSubmitJson = ()=> {
      if(scope.tenantType === 'Normal'){
        return {
          'name': scope.routeEsModel.name,
          'interfaces': scope.routeEsModel.segments,
        }
      } else {
        return {
          'name': 'system',
          'tenant_routers': scope.routeEsModel.tenantRouters,
        }
      }

    };
    scope.submit = function() {
      let inValidJson_Copy = angular.copy(inValidJson);

      di.$rootScope.$emit('page_route_es');
      if(!validCurrentDom('route_establish')){
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      if(scope.tenantType === 'Normal' && scope.routeEsModel.segments.length === 0){
        return new Promise((resolve, reject) => {
          inValidJson_Copy.errorMessage = this.translate('MODULES.LOGICAL.ROUTER.SELECT_SEGEMNT');
          resolve(inValidJson_Copy);
        });
      }

      if(scope.tenantType === 'System' && scope.routeEsModel.tenantRouters.length === 0){
        return new Promise((resolve, reject) => {
          inValidJson_Copy.errorMessage = this.translate('MODULES.LOGICAL.ROUTER.SELECT_ROUTER');
          resolve(inValidJson_Copy);
        });
      }


      let postJson = getSubmitJson();


      return new Promise((resolve, reject) => {

        logicalDataManager.postLoigcalRouteByTenant(scope.tenantName, postJson)
          .then((res) => {
            rootScope.$emit('route-config-success');
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

    unsubscribes.push(this.di.$rootScope.$on('route-wizard-show', ($event, tenant, tenantType) => {
      scope.open(tenant, tenantType);
    }));

    this.di.$scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
}

RouteEstablishController.$inject = RouteEstablishController.getDI();
RouteEstablishController.$$ngIsClass = true;


