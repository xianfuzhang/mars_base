import 'angular';
import 'angular-cookies';
import 'angular-route';
import 'angular-translate';
import 'angular-material';

import 'login';
import 'dashboard';

import 'lodashService';

angular
  .module('marsApp', [
    'ngRoute',
    'ngCookies',
    'ngMaterial',
    'pascalprecht.translate',
    '_',
    'dashboard',
    'login'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        template: require('./modules/dashboard/template/dashboard'),
        controller: 'DashboardController'
      })
      .when('/login', {
        template: require('./modules/login/template/login'),
        controller: 'LoginController'
      })
      .when('/logout', {
        redirectTo: function(param, path, search){
          return '/login';
        }
      })
      .otherwise({ redirectTo: '/' });
  });


angular.element(document).ready(function () {
  angular.bootstrap(document, ['marsApp']);
});
