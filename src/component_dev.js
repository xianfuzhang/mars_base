import 'angular';
import 'angular-cookies';
import 'angular-route';
import 'angular-translate';
//import 'angular-material';

import 'lodashService';

import 'login';
import 'nav';
import 'test';
import 'fabric';
import 'switches';
import 'logical';
import 'tenants';
import 'menu';

import 'mdc';

angular
  .module('marsApp', [
    'ngRoute',
    'ngCookies',
    //'ngMaterial',
    'pascalprecht.translate',
    '_',
    'test',
    'login',
    'nav',
    'fabric',
    'switches',
    'logical',
    'tenants',
    'mdc',
    'menu'
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
        template: require('./test/component/template/test'),
        controller: 'TestController'
      })
      .otherwise({ redirectTo: '/' });
  }]);

/*
angular.element(document).ready(function () {
  angular.bootstrap(document, ['marsApp']);
});*/
