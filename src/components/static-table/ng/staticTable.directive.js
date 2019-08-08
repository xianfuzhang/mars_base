/**
 * Created by wls on 2018/6/7.
 */

export class staticTable {
  static getDI () {
    return [
      '$rootScope',
      'NgTableParams'
    ];
  }

  constructor (...args) {
    this.di = [];
    staticTable.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/static_table');

    this.scope = {
      columns : '=',
      data: '=',
      scale: '@'
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init(){

      let unsubscribers = [];
      scope.scale = scope.scale||'big';
      scope.isSmall = scope.scale === 'small';

      scope.tableModel = {
        cols:scope.columns,
        // cols:[
        //   { field: "opt", title: "", show: true },
        //   { field: "name", title: "Name", sortable: "name", show: true },
        //   { field: "age", title: "Age", sortable: "age", show: true },
        // ]
      };

      scope.tableModel['tableParams'] = new this.di.NgTableParams({

      }, {
        dataset: scope.data
      });

      unsubscribers.push(scope.$watch('data',(newData)=>{
        if(newData){
          scope.tableModel['tableParams'] = new this.di.NgTableParams({

          }, {
            dataset: scope.data
          });
        }
      }));


      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });
      });



    }).call(this);
  }
}

staticTable.$inject = staticTable.getDI();
staticTable.$$ngIsClass = true;
