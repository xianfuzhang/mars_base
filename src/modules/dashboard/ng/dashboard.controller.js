export class DashboardController {
  static getDI() {
    return [
      '$scope',
      '_',
    ];
  }

  constructor(...args) {
    this.di = {};
    DashboardController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    // this.di.$scope.dashModel = {
    //   switch: false,
    //   checkbox: {
    //     state1: false,
    //     state2: true,
    //     state3: true,
    //   },
    //   radio1: 'DD',
    //   radio: 'AA',
    //   text1: null,
    //   text2: 'zhang'
    // }


    this.di.$scope.dashModel = {
      headers:{
        'menu':[
          {
            'group':'Fabric',
            'items':[
              {'label': 'switch', 'url': 'switch'},
              {'label': 'interface group', 'url': 'interface'}
            ]
          },
          {
            'group':'Logical',
            'items':[
              {'label': 'tenant', 'url': 'tenant'},
              {'label': 'segment', 'url': 'segment'}
            ]
          }
        ],
        'user':{
          //username暂时是用来显示的，后期是通过接口返回。或者是通过session
          'UserName':'Nocsys',
          'items':[
            {'label': 'setting', 'url': 'setting'},
            {'label': 'logout', 'url': 'logout'}
          ]
        }
      },
      deSpines:[{'id':'11_spine'}, {'id':'22_spine'}, {'id':'33_spine'}],
      deLeafs:[{'id':'11_leaf','leaf_group':"1"}, {'id':'22_leaf','leaf_group':"1"},{'id':'33_leaf','leaf_group':"2"}, {'id':'44_leaf','leaf_group':"3"},{'id':'55_leaf','leaf_group':"3"}, {'id':'66_leaf','leaf_group':"4"}],
      deOthers:[{'id':'11_other'}, {'id':'22_other'}, {'id':'33_other'}]
    }



  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

