export class TableController {
  static getDI() {
    return ['$log','$scope', 'modalManager'];
  }

  constructor(...args){
    this.di = {};
    TableController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;

    this.onMenu = () => {
      this.di.$log.info('table controller in menu popup func.');
      this.di.modalManager.open({
          template: require('../template/showHideColumn.html'),
          controller: 'showHideColumnCtrl',
          windowClass: 'show-hide-column-modal',
          resolve: {
            dataModel: () => {
              return {
                columns: this.scope.tableModel.columnsByField
              };
            }
          }
      })
        .result.then((data) => {
      if (data && !data.canceled) {
        data.result.forEach((item, index) => {
          this.scope.tableModel.columnsByField[item.ui.id]['visible'] = item.visible;
        });
      }
    });
    };

   /* this.onFilter = () => {
      this.di.$log.info('table controller in filter popup func.');
    };*/

    this.select = (row, action) => {
      let index = this.scope.tableModel.removeItems.indexOf(row);
      if (action === 'add' && index == -1) {
        this.scope.tableModel.removeItems.push(row);
      }
      if (action === 'remove' && index != -1){
        this.scope.tableModel.removeItems.splice(index, 1);
      }
    };

    this.rowSelectAction = (data, action) => {
      let rowSelectAction = this.scope.rowSelectAction || angular.noop;
      rowSelectAction({$event: {data: data, action: action}});
    };

    this.rowActionsFilter = (data, actions) => {
      let rowActionsFilter = this.scope.rowActionsFilter || angular.noop;
      let filter = rowActionsFilter({$event:{data: data, actions: actions}}) || actions;
      return filter;
    };
  }
}

TableController.$inject = TableController.getDI();
TableController.$$ngIsClass = true;