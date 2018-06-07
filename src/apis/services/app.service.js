export class appService {
  static getDI() {
    return [
      '$translate',
      '$q',
      '$filter'
    ];
  }
}

appService.$inject = appService.getDI();
appService.$$ngIsClass = true;