import './scss/login.scss';
import {LoginController} from './ng/login.controller';
import {loginService} from './ng/login.service';

export default angular
  .module('login', [])
  .controller('loginController', LoginController)
  .service('loginService', loginService)
  .name;