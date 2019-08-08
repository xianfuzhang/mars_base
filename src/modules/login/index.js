// import './scss/login.scss';
import {LoginController} from './ng/login.controller';
import {AccountManageController} from './ng/accountManage.controller';
import {CreateUserAccountController} from './ng/createUserAccount.controller';
import {UpdateUserAccountController} from './ng/updateUserAccount.controller';
import {loginService} from './ng/login.service';
import {accountService} from './ng/account.service';

export default angular
  .module('login', [])
  .controller('loginController', LoginController)
  .controller('accountManageController', AccountManageController)
  .controller('createUserAccountController', CreateUserAccountController)
  .controller('updateUserAccountController', UpdateUserAccountController)
  .service('loginService', loginService)
  .service('accountService', accountService)
  .name;