export class LoginController {
  static getDI() {
    return [
      '$log',
      '$scope',
      '$filter',
      '$location',
      'loginService',
      'loginDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    LoginController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.loginModel = {
      username: '',
      userNameDisplayLabel: {
        id: 'username',
        hint: this.translate('MODULE.LOGIN.FORM.USERNAME.HINT'),
        type: 'text',
        required: true
      },
      password: '',
      passwordDisplayLabel: {
        id: 'password',
        hint: this.translate('MODULE.LOGIN.FORM.PASSWORD.HINT'),
        type: 'password',
        required: true
      },
      errorMessage: null
    };
    this.scope.showBrowserMsg = false;

    this.scope.login = (event) =>{
      if (!this.scope.loginForm.$valid) {
        return;
      }
      this.scope.loginModel.errorMessage = null;
      this.scope.showBrowserMsg = false;
      this.di.loginDataManager.doLogin(this.scope.loginModel.username, this.scope.loginModel.password)
        .then((res) => {
          this.di.$location.path('/');
        }, (res) => {
          this.scope.showBrowserMsg = true;
          this.scope.loginModel.errorMessage = this.di.loginService.validateErrorMsg(res ? res.status : null);
        });
    };
  }
}

LoginController.$inject = LoginController.getDI();
LoginController.$$ngIsClass = true;