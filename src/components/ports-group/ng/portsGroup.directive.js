/**
 * Created by myz on 2019/6/17.
 */
export class PortsGroup {
  static getDI () {
    return [
      '$rootScope',
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
      portsList : '=',
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    let unSubscribes = []
    const PORTS_NUM_PER_ROW = 24;

    scope.portsNumPerRow = PORTS_NUM_PER_ROW;
    scope.portsGroups = [];
    let newGroup = [];
    for (let i=0; i < scope.portsList.length; i++) {
      newGroup.push(scope.portsList[i]);
      if (newGroup.length == 24) {
        scope.portsGroups.push(newGroup);
        newGroup = [];
      }

      if(i == scope.portsList.length - 1 && newGroup.length) {
        scope.portsGroups.push(newGroup);
      }
    }

    (function init () {
      scope.click = (index_one, index_two) => {
        // let index_one = Math.floor($index / PORTS_NUM_PER_ROW);
        // let index_two = $index % PORTS_NUM_PER_ROW;

        if(!scope.portsGroups[index_one][index_two].disabled) {
          scope.portsGroups[index_one][index_two].selected = !scope.portsGroups[index_one][index_two].selected;
        }
      }

      let portsListChanged = false;
      unSubscribes.push(scope.$watch("portsList", (newList, oldList) => {
        if(portsListChanged == false) { // initial state
          portsListChanged == true;
          return;
        }

        for (let i=0; i < scope.portsList.length; i++) {
          newGroup.push(scope.portsList[i]);
          if (newGroup.length == 24) {
            scope.portsGroups.push(newGroup);
            newGroup = [];
          }
        }
      },true));

      unSubscribes.push(this.di.$rootScope.$on('ports-selected', (evt, portsObj) => {
        // portsObj: [1,2,3] or "1,3-7"
        let portsArr = [];
        if(Array.isArray(portsObj)) {
          portsArr = portsObj
        } else if (typeof portsObj == 'string') {
          let tmpArr = portsObj.split(',');
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
}

PortsGroup.$inject = PortsGroup.getDI();
PortsGroup.$$ngIsClass = true;
