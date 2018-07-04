import 'angular';
import 'angular-cookies';
import 'angular-route';
import 'angular-translate';
import 'angular-ui-bootstrap';

import 'lodashService';
import 'easing';

import 'login';
import 'dashboard';
import 'fabric';
import 'switches';
import 'logical';
import 'tenants';

import 'mdc';
import 'menu';
import 'marDrawer';
import 'marHeader';
import 'footer';
import 'topo';

angular
  .module('marsApp', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
    'pascalprecht.translate',
    '_',
    'easing',
    'dashboard',
    'login',
    'fabric',
    'switches',
    'logical',
    'tenants',
    'mdc',
    'menu',
    'marDrawer',
    'marHeader',
    'footer',
    'topo'
  ])
  .factory('setLanguage', function ($q) {
    return function (options) {
      let deferred = $q.defer();
      let data = require('../public/' + options.key + '.json');
      deferred.resolve(data);
      return deferred.promise;
    };
  })
  .config(['$translateProvider', function($translateProvider) {
    $translateProvider.useLoader('setLanguage');
    $translateProvider.useSanitizeValueStrategy('escape');

    let CONST_LANGUAGE = 'language';
    let CONST_LOCAL_STORAGE_KEY = 'userPrefs__';
    let language =  window.localStorage[CONST_LOCAL_STORAGE_KEY + CONST_LANGUAGE];
    if(language){
      language = JSON.parse(language);
      if(language === 'cn' || language === 'en' ){
        $translateProvider.preferredLanguage(language);
      } else {
        $translateProvider.preferredLanguage('cn');
      }
    }
    else {
      $translateProvider.preferredLanguage('cn');
    }
  }])
  .config(['$routeProvider', function ($routeProvider) {
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
      .when('/fabric', {
        template: require('./modules/fabric/template/fabric'),
        controller: 'FabricController'
      })
      .when('/switches', {
        template: require('./modules/fabric_switch/template/switch'),
        controller: 'SwitchController'
      })
      .when('/tenants', {
        template: require('./modules/logical_tenant/template/tenant'),
        controller: 'TenantController'
      })
      .otherwise({ redirectTo: '/' });
  }]);

/*
angular.element(document).ready(function () {
  angular.bootstrap(document, ['marsApp']);
});*/
