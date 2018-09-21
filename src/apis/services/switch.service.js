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
    this.translate = this.di.$filter('translate');

  }

  getSpineShowInfo(sw){
    let showArray = [];
    showArray.push({'label': 'ID', 'value': sw.id});
    showArray.push({'label': this.translate('MODULES.COMMON.NAME'), 'value': sw.name});
    showArray.push({'label': this.translate('MODULES.COMMON.TYPE'), 'value': sw.type});
    showArray.push({'label': this.translate('MODULES.COMMON.AVAILABLE'), 'value': sw.available});
    showArray.push({'label': this.translate('MODULES.COMMON.MAC'), 'value': sw.mac});
    showArray.push({'label': this.translate('MODULES.COMMON.CONNECT_SINCE'), 'value': sw.lastUpdate});
    showArray.push({'label': this.translate('MODULES.COMMON.MANAGEMENT_ADDRESS'), 'value': sw.mgmtIpAddress});
    showArray.push({'label': this.translate('MODULES.COMMON.RACK_ID'), 'value': sw.rack_id});
    return showArray;
  }

  getLeafShowInfo(sw){
    let showArray = [];
    showArray.push({'label': 'ID', 'value': sw.id});
    showArray.push({'label': this.translate('MODULES.COMMON.NAME'), 'value': sw.name});
    showArray.push({'label': this.translate('MODULES.COMMON.TYPE'), 'value': sw.type});
    showArray.push({'label': this.translate('MODULES.COMMON.AVAILABLE'), 'value': sw.available});
    showArray.push({'label': this.translate('MODULES.COMMON.MAC'), 'value': sw.mac});
    showArray.push({'label': this.translate('MODULES.COMMON.CONNECT_SINCE'), 'value': sw.lastUpdate});
    showArray.push({'label': this.translate('MODULES.COMMON.MANAGEMENT_ADDRESS'), 'value': sw.mgmtIpAddress});
    // if(sw.leaf_group_name){
    //   showArray.push({'label': this.translate('MODULES.COMMON.LEAF_GROUP'), 'value': sw.leaf_group_name + ' ( port : ' +sw.leaf_group_port + ' )'});
    // }
    showArray.push({'label': this.translate('MODULES.COMMON.RACK_ID'), 'value': sw.rack_id});
    return showArray;
  }

  getOtherShowInfo(sw){
    let showArray = [];
    showArray.push({'label': 'ID', 'value': sw.id});
    showArray.push({'label': this.translate('MODULES.COMMON.NAME'), 'value': sw.name});
    showArray.push({'label': this.translate('MODULES.COMMON.TYPE'), 'value': sw.type});
    showArray.push({'label': this.translate('MODULES.COMMON.AVAILABLE'), 'value': sw.available});
    showArray.push({'label': this.translate('MODULES.COMMON.MAC'), 'value': sw.mac});
    showArray.push({'label': this.translate('MODULES.COMMON.CONNECT_SINCE'), 'value': sw.lastUpdate});
    showArray.push({'label': this.translate('MODULES.COMMON.MANAGEMENT_ADDRESS'), 'value': sw.mgmtIpAddress});
    showArray.push({'label': this.translate('MODULES.COMMON.RACK_ID'), 'value': sw.rack_id});
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
