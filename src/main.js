import 'angular';
import 'angular-cookies';
import 'angular-route';
import 'angular-translate';
import 'angular-ui-bootstrap';

import 'lodashService';
import 'easing';
import 'apis';
import 'localStore';

import 'login';
import 'dashboard';
import 'fabric';
import 'logical';

import 'mdc';
import 'mdlHeader';
import 'contentHeader';
import 'mdlTable';
import 'modal';
import 'menu';
import 'marDrawer';
import 'marHeader';
import 'marSection';
import 'footer';
import 'topo';
import 'loading';
import 'deviceTooltip';
import 'wizard';


angular
  .module('marsApp', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
    'pascalprecht.translate',
    '_',
    'easing',
    'apis',
    'localStore',
    'dashboard',
    'login',
    'fabric',
    'logical',
    'mdc',
    'mdlHeader',
    'mdlTable',
    'modal',
    'menu',
    'marDrawer',
    'marHeader',
    'contentHeader',
    'marSection',
    'footer',
    'topo',
    'loading',
    'deviceTooltip',
    'wizard'
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
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        template: require('./modules/dashboard/template/dashboard'),
        controller: 'DashboardController'
      })
      .when('/devices', {
        template: require('./modules/fabric/template/device.html'),
        controller: 'deviceController'
      })
      .when('/devices/:deviceId', {
        template: require('./modules/fabric/template/device_detail.html'),
        controller: 'deviceDetailController'
      })
      .when('/interface_group', {
        template: require('./modules/fabric/template/interface_group.html'),
        controller: 'interfaceGroupController'
      })
      .when('/statistics', {
        template: require('./modules/fabric/template/statistic.html'),
        controller: 'statisticController'
      })
      .when('/account_manage', {
        template: require('./modules/login/template/account_manage.html'),
        controller: 'accountManageController'
      }).
      when('/fabric_summary', {
        template: require('./modules/fabric/template/fabric_summary.html'),
        controller: 'fabricSummaryController'
      }).
      when('/login', {
        template: require('./modules/login/template/login.html'),
        controller: 'loginController'
      }).
      when('/logout', {
        redirectTo: function(param, path, search){
          return '/login';
        }
      })
      .otherwise({ redirectTo: '/' });

    /*$locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });*/
  }]);

/*
angular.element(document).ready(function () {
  angular.bootstrap(document, ['marsApp']);
});*/
