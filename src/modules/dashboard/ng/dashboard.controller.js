export class DashboardController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$q'
    ];
  }

  constructor(...args) {
    this.di = {};
    DashboardController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.di.$scope.dashboardModel = {
      headers: {
        'menu': [
          {
            'group': 'Fabric',
            'items': [
              {'label': 'summary', 'url': '#!/fabric_summary'},
              {'label': 'switch', 'url': 'switch'},
              {'label': 'interface group', 'url': 'interface'}
            ]
          },
          {
            'group': 'Logical',
            'items': [
              {'label': 'tenant', 'url': 'tenant'},
              {'label': 'segment', 'url': 'segment'}
            ]
          }
        ],
        'user': {
          //username暂时是用来显示的，后期是通过接口返回。或者是通过session
          'UserName': 'Nocsys',
          'items': [
            {'label': 'setting', 'url': 'setting'},
            {'label': 'logout', 'url': 'logout'}
          ]
        }
      }
    }

  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

