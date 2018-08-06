export class loginService {
  static getDI() {
    return [
      '$filter',
    ];
  }
  constructor(...args) {
    this.di = {};
    loginService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  validateErrorMsg(status) {
    let message = null,
      CONST_HTTP_HOST = -1,
      CONST_HTTP_OK = 200,
      CONST_HTTP_AUTHORIZATION = 401,
      CONST_HTTP_FORBIDDEN = 403,
      CONST_HTTP_NOPERMISSION = 888;

    switch (status) {
      case CONST_HTTP_FORBIDDEN:
        message = this.di.$filter('translate')('MODULE.LOGIN.HTTP_FORBIDDEN');
        break;
      case CONST_HTTP_HOST:
        message = this.di.$filter('translate')('MODULE.LOGIN.ACCEPT_CERTIFICATE');
        break;
      case CONST_HTTP_AUTHORIZATION:
        message = this.di.$filter('translate')('MODULE.LOGIN.INVALID_LOGIN');
        break;
      case CONST_HTTP_OK:
        message = null;
        break;
      case CONST_HTTP_NOPERMISSION:
        message = this.di.$filter('translate')('MODULE.LOGIN.NO_PERMISSIONS');
        break;
      default:
        message = this.di.$filter('translate')('MODULE.LOGIN.HTTP_ERROR_DEFAULT', status);
        break;
    }
    return message;
  }
}
loginService.$inject = loginService.getDI();
loginService.$$ngIsClass = true;