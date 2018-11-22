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
        defer.resolve(null);
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
        defer.resolve(error);
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
        defer.resolve(error);
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
        defer.resolve(error);
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
        defer.resolve(error);
      }
    );
    return defer.promise;
  }



}

LogicalDataManager.$inject = LogicalDataManager.getDI();
LogicalDataManager.$$ngIsClass = true;