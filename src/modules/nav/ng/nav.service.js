export class navService {
  static getDI() {
    return [
      '$filter',
      '$translate',
    ];
  }
  constructor(...args) {
    this.di = {};
    navService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getNavigationLinks() {
    var i18n = this.di.$filter('translate');

    return [
      {
        label: i18n('MODULES.NAV.FABRIC'),
        path:'/fabric',
        items: [
          {
            label: i18n('MODULES.NAV.FABRIC.SWITCH'),
            path:'/switches',
          }
        ]
      },
      {
        label: i18n('MODULES.NAV.LOGICAL'),
        path:'/logical',
        items: [
          {
            label: i18n('MODULES.NAV.LOGICAL.TENANT'),
            path:'/tenants',
          }
        ]
      }
    ];
  }
}

navService.$inject = navService.getDI();
navService.$$ngIsClass = true;