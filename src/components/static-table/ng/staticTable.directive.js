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
      data: '='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init(){

      let unsubscribers = [];
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
          // [{opt:'' ,name: "Moroni21", age: 510},
          // {opt:"",name: "Moroni2", age: 520},
          // {opt:"",name: "Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534", age: 550},
          // {opt:"",name: "Moroni2", age: 510},{opt:'' ,name: "Moroni21", age: 510},
          // {opt:"",name: "Moroni2", age: 520},
          // {opt:"",name: "Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534", age: 550},
          // {opt:"",name: "Moroni2", age: 510},{opt:'' ,name: "Moroni21", age: 510},
          // {opt:"",name: "Moroni2", age: 520},
          // {opt:"",name: "Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534", age: 550},
          // {opt:"",name: "Moroni2", age: 510},{opt:'' ,name: "Moroni21", age: 510},
          // {opt:"",name: "Moroni2", age: 520},
          // {opt:"",name: "Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534", age: 550},
          // {opt:"",name: "Moroni2", age: 510},{opt:'' ,name: "Moroni21", age: 510},
          // {opt:"",name: "Moroni2", age: 520},
          // {opt:"",name: "Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534", age: 550},
          // {opt:"",name: "Moroni2", age: 510},{opt:'' ,name: "Moroni21", age: 510},
          // {opt:"",name: "Moroni2", age: 520},
          // {opt:"",name: "Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534Moroni534", age: 550},
          // {opt:"",name: "Moroni2", age: 510}]
      });

      unsubscribers.push(scope.$watch('data',(newData)=>{

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
