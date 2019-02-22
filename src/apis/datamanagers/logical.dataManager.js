/**
 * Created by wls on 2018/8/7.
 */
export class LogicalDataManager{

  static getDI(){
    return [
      '$q',
      '$http',
      'appService',
      '$log'
    ];
  }

  constructor(...args){
    this.di = {};
    LogicalDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getTenants(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.resolve({'data': {'tenants': []}});
      }
    );
    return defer.promise;
  }


  postTenant(param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getTenantUrl(), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteTenant(name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantDeleteUrl(name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
  
  getSegment(tenant, segment){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getSegmentUrl(tenant, segment)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }
  
  
  getSegments(params, tenant){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getSegmentUrl(tenant), {params: params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.resolve({data: {segments: []}, count: 0});
      }
    );
    return defer.promise;
  }
  
  
  postSegment(tenant, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getSegmentUrl(tenant), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }
  
  deleteSegment(tenant, segment){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getSegmentUrl(tenant, segment)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.message);
      }
    );
    return defer.promise;
  }

  getTenantSegments(tenantName) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantSegmentUrl(tenantName)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.resolve({'data': {'tenantSegments': []}});
      }
    );
    return defer.promise;
  }


  postTenantSegmentMemberVlan(tenant_name, segment_name, device_name, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getTenantSegmentMemberVlanURl(tenant_name, segment_name, device_name), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteTenantSegmentMemberVlan(tenant_name, segment_name, device_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantSegmentMemberVlanRemoveURl(tenant_name, segment_name, device_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getSegmentVlanMember(tenantName, segmentName) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getSegmentVlanMemberUrl(tenantName, segmentName)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'segment_members': []}});
      }
    );
    return defer.promise;
  }

  getSegmentVxlanMember(tenantName, segmentName) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getSegmentVxlanMemberUrl(tenantName, segmentName)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {}});
      }
    );
    return defer.promise;
  }
  
  getTenantSegmentMemberVlan(tenant_name, segment_name, device_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantSegmentMemberVlanURl(tenant_name, segment_name, device_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }
  
  getTenantSegmentMemberVxlan(tenant_name, segment_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantSegmentMemberVxlanURl(tenant_name, segment_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  postTenantSegmentMemberVxlan(tenant_name, segment_name, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getTenantSegmentMemberVxlanURl(tenant_name, segment_name), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteTenantSegmentMemberVxlanAccess(tenant_name, segment_name, member_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantSegmentMemberVxlanAccessRemoveURl(tenant_name, segment_name, member_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteTenantSegmentMemberVxlanNetwork(tenant_name, segment_name, member_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantSegmentMemberVxlanNetworkRemoveURl(tenant_name, segment_name, member_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getTenantSingleSegment(tenant_name, segment_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantSingleSegmentUrl(tenant_name, segment_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getTenantPortUntagList(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantSegmentPvid()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  getCosList(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getCosListUrl()).then(
      (res) => {
        defer.resolve(res.data.cos);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getEcnList(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getEcnListUrl()).then(
      (res) => {
        defer.resolve(res.data.ecn);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  postCOS(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getCosListUrl(), params).then(
      (res) => {
        defer.resolve(null);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  postECN(params) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getEcnListUrl(), params).then(
      (res) => {
        defer.resolve(null);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  getEGPGroupList() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getEGPGroupUrl()).then(
      (res) => {
        defer.resolve(res.data.groups);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getEGPPolicyList() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getEGPPolicyUrl()).then(
      (res) => {
        defer.resolve(res.data.policies);
      },
      (error) => {
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  createEGPGroup(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getEGPGroupUrl(), params).then(
      (res) => {
        defer.resolve(null);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  createEGPPolicy(params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getEGPPolicyUrl(), params).then(
      (res) => {
        defer.resolve(null);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  deleteEGPGroup(group_name) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteEGPGroupUrl(group_name)).then(
      (res) => {
        defer.resolve(null);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  deleteEGPPolicy(policy_name) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDeleteEGPPolicyUrl(policy_name)).then(
      (res) => {
        defer.resolve(null);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;
  }

  getEGPPolicyDetail(policy_name) {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getEGPPolicyDetailUrl(policy_name)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.resolve(null);
      }
    );
    return defer.promise;
  }

  getLoigcalRouteByTenant(tenant_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantLogicalRouteUrl(tenant_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  postLoigcalRouteByTenant(tenant_name, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getTenantLogicalRouteUrl(tenant_name), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteLoigcalRouteByTenant(tenant_name, route_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantLogicalRouteDeleteUrl(tenant_name, route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getTenantLogicalPolicyRoute(tenant_name, route_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantLogicalPolicyRouteUrl(tenant_name, route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getTenantLogicalPolicyRouteByName(tenant_name, route_name, policy_route_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantLogicalPolicyRouteWithNameUrl(tenant_name, route_name, policy_route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  postTenantLogicalPolicyRoute(tenant_name, route_name, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getTenantLogicalPolicyRouteUrl(tenant_name, route_name), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteTenantLogicalPolicyRoute(tenant_name, route_name, policy_route_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantLogicalPolicyRouteWithNameUrl(tenant_name, route_name, policy_route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  getTenantLogicalStaticRoute(tenant_name, route_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantLogicalStaticRouteUrl(tenant_name, route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  getTenantLogicalStaticRouteByName(tenant_name, route_name, static_route_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantLogicalStaticRouteWithNameUrl(tenant_name, route_name, static_route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  postTenantLogicalStaticRoute(tenant_name, route_name, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getTenantLogicalStaticRouteUrl(tenant_name, route_name), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteTenantLogicalStaticRoute(tenant_name, route_name, static_route_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantLogicalStaticRouteWithNameUrl(tenant_name, route_name, static_route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  getTenantLogicalNexthopGroup(tenant_name, route_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantLogicalNexthopUrl(tenant_name, route_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getTenantLogicalNexthopGroupByName(tenant_name, route_name, nexthopGroupName){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getTenantLogicalNexthopWithNameUrl(tenant_name, route_name, nexthopGroupName)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  postTenantLogicalNexthopGroup(tenant_name, route_name, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getTenantLogicalNexthopUrl(tenant_name, route_name), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteTenantLogicalNexthopGroup(tenant_name, route_name, nexthop_group_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getTenantLogicalNexthopWithNameUrl(tenant_name, route_name, nexthop_group_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

}

LogicalDataManager.$inject = LogicalDataManager.getDI();
LogicalDataManager.$$ngIsClass = true;