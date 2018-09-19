/**
 * Created by wls on 2018/8/7.
 */
export class DashboardDataManager{

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
    DashboardDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getCluster(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getClusterUrl()).then(
      (res) => {
        defer.resolve(res['data']['nodes']);
      },
      (error) => {
        this.di.$log.error(error);
        defer.resolve([]);
      }
    );
    return defer.promise;
  }

  getClusterStatistic(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getStatisticOfController()).then(
      (res) => {
        defer.resolve(res['data']);
      },
      (error) => {
        this.di.$log.error(error);
        defer.resolve([]);
      }
    );
    return defer.promise;
  }
}

DashboardDataManager.$inject = DashboardDataManager.getDI();
DashboardDataManager.$$ngIsClass = true;