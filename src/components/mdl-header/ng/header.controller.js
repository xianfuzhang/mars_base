export class headerController{
  static getDI() {
    return [
      '$log',
      '$scope',
      '$location',
      'appService'
    ];
  }

  constructor(...args){
    this.di= {};
    headerController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.groups = this.di.appService.CONST.HEADER;

    this.scope.location = (url, event) => {
      event && event.stopPropagation();
      this.di.$log.info(url);
      this.di.$location.path(url);
    };
  }


}

headerController.$inject = headerController.getDI();
headerController.$$ngIsClass = true;