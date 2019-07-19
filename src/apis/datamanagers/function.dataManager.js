/**
 * Created by wls on 2018/8/7.
 */
export class FunctionDataManager{

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
    FunctionDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }


  // deleteAlertHistoryAll(){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.delete(this.di.appService.getAlertHistoriesRemoveAllUrl()).then(
  //     (res) => {
  //       defer.resolve(res);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }

  getPoePorts(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPoePortUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (err) => {
        defer.reject(err);
      }
    );
    return defer.promise;
  }

  getPoePortsByDeviceId(deviceId){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPoePortByDeviceUrl(deviceId)).then(
      (res) => {
        defer.resolve(res);
      },
      (err) => {
        defer.reject(err);
      }
    );
    return defer.promise;
  }

  putPoePort(deviceId, portId, param){
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getPoePortByDeviceAndPortUrl(deviceId, portId), param).then(
      (res) => {
        defer.resolve(res);
      },
      (err) => {
        defer.reject(err);
      }
    );
    return defer.promise;
  }


  getPoeMainByDeviceId(deviceId){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPoeMainByDeviceIdUrl(deviceId)).then(
      (res) => {
        defer.resolve(res);
      },
      (err) => {
        defer.reject(err);
      }
    );
    return defer.promise;
  }

  getPoeMain(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getPoeMainUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (err) => {
        defer.reject(err);
      }
    );
    return defer.promise;
  }

  putPoeMain(deviceId, param){
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getPoeMainByDeviceIdUrl(deviceId), param).then(
      (res) => {
        defer.resolve(res);
      },
      (err) => {
        defer.reject(err);
      }
    );
    return defer.promise;
  }


  // getAlertGroupBasicConfig(){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.get(this.di.appService.getAlertGroupBasicConfigUrl()).then(
  //     (res) => {
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  //
  // deleteAlertGroupBasicConfig(){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.delete(this.di.appService.getAlertGroupBasicConfigUrl()).then(
  //     (res) => {
  //       defer.resolve(res);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.reject(error);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  // setAlertGroupBasicConfig(param){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.post(this.di.appService.getAlertGroupBasicConfigUrl(),param).then(
  //     (res) => {
  //       defer.resolve(res);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.reject(error);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  //
  // addReceiveGroup(param){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.post(this.di.appService.getAlertGroupReceiveSettingUrl(),param).then(
  //     (res) => {
  //       defer.resolve(res);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  // getAllReceiveGroup(){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.get(this.di.appService.getAlertGroupReceiveUrl()).then(
  //     (res) => {
  //       if(JSON.stringify(res.data) === '{}'){
  //         defer.resolve(null);
  //       }
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  // getReceiveGroup(name){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.get(this.di.appService.getAlertGroupReceiveByNameUrl(name)).then(
  //     (res) => {
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  // deleteReceiveGroup(name){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.delete(this.di.appService.getAlertGroupReceiveByNameUrl(name)).then(
  //     (res) => {
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.reject(error);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  //
  // getAllHealthyCheck(){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.get(this.di.appService.getAllHealthyCheckUrl()).then(
  //     (res) => {
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  // setHealthyCheck(object , source, params){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.post(this.di.appService.getHealthyCheckUrl(object , source), params).then(
  //     (res) => {
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  //
  // getHealthyCheck(object , source, name){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.get(this.di.appService.getHealthyCheckByNameUrl(object , source, name)).then(
  //     (res) => {
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.resolve(null);
  //     }
  //   );
  //   return defer.promise;
  // }
  //
  // deleteHealthyCheck(object , source, name){
  //   let defer = this.di.$q.defer();
  //   this.di.$http.delete(this.di.appService.getHealthyCheckByNameUrl(object , source, name)).then(
  //     (res) => {
  //       defer.resolve(res.data);
  //     },
  //     (error) => {
  //       this.di.$log.error(error);
  //       defer.reject(error);
  //     }
  //   );
  //   return defer.promise;
  // }



}

FunctionDataManager.$inject = FunctionDataManager.getDI();
FunctionDataManager.$$ngIsClass = true;