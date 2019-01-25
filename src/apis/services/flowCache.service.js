export class flowCacheService{
  static getDI() {
   return [
     '$compile',
     '_'
   ];
  }

  constructor(...args){
    this.di = {};
    flowCacheService.getDI().forEach((value, index) => {
      this.di[value] = args[index];

    });

    this.cache = [];
    this.timeCache = [];
    this.CONST_DEVICE_KEY = 'device';
    this.CONST_PORTS_KEY = 'ports';
    this.CONST_PORT_KEY = 'port';
  }

  _formatData(data){
    let res = {};
    this.di._.forEach(data, (value)=>{
      let deviceId = value[this.CONST_DEVICE_KEY];
      res[deviceId] = {};
      let ports = value[this.CONST_PORTS_KEY];
      this.di._.forEach(ports, (port)=>{
        let portId = port[this.CONST_PORT_KEY];
        res[deviceId][portId] = angular.copy(port);
        delete res[deviceId][portId][this.CONST_PORT_KEY]
      })
    });
    return res;
  }

  setFlowData(data){
    if(!this.cache[0]){
      this.cache[0] = this._formatData(data);
      this.timeCache[0] = new Date().getTime();
    } else if(!this.cache[1]){
      this.cache[1] = this._formatData(data);
      this.timeCache[1] = new Date().getTime();
    } else {
      this.cache[0] = angular.copy(this.cache[1]);
      this.cache[1] = this._formatData(data);
      this.timeCache[0] = this.timeCache[1];
      this.timeCache[1] = new Date().getTime();
    }
  }

  _calc(oldData, newData){
    let res = {};
    let keys  = this.di._.keys(newData);
    this.di._.forEach(keys, (key)=>{
      res[key] = (newData[key] - oldData[key])/((this.timeCache[1] - this.timeCache[0])/1000.0);
    });
    return res;
  }

  getCalcFlow(){
    if(!this.cache[1]){
      return null;
    }
    let res = {};
    this.di._.forEach(this.cache[1], (portsInfo, deviceId)=>{
      res[deviceId] = {};
      let deviceOldData = this.cache[0][deviceId];
      if(deviceOldData){
        this.di._.forEach(portsInfo, (port, portId)=>{
          let portFlowData = this._calc(deviceOldData[portId], port);
          res[deviceId][portId] = portFlowData;
        })
      }
    })
    return res;
  }

  clear(){
    this.cache = [];
    this.timeCache = [];
  }



}

flowCacheService.$inject = flowCacheService.getDI();
flowCacheService.$$ngIsClass = true;