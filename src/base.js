
function setLanguage($q) {
  return function (options) {
    let deferred = $q.defer();
    let data = require('../public/' + options.key + '.json');
    deferred.resolve(data);
    return deferred.promise;
  }
}

function configTranslate($translateProvider) {
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
}

function configRouterfunction ($routeProvider,
                               ) {
  var checkLoggedIn = function($q, $cookies, $location){
    let deferred = $q.defer(),
      useraccount = $cookies.get('useraccount'),
      menu = window.localStorage['menus'],
      exists = false;
    if (menu) {
      let groups = JSON.parse(menu).groups;
      let url = $location.path();
      if (url === '/') {
        exists = true;
      }
      else {
        for(let i=0; i< groups.length; i++) {
          for(let j=0; j< groups[i].items.length; j++) {
            if (groups[i].items[j].url === url || url.indexOf(groups[i].items[j].url) > -1) {
              exists = true;
              break;
            }
          }
        }
      }
    }
    
    if (!useraccount) {
      $cookies.remove('useraccount');
      window.localStorage.removeItem('menus');
      $location.path('/login');
      deferred.reject();
    }
    else if (useraccount && !exists) {
      $location.path('/');
      deferred.resolve();
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
    })
    .when('/fabric_summary', {
    template: require('./modules/fabric/template/fabric_summary.html'),
    controller: 'fabricSummaryController',
    resolve: {
      loggedin: checkLoggedIn
    }
  })
    .when('/configuration_list', {
    template: require('./modules/configuration/template/configuration_list.html'),
    controller: 'ConfigurationListController',
    resolve: {
      loggedin: checkLoggedIn
    }
  })
    .when('/configuration_history', {
      template: require('./modules/configuration/template/configuration_history.html'),
      controller: 'ConfigurationHistoryController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/alert', {
      template: require('./modules/alert/template/alert.html'),
      controller: 'AlertController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/inform', {
      template: require('./modules/alert/template/inform.html'),
      controller: 'InformController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/healthycheck', {
      template: require('./modules/alert/template/healthycheck.html'),
      controller: 'HealthyCheckController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/login', {
      template: require('./modules/login/template/login.html'),
      controller: 'loginController'
    })
    .when('/logout', {
      redirectTo: function(param, path, search){
        return '/login';
      }
    })
    .when('/log', {
      template: require('./modules/log/template/log.html'),
      controller: 'logController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/dhcp', {
      template: require('./modules/manage/template/dhcp.html'),
      controller: 'dhcpController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/ntp', {
      template: require('./modules/manage/template/ntp.html'),
      controller: 'ntpController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/uplinks', {
      template: require('./modules/fabric/template/uplink.html'),
      controller: 'upLinkController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/elasticsearch', {
      template: require('./modules/manage/template/elasticsearch.html'),
      controller: 'elasticsearchController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/tenant', {
      template: require('./modules/logical/template/tenant.html'),
      controller: 'TenantController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/segment', {
      template: require('./modules/logical/template/segment.html'),
      controller: 'segmentController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/qos', {
      template: require('./modules/logical/template/qos.html'),
      controller: 'qosCtrl',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/egp', {
      template: require('./modules/logical/template/egp.html'),
      controller: 'egpCtrl',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/tenant/:tenantName', {
      template: require('./modules/logical/template/tenantDetail.html'),
      controller: 'tenantDetailCtrl',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/tenant/:tenantName/segment/:segmentName', {
      template: require('./modules/logical/template/segment_detail.html'),
      controller: 'SegmentDetailController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/system_info', {
      template: require('./modules/manage/template/system_info.html'),
      controller: 'systemInfoController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/application', {
      template: require('./modules/manage/template/application.html'),
      controller: 'applicationController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
		.when('/license', {
			template: require('./modules/manage/template/license.html'),
			controller: 'licenseController',
			resolve: {
				loggedin: checkLoggedIn
			}
		})
    .otherwise({ redirectTo: '/' });
}

function configHttpProvider($httpProvider){
  $httpProvider.useApplyAsync(true);
  $httpProvider.interceptors.push(['$cookies', '$location', '$q', function($cookies, $location, $q){
    return {
      request: function(config) {
        let useraccount = $cookies.get('useraccount');
        if(config.url.indexOf('login') !== -1){
          return config;
        } else {
          if (!useraccount) {
            $location.path('/login');
            return $q.reject(config);
          }
          else{
            let crypto = require('crypto-js');
            let decodeBytes = crypto.AES.decrypt(useraccount.toString(), 'secret');
            let decodeData = decodeBytes.toString(crypto.enc.Utf8);
            let username = JSON.parse(decodeData).user_name;
            let password = JSON.parse(decodeData).password;
            config.headers['Authorization'] = "Basic " + window.btoa(username + ':' + password);

            let expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + 20*60*1000); //cookies20分钟过期
            $cookies.put('useraccount', useraccount, {expires: expireDate});
          }
        }
        return config;
      },
      response: function(response) {
        return response;
      },
      responseError: function(response) {
        if (response.status === 401)
          $location.url('/login');
        return $q.reject(response);
      }
    };
  }]);
}

function mainCtrl($scope, $rootScope) {
  const CONST_LOCAL_STORAGE_KEY = 'userPrefs__';
  const CONST_THEME = 'theme';
  let theme =  window.localStorage.getItem(CONST_LOCAL_STORAGE_KEY + CONST_THEME);
  if(theme === 'theme_default' || theme === 'theme_dark' ){
    $scope.theme = theme;
  }else {
    $scope.theme = 'theme_default';
    window.localStorage.setItem(CONST_LOCAL_STORAGE_KEY + CONST_THEME, $scope.theme);
  }
  
  let unsubscribers = [];
  unsubscribers.push($rootScope.$on('change-theme', ($event, theme) => {
    $scope.theme = theme;
    window.localStorage.setItem(CONST_LOCAL_STORAGE_KEY + CONST_THEME, theme);
    
    window.location.reload();
  }));
  
  $scope.$on('$destroy', () => {
    unsubscribers.forEach((cb) => {
      cb();
    });
  });
}

export {setLanguage, configTranslate, configRouterfunction, configHttpProvider, mainCtrl}
