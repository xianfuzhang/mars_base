/**
 * Created by wls on 2018/7/17.
 */
export class switchService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    switchService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

  }

  getSpineShowInfo(sw){
    let showArray = [];
    showArray.push({'label': 'id', 'value': sw.id});
    showArray.push({'label': 'name', 'value': sw.name});
    showArray.push({'label': 'type', 'value': sw.type});
    showArray.push({'label': 'available', 'value': sw.available});
    showArray.push({'label': 'MAC', 'value': sw.mac});
    showArray.push({'label': 'connect since', 'value': sw.lastUpdate});
    showArray.push({'label': 'Management Address', 'value': sw.mgmtIpAddress});
    showArray.push({'label': 'rack_id', 'value': sw.rack_id});
    return showArray;
  }

  getLeafShowInfo(sw){
    let showArray = [];
    showArray.push({'label': 'id', 'value': sw.id});
    showArray.push({'label': 'name', 'value': sw.name});
    showArray.push({'label': 'type', 'value': sw.type});
    showArray.push({'label': 'available', 'value': sw.available});
    showArray.push({'label': 'MAC', 'value': sw.mac});
    showArray.push({'label': 'connect since', 'value': sw.lastUpdate});
    showArray.push({'label': 'Management Address', 'value': sw.mgmtIpAddress});
    showArray.push({'label': 'rack_id', 'value': sw.rack_id});
    return showArray;
  }

  getOtherShowInfo(sw){
    let showArray = [];
    showArray.push({'label': 'id', 'value': sw.id});
    showArray.push({'label': 'name', 'value': sw.name});
    showArray.push({'label': 'type', 'value': sw.type});
    showArray.push({'label': 'available', 'value': sw.available});
    showArray.push({'label': 'MAC', 'value': sw.mac});
    showArray.push({'label': 'connect since', 'value': sw.lastUpdate});
    showArray.push({'label': 'Management Address', 'value': sw.mgmtIpAddress});
    showArray.push({'label': 'rack_id', 'value': sw.rack_id});
    return showArray;
  }

  getSwitchName(id, swArr){
    let sw = this.di._.filter(swArr, function(sw) { return id == sw.id });
    if( sw.length == 1){
      return sw[0].name;
    } else {
      console.log("get switch name of  " + id + "error. "  + swArr);
      return '';
    }
  }

}


switchService.$inject = switchService.getDI();
switchService.$$ngIsClass = true;