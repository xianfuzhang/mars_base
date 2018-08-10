/**
 * Created by wls on 2018/8/7.
 */
export class AlertDataManager{

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
    AlertDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  deleteAlertHistory(uuid){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getAlertHistoryRemoveUrl(uuid)).then(
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


  deleteAlertHistoriesSelected(uuids){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getAlertHistoriesSelectedRemoveUrl(), {'uuids': uuids}).then(
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

  deleteAlertHistoryAll(){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getAlertHistoriesRemoveAllUrl()).then(
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

  getAlertHistories(param){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getAlertHistoryUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.resolve({'data': {'history': [], 'total': 0}});
      }
    );
    return defer.promise;
  }

  getTestAlertHistory(){
    return {
      "history": [
        {
          "alert_level": 1,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule ram1",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xx4xx-xxxx"
        },
        {
          "alert_level": 2,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule ram2",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xx3xx-xxxx"
        },
        {
          "alert_level": 0,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule cpu1",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xx2xx-xxxx"
        },
        {
          "alert_level": 1,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule cpu2",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xxx1x-xxxx"
        },
        {
          "alert_level": 1,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule ram1",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xx5xx-xxxx"
        },
        {
          "alert_level": 2,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule ram2",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xx6xx-xxxx"
        },
        {
          "alert_level": 0,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule cpu1",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xx7xx-xxxx"
        },
        {
          "alert_level": 1,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule cpu2",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx-xxx8x"
        },
        {
          "alert_level": 0,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule cpu1",
          "receive_group": "group name",
          "uuid": "xxxxx-xxx1-xx7xx-xxxx"
        },
        {
          "alert_level": 1,
          "from": "controller1",
          "msg": "xxx gt 90 and continue 180 seconds",
          "rule_name": "rule cpu2",
          "receive_group": "group name",
          "uuid": "xxxxx-x3xx-xxx8x"
        }
      ]
    }
  }

}

AlertDataManager.$inject = AlertDataManager.getDI();
AlertDataManager.$$ngIsClass = true;