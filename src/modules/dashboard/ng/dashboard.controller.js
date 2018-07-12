export class DashboardController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$q',
      '$document',
      '$window',
      '$timeout',
      'localStoreService'
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
    let fabric_storage_ns = "storage_farbic_";

    this.resizeTimeout = null;
    this.di.$scope.fabricModel = {
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
      deOthers:[{'id':'11_other'}, {'id':'22_other'}, {'id':'33_other'}],
      deLinks: [
        {
          "src": {
            "port": "1",
            "device": "11_spine"
          },
          "dst": {
            "port": "3",
            "device": "11_leaf"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "3",
            "device": "22_spine"
          },
          "dst": {
            "port": "2",
            "device": "22_leaf"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "3",
            "device": "11_leaf"
          },
          "dst": {
            "port": "2",
            "device": "22_leaf"
          },
          "type": "DIRECT",
          "state": "DOWN"
        }
      ]
    };

    this.di.$scope.resize_right_plus = {};
    this.di.$scope.resize_right = {};
    this.di.$scope.resize_length = {};

    // let deferred = this.di.$q.defer();
    // this.di.$http.get('http://192.168.122.45:9200/alert_types/_search').then(
    //   (response) => {
    //     console.log('success to get es data');
    //     console.log(response)
    //   },
    //   () => {
    //     console.log('failed to get es data');
    //   }
    // );

    this.di.localStoreService.getStorage(fabric_storage_ns).get('topo_set').then((data)=>{
      if(data === undefined){
        this.di.$scope.fabricModel.topoSetting = {
          "show_links": false,
          "show_tooltips":false,
        }
      } else {
        this.di.$scope.fabricModel.topoSetting = data
      }
    });

    this.di.$scope.topoRefresh = (event) => {

    };
    this.di.$scope.tooltipSetting = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_tooltips = !this.di.$scope.fabricModel.topoSetting.show_tooltips;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);



    };
    this.di.$scope.lineSetting = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_links = !this.di.$scope.fabricModel.topoSetting.show_links;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);

      // this.di.$scope.$apply();

      this.di.$rootScope.$emit('show_links');
    };



    this.di.$scope.resize_div = (event) => {
      console.log(event);
      event.preventDefault();
      // console.log(self);
      this.di.$document.on("mouseup", mouseup);
      this.di.$document.on("mousemove", mousemove);
    };

    let mouseup = (event) =>{
      console.log('mouseup');
      this.di.$document.off('mousemove', mousemove);
      this.di.$document.off('mouseup', mouseup);
    };

    let mousemove = (event) => {
      var x = event.pageX;
      let win_width = this.di.$window.innerWidth;
      this.di.$scope.resize_right_plus = {'right': (win_width - x + 5) +'px','width': (x - 5)+ 'px'};
      this.di.$scope.resize_right = {'right':+ (win_width - x) +'px'};
      this.di.$scope.resize_length = {'width':+ (win_width - x) +'px'};
      this.di.$scope.$apply();

      // if(this.resizeTimeout){
      //   this.di.$timeout.cancel(this.resizeTimeout);
      // }
      // this.resizeTimeout = this.di.$timeout(send_resize_msg, 500);
      send_resize_msg();
    };

    let send_resize_msg = () => {
      this.di.$rootScope.$emit('resize_canvas');
    };

    angular.element(this.di.$window).bind('resize', () => {
      let win_width = this.di.$window.innerWidth;
      let rightStr = this.di.$scope.resize_right_plus['right'];
      let right = Number(rightStr.substr(0, rightStr.indexOf("px")));
      this.di.$scope.resize_right_plus['width'] = (win_width - right) + 'px';
      this.di.$scope.$apply();
    });


    this.di.$timeout(function () {
      initTop()
    },200);


    let win_width = this.di.$window.innerWidth;
    this.di.$scope.resize_right_plus = {'width': (win_width - 300)+ 'px','right':'300px'};

    let initTop = () =>{
      this.di.$rootScope.$emit('resize_canvas');
    };



  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

