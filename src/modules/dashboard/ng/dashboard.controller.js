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
      deSpines:[
        {
          "id": "of:0000000000000001",
          "type": "spine",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
      "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
    "chassisId": "3",
      "lastUpdate": "1528558441869",
      "humanReadableLastUpdate": "connected 4m52s ago",
      "annotations": {
      "channelId": "192.168.123.3:36892",
        "managementAddress": "192.168.123.3",
        "protocol": "OF_13"
    }
  },
    {
      "id": "of:0000000000000002",
      "type": "spine",
      "available": true,
      "role": "MASTER",
      "mfr": "Nicira, Inc.",
      "hw": "Open vSwitch",
      "sw": "2.5.4",
      "serial": "None",
      "driver": "ovs",
      "mac":"00-00-11-22-33-44",
      "rack_id":"10-1-2-3",
      "chassisId": "3",
      "lastUpdate": "1528558441869",
      "humanReadableLastUpdate": "connected 4m52s ago",
      "annotations": {
      "channelId": "192.168.123.3:36892",
        "managementAddress": "192.168.123.3",
        "protocol": "OF_13"
    }
    },
    {
      "id": "of:0000000000000003",
      "type": "spine",
      "available": true,
      "role": "MASTER",
      "mfr": "Nicira, Inc.",
      "hw": "Open vSwitch",
      "sw": "2.5.4",
      "serial": "None",
      "driver": "ovs",
      "mac":"00-00-11-22-33-44",
      "rack_id":"10-1-2-3",
      "chassisId": "3",
      "lastUpdate": "1528558441869",
      "humanReadableLastUpdate": "connected 4m52s ago",
      "annotations": {
      "channelId": "192.168.123.3:36892",
        "managementAddress": "192.168.123.3",
        "protocol": "OF_13"
    }
    }
  ],
      deLeafs:[
        {
          "id": "of:0000000000000011",
          "type": "leaf",
          'leaf_group':"1",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        },
        {
          "id": "of:0000000000000012",
          "type": "leaf",
          'leaf_group':"2",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        },
        {
          "id": "of:0000000000000013",
          "type": "leaf",
          'leaf_group':"3",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        },
        {
          "id": "of:0000000000000014",
          "type": "leaf",
          'leaf_group':"1",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        },
        {
          "id": "of:0000000000000015",
          "type": "leaf",
          'leaf_group':"3",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        },
        {
          "id": "of:0000000000000016",
          "type": "leaf",
          'leaf_group':"4",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        }
      ],
      deOthers:[{
        "id": "of:0000000000000021",
        "type": "other",
        "available": true,
        "role": "MASTER",
        "mfr": "Nicira, Inc.",
        "hw": "Open vSwitch",
        "sw": "2.5.4",
        "serial": "None",
        "driver": "ovs",
        "mac":"00-00-11-22-33-44",
        "rack_id":"10-1-2-3",
        "chassisId": "3",
        "lastUpdate": "1528558441869",
        "humanReadableLastUpdate": "connected 4m52s ago",
        "annotations": {
          "channelId": "192.168.123.3:36892",
          "managementAddress": "192.168.123.3",
          "protocol": "OF_13"
        }
      },
        {
          "id": "of:0000000000000022",
          "type": "other",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        },
        {
          "id": "of:0000000000000033",
          "type": "other",
          "available": true,
          "role": "MASTER",
          "mfr": "Nicira, Inc.",
          "hw": "Open vSwitch",
          "sw": "2.5.4",
          "serial": "None",
          "driver": "ovs",
          "mac":"00-00-11-22-33-44",
          "rack_id":"10-1-2-3",
          "chassisId": "3",
          "lastUpdate": "1528558441869",
          "humanReadableLastUpdate": "connected 4m52s ago",
          "annotations": {
            "channelId": "192.168.123.3:36892",
            "managementAddress": "192.168.123.3",
            "protocol": "OF_13"
          }
        }],
      deLinks: [
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000001"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000011"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000001"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000012"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000001"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000013"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000001"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000014"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000001"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000015"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000002"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000011"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000002"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000012"
          },
          "type": "DIRECT",
          "state": "DOWN"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000002"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000013"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },{
          "src": {
            "port": "1",
            "device": "of:0000000000000002"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000014"
          },
          "type": "DIRECT",
          "state": "DOWN"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000002"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000015"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },{
          "src": {
            "port": "1",
            "device": "of:0000000000000002"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000016"
          },
          "type": "DIRECT",
          "state": "DOWN"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000003"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000011"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000003"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000012"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000003"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000014"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000003"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000015"
          },
          "type": "DIRECT",
          "state": "DOWN"
        },
        {
          "src": {
            "port": "1",
            "device": "of:0000000000000003"
          },
          "dst": {
            "port": "3",
            "device": "of:0000000000000016"
          },
          "type": "DIRECT",
          "state": "ACTIVE"
        },
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
          "show_ports":false,
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

      this.di.$rootScope.$emit('show_links');
    };

    this.di.$scope.portSettings = (event) => {
      this.di.$scope.fabricModel.topoSetting.show_ports = !this.di.$scope.fabricModel.topoSetting.show_ports;
      this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", this.di.$scope.fabricModel.topoSetting);
      this.di.$rootScope.$emit('show_ports');

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
      // initTop()
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

