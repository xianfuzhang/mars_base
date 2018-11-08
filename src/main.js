import 'angular';
import 'angular-cookies';
import 'angular-route';
import 'angular-translate';
import 'angular-ui-bootstrap';

import 'lodashService';
import 'crypto';
import 'c3Service';
import 'easing';
import 'apis';
import 'localStore';
import 'ngTable';

import 'login';
import 'dashboard';
import 'fabric';
import 'logical';
import 'configuration';
import 'alert';
import 'log';
import 'manage';

import 'mdc';
import 'mdlHeader';
import 'contentHeader';
import 'staticTable';
import 'mdlTable';
import 'modal';
import 'menu';
import 'marDrawer';
import 'marHeader';
import 'marSection';
import 'contentPanel';
import 'footer';
import 'topo';
import 'validInput';
import 'loading';
import 'deviceTooltip';
import 'wizard';
import 'datePicker';
import 'marButton';
import 'jsonEditor';

angular
  .module('marsApp', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
    'pascalprecht.translate',
    '_',
    'c3',
    'ngTable',
    'crypto',
    // ngTableModule.name,
    'easing',
    'apis',
    'localStore',
    'dashboard',
    'login',
    'fabric',
    'logical',
    'configuration',
    'alert',
    'log',
    'manage',
    'mdc',
    'mdlHeader',
    'mdlTable',
    'modal',
    'menu',
    'marDrawer',
    'marHeader',
    'contentHeader',
    'staticTable',
    'marSection',
    'contentPanel',
    'footer',
    'topo',
    'validInput',
    'loading',
    'deviceTooltip',
    'wizard',
    'date-picker',
    'marButton',
    'jsonEditor'
  ])
  .factory('setLanguage', ['$q',function ($q) {
    return function (options) {
      let deferred = $q.defer();
      let data = require('../public/' + options.key + '.json');
      deferred.resolve(data);
      return deferred.promise;
    };
  }])
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
    var checkLoggedIn = function($q, $cookies, $location){
      var deferred = $q.defer();
      var useraccount = $cookies.get('useraccount');
      if (!useraccount) {
        deferred.reject();
        $location.path('/login');
      }
      else {
        deferred.resolve();
      }
      return deferred.promise;
    };
  
    checkLoggedIn.$inject = ['$q', '$cookies', '$location'];

    $routeProvider
      .when('/', {
        template: require('./modules/dashboard/template/dashboard'),
        controller: 'DashboardController',
        resolve: {
          loggedin: checkLoggedIn
        }
      })
      .when('/devices', {
        template: require('./modules/fabric/template/device.html'),
        controller: 'deviceController',
        resolve: {
          loggedin: checkLoggedIn
        }
      })
      .when('/devices/:deviceId', {
        template: require('./modules/fabric/template/device_detail.html'),
        controller: 'deviceDetailController',
        resolve: {
          loggedin: checkLoggedIn
        }
      })
      .when('/endpoints', {
        template: require('./modules/fabric/template/endpoints.html'),
        controller: 'endPointController',
        resolve: {
          loggedin: checkLoggedIn
        }
      })
      .when('/intents', {
        template: require('./modules/fabric/template/intents.html'),
        controller: 'intentsController',
        resolve: {
          loggedin: checkLoggedIn
        }
      })
      .when('/account_manage', {
        template: require('./modules/login/template/account_manage.html'),
        controller: 'accountManageController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/fabric_summary', {
        template: require('./modules/fabric/template/fabric_summary.html'),
        controller: 'fabricSummaryController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/configuration_list', {
        template: require('./modules/configuration/template/configuration_list.html'),
        controller: 'ConfigurationListController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/configuration_history', {
        template: require('./modules/configuration/template/configuration_history.html'),
        controller: 'ConfigurationHistoryController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/alert', {
        template: require('./modules/alert/template/alert.html'),
        controller: 'AlertController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/inform', {
        template: require('./modules/alert/template/inform.html'),
        controller: 'InformController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/healthycheck', {
        template: require('./modules/alert/template/healthycheck.html'),
        controller: 'HealthyCheckController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/login', {
        template: require('./modules/login/template/login.html'),
        controller: 'loginController'
      }).
      when('/logout', {
        redirectTo: function(param, path, search){
          return '/login';
        }
      }).
      when('/log', {
        template: require('./modules/log/template/log.html'),
        controller: 'logController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
      when('/dhcp', {
        template: require('./modules/manage/template/dhcp.html'),
        controller: 'dhcpController',
        resolve: {
          loggedin: checkLoggedIn
        }
      }).
    when('/elasticsearch', {
      template: require('./modules/manage/template/elasticsearch.html'),
      controller: 'elasticsearchController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
      .otherwise({ redirectTo: '/' });

  }])
  .config(['$httpProvider', function($httpProvider){
    $httpProvider.useApplyAsync(true);
    $httpProvider.interceptors.push(['$cookies', '$location', '$q', function($cookies, $location, $q){
      return {
        request: function(config) {
          let useraccount = $cookies.get('useraccount');
          if (!useraccount) {
             $location.path('/login');
          }
          else{
            let crypto = require('crypto-js');
            let decodeBytes = crypto.AES.decrypt(useraccount.toString(), 'secret');
            let decodeData = decodeBytes.toString(crypto.enc.Utf8);
            let username = JSON.parse(decodeData).user_name;
            let password = JSON.parse(decodeData).password;
            config.headers['Authorization'] = "Basic " + window.btoa(username + ':' + password);  
          }
          return config;
        },
        response: function(response) {
          // do something on success
          let data = response.data;
          let url = response.config.url;
          if(url.indexOf('j_security_check') !== -1){
            if(data.indexOf('ONOS Login') === -1){
              return response;
            } else {
              $location.url('/login');
              response.status = 401;
              return $q.reject(response);
            }
          } else {
            return response;
          }


        },
        responseError: function(response) {
          if (response.status === 401)
            $location.url('/login');
          return $q.reject(response);
        }
      };
    }]);
  }]);
