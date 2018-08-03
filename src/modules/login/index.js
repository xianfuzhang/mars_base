import './scss/login.scss';
import {LoginController} from './ng/login.controller';
import {AccountManageController} from './ng/accountManage.controller';
import {loginService} from './ng/login.service';
import {accountService} from './ng/account.service';

export default angular
  .module('login', [])
  .controller('loginController', LoginController)
  .controller('accountManageController', AccountManageController)
  .service('loginService', loginService)
  .service('accountService', accountService)
  .name;