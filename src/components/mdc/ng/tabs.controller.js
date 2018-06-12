export class TabsController {
  static getDI () {
    return [
      '$scope',
    ];
  }

  constructor (...args) {
    this.di = {};
    TabsController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.select = (item) => {
      if (item == this.di.$scope.model) {
        return;
      }
      this.di.$scope.onSelect = this.di.$scope.onSelect || angular.noop;
      if (this.di.$scope.onSelect({ $value: item })) {
        this.di.$scope.model = item;
      }
    };
  }

}

TabsController.$inject = TabsController.getDI();
TabsController.$$ngIsClass = true;
