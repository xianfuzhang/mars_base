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


  testGetPoeMain(){
    let defer = this.di.$q.defer();
    setTimeout(function () {
      defer.resolve({data:{"poes": [
        {
          "deviceId": "rest:192.168.40.228:80",
          "group": 1,
          "power": 780,
          "operStatus": "on",
          "consumptionPower": 0,
          "threshold": 95,
          "notifyCtrl": true,
          "dllPowerType": "type2Pse",
          "dllPowerSource": "primary"
        },{
          "deviceId": "of:00008cea1b8d0f66",
          "group": 1,
          "power": 780,
          "operStatus": "on",
          "consumptionPower": 0,
          "threshold": 95,
          "notifyCtrl": true,
          "dllPowerType": "type2Pse",
          "dllPowerSource": "primary"
        }
      ]}

      })
    })
    return defer.promise;
  }

  testGetPoePorts(){
    let defer = this.di.$q.defer();
    setTimeout(function () {
      defer.resolve( {data:{"ports": [
          {
            "deviceId": "rest:192.168.40.228:80",
            "group": 1,
            "port": 1,
            "status": true,
            "powerPairsControlAbility": false,
            "powerPairs": "spare",
            "detectionStatus": "disabled",
            "priority": 3,
            "mpsAbsentCounter": 0,
            "powerClassifications": "class0",
            "mirroredDllPdReqPower": 0,
            "dllPseAllocatePower": 0,
            "maxPower": 30000,
            "usedPower": 0,
            "timeRange": "time1",
            "timeRangeActive": false
          },
          {
            "deviceId": "rest:192.168.40.228:80",
            "group": 1,
            "port": 2,
            "status": true,
            "powerPairsControlAbility": false,
            "powerPairs": "spare",
            "detectionStatus": "disabled",
            "priority": 3,
            "mpsAbsentCounter": 0,
            "powerClassifications": "class0",
            "mirroredDllPdReqPower": 0,
            "dllPseAllocatePower": 0,
            "maxPower": 30000,
            "usedPower": 0,
            "timeRange": "time1",
            "timeRangeActive": false
          },
          {
            "deviceId": "rest:192.168.40.228:80",
            "group": 1,
            "port": 12,
            "status": true,
            "powerPairsControlAbility": false,
            "powerPairs": "spare",
            "detectionStatus": "disabled",
            "priority": 3,
            "mpsAbsentCounter": 0,
            "powerClassifications": "class0",
            "mirroredDllPdReqPower": 0,
            "dllPseAllocatePower": 0,
            "maxPower": 30000,
            "usedPower": 0,
            "timeRange": "time1",
            "timeRangeActive": false
          }

        ]}

      }
      )
    })
    return defer.promise;
  }



}

FunctionDataManager.$inject = FunctionDataManager.getDI();
FunctionDataManager.$$ngIsClass = true;