/**
 * Created by wls on 2018/7/17.
 */
export class topoManageService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    topoManageService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }


  getVlanMenuSchema() {
    return [
      {
        'label': this.translate('MODULES.TOPOMANAGE.VLAN_ALL.MENU.STATIC_VLAN'),
        'value': 'static_vlan',
      },
      {
        'label': this.translate('MODULES.TOPOMANAGE.VLAN_ALL.MENU.DYNAMIC_VLAN'),
        'value': 'dynamic_vlan',
      },
      {
        'label': this.translate('MODULES.TOPOMANAGE.VLAN_ALL.MENU.GUEST_VLAN'),
        'value': 'guest_vlan',
      },
      {
        'label': this.translate('MODULES.TOPOMANAGE.VLAN_ALL.MENU.IP_VLAN'),
        'value': 'vlan_ip',
      },
      {
        'label': this.translate('MODULES.TOPOMANAGE.VLAN_ALL.MENU.VOICE_VLAN'),
        'value': 'voice_vlan',
      }
    ];
  }

}


topoManageService.$inject = topoManageService.getDI();
topoManageService.$$ngIsClass = true;