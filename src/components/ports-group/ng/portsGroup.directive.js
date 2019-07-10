/**
 * Created by myz on 2019/6/17.
 */
export class PortsGroup {
  static getDI () {
    return [
      '$rootScope',
      '_'
    ];
  }

  constructor (...args) {
    this.di = [];
    PortsGroup.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/ports_group.html');

    this.scope = {
      groupId: '@',
      portsNumPerRow: '@',
      portsList: '='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    let unSubscribes = []
    const PORTS_NUM_PER_ROW = 27;  // the default num per row

    const PortsNumPerRow = parseInt(scope.portsNumPerRow) || PORTS_NUM_PER_ROW;
    scope.portsGroups = [];
    let newGroup = [];
    let blankPort = {
      id: '',
      title: '',
      selected: false,
      disabled: true
    }

    let halfLength = Math.ceil(scope.portsList.length / 2);
    for (let i=0; i < PortsNumPerRow * 2; i++) {
      if (i < halfLength) {
        newGroup.push(scope.portsList[i]);
      } else if (i < PortsNumPerRow) {
        newGroup.push(blankPort);
      } else if (i < PortsNumPerRow + halfLength) {
        newGroup.push(scope.portsList[i - PortsNumPerRow + halfLength]);
      } else if (i < PortsNumPerRow * 2) {
        newGroup.push(blankPort);
      }

      if (newGroup.length == PortsNumPerRow) {
        scope.portsGroups.push(newGroup);
        newGroup = [];
      }
    }

    (function init () {
      scope.selectPort = (portId) => {
        // let index_one = Math.floor($index / PORTS_NUM_PER_ROW);
        // let index_two = $index % PORTS_NUM_PER_ROW;

        let index = this.di._.findIndex(scope.portsList, (port) => {
          return port.id == portId
        });

        if(index > -1) {
          scope.portsList[index].selected = !scope.portsList[index].selected;
        }
      }

      unSubscribes.push(this.di.$rootScope.$on('ports-selected', (evt, msgObj) => {
        if(msgObj.groupId != scope.groupId) return

        let portsArr = this.getPortsArrayFromStr(msgObj.ports); // portsObj: [1,2,3] or "1,3-7"

        for(let port of scope.portsList) {
          if(portsArr.indexOf(port.id) > -1) {
            port.selected = true;
          } else {
            port.selected = false;
          }
        }

        scope.$apply()
      }))

      scope.$on('$destroy', () => {
        unSubscribes.forEach((unSubscribe) => {
          unSubscribe();
        });
      });
    }).call(this);
  }

  getPortsArrayFromStr(ports) {
    let portsArr = [];
    if(Array.isArray(ports)) {
      portsArr = ports
    } else if (typeof ports == 'string') {
      let tmpArr = ports.split(',');
      for(let portStr of tmpArr) {
        portStr = portStr.trim();
        if(portStr) {
          if(parseInt(portStr) != portStr) {
            let portStrArr = portStr.split('-');
            if(portStrArr.length == 2 && !isNaN(parseInt(portStrArr[0])) && !isNaN(parseInt(portStrArr[1]))) {
              for(let num = parseInt(portStrArr[0]); num <= parseInt(portStrArr[1]); num++) {
                portsArr.push(num);
              }
            }
          } else {
            portsArr.push(parseInt(portStr));
          }
        }
      }
    }

    return portsArr;
  }
}

PortsGroup.$inject = PortsGroup.getDI();
PortsGroup.$$ngIsClass = true;
