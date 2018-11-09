/**
 * Created by wls on 2018/8/7.
 */
export class ManageDataManager{

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
    ManageDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getDHCP(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDhcpUrl()).then(
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


  postDHCP(param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDhcpPostUrl(), param).then(
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

  deleteDHCP(){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDhcpUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve(error);
      }
    );
    return defer.promise;
  }

  getElasticsearchDataByIndexAndQuery(index, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getElasticsearchDataIndexUrl(index), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve(error);
      }
    );
    return defer.promise;
  }
  
  getElasticsearcStatus() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getElasticsearchStatusUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({data: {indices: [], nodes:[], snapshots:[]}});
      }
    );
    return defer.promise;
  }
  
  deleteElasticsearcIndexByTime(index, params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getElasticsearchDeleteIndexUrl(index), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
  
  putBackupElasticsearch(filename) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getElasticsearchBackupUrl(filename)).then(
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

ManageDataManager.$inject = ManageDataManager.getDI();
ManageDataManager.$$ngIsClass = true;