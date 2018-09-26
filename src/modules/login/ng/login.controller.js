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
      nameHelper: {
        id: 'nameHelper',
        validation: 'false',
        content: this.translate('MODULE.LOGIN.FORM.USERNAME.HELP')
      },
      password: '',
      passwordDisplayLabel: {
        id: 'password',
        hint: this.translate('MODULE.LOGIN.FORM.PASSWORD.HINT'),
        type: 'password',
        required: true
      },
      passwordHelper: {
        id: 'passwordHelper',
        validation: 'false',
        content: this.translate('MODULE.LOGIN.FORM.PASSWORD.HELP')
      },
      errorMessage: null
    };
    this.scope.showBrowserMsg = false;

    this.scope.login = (event) =>{
      let invalid = false;
      if (this.scope.loginForm.$invalid) {
        return;
      }
      if (!this.scope.loginModel.username) {
        this.scope.loginModel.nameHelper.validation = 'true';
        invalid = true;
      }
      else {
        this.scope.loginModel.nameHelper.validation = 'false';
      }
      if (!this.scope.loginModel.password) {
        this.scope.loginModel.passwordHelper.validation = 'true';
        invalid = true;
      }
      else {
        this.scope.loginModel.passwordHelper.validation = 'false';
      }
      if (invalid) {
        return;
      }
      this.scope.loginModel.errorMessage = null;
      this.scope.showBrowserMsg = false;
      this.di.loginDataManager.doLogin(this.scope.loginModel.username, this.scope.loginModel.password)
        .then((res) => {
          if(res === true){
            this.di.$location.path('/');
          } else {
            this.scope.showBrowserMsg = true;
            this.scope.loginModel.errorMessage = this.di.loginService.validateErrorMsg(res ? res.status : null);
          }
        }, (res) => {
          this.scope.showBrowserMsg = true;
          this.scope.loginModel.errorMessage = this.di.loginService.validateErrorMsg(res ? res.status : null);
        });
    };
  }
}

LoginController.$inject = LoginController.getDI();
LoginController.$$ngIsClass = true;