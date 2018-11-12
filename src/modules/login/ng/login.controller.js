export class LoginController {
  static getDI() {
    return [
      '$log',
      '$scope',
      '$filter',
      '$location',
      '$cookies',
      'appService',
      'loginService',
      'loginDataManager',
      'accountDataManager',
      'crypto'
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
          if(res){
            this.di.accountDataManager.getUserAccount(this.scope.loginModel.username)
              .then((groups) => {
                let role = 1;
                if (groups.includes(this.di.appService.CONST.GUEST_GROUP)) {
                  role = 1;
                }
                else if (groups.includes(this.di.appService.CONST.ADMIN_GROUP)) {
                  role = 2;
                }
                else if (groups.includes(this.di.appService.CONST.SUPER_GROUP)) {
                  role = 3;
                }
                this.di.appService.setLoginRole(role);
                this.di.appService.filterMenuByLoginRole();
                
                this.di.$cookies.put('menu', this.di.crypto.AES.encrypt(JSON.stringify({
                  'role': role, 
                  'groups': this.di.appService.roleFilterMenu
                }), this.di.appService.CONST.CRYPTO_STRING));
                this.di.$location.path('/');
              }, (msg) => {
                this.di.$cookies.remove('menu');
                this.scope.showBrowserMsg = true;
                this.scope.loginModel.errorMessage = this.di.loginService.validateErrorMsg(msg ? msg : null);
              });
            
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