
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

      let url = $location.path();
      let search = $location.search();

      if(url !== '/'){
        url = window.btoa(url);
        search = window.btoa(JSON.stringify(search));
        $location.path('/login').search({lastp: url,lasts:search});
      } else {
        $location.path('/login');
      }
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
    .when('/hosts', {
      template: require('./modules/fabric/template/hosts.html'),
      controller: 'hostController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/lbd', {
      template: require('./modules/fabric/template/lbd.html'),
      controller: 'lbdCtrl',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/logical_port', {
      template: require('./modules/fabric/template/interface_group.html'),
      controller: 'interfaceGroupController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/host_segment', {
      template: require('./modules/fabric/template/host_segment.html'),
      controller: 'hostSegmentController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/dhcp_relay', {
      template: require('./modules/fabric/template/dhcp_relay.html'),
      controller: 'dhcpRelayController',
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
    .when('/dhcp_snoop', {
      template: require('./modules/function/template/snooping.html'),
      controller: 'snoopCtrl',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/acl', {
      template: require('./modules/function/template/acl.html'),
      controller: 'aclCtrl',
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
    .when('/sflow', {
      template: require('./modules/fabric/template/sflows.html'),
      controller: 'sFlowsController',
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
    .when('/traffic_segment', {
      template: require('./modules/function/template/segment.html'),
      controller: 'trafficCtrl',
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
    .when('/analyzer', {
      template: require('./modules/manage/template/analyzer.html'),
      controller: 'analyzerController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/storm_control', {
      template: require('./modules/fabric/template/storm.html'),
      controller: 'stormController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/monitor', {
      template: require('./modules/fabric/template/monitor.html'),
      controller: 'monitorController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    .when('/vlan_all', {
      template: require('./modules/topo/template/vlan_all.html'),
      controller: 'vlanAllController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    // .when('/vlan', {
    //   template: require('./modules/fabric/template/vlan.html'),
    //   controller: 'vlanController',
    //   resolve: {
    //     loggedin: checkLoggedIn
    //   }
    // })
    // .when('/vlan_ip', {
    //   template: require('./modules/vlan/template/ipsubnet.html'),
    //   controller: 'vlanIpSubnetController',
    //   resolve: {
    //     loggedin: checkLoggedIn
    //   }
    // })
    // .when('/vlan_dynamic', {
    //   template: require('./modules/vlan/template/dynamic.html'),
    //   controller: 'dynamicVlanController',
    //   resolve: {
    //     loggedin: checkLoggedIn
    //   }
    // })
    // .when('/vlan_guest', {
    //   template: require('./modules/vlan/template/guest.html'),
    //   controller: 'guestVlanCtrl',
    //   resolve: {
    //     loggedin: checkLoggedIn
    //   }
    // })
    .when('/time_range', {
      template: require('./modules/manage/template/timeRange.html'),
      controller: 'timeRangeController',
      resolve: {
        loggedin: checkLoggedIn
      }
    })
    // .when('/vlan_voice', {
    //   template: require('./modules/vlan/template/voice-vlan.html'),
    //   controller: 'voiceVlanCtrl',
    //   resolve: {
    //     loggedin: checkLoggedIn
    //   }
    // })
    .when('/poe', {
      template: require('./modules/function/template/poe.html'),
      controller: 'poeController',
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
            // $location.path('/login');
            let url = $location.path();
            let search = $location.search();
            if(url !== '/'){
              if(url.startsWith('/login')){
                $location.path('/login');
              } else {
                url = window.btoa(url);
                search = window.btoa(JSON.stringify(search));
                $location.path('/login').search({lastp: url, lasts: search});
              }
            } else {
              $location.path('/login');
            }
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
    $scope.theme = 'theme_dark';
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


function configDateLocaleProvider($mdDateLocaleProvider, $translateProvider){
  // console.log(
  // let res = $translateProvider.use('MODULE.HEADER.FABRIC.DHCPRELAY')
  console.log($translateProvider.preferredLanguage());
    // .then(res=>{
    // "use strict";
    // console.log(res)
  //
  // })
  //
  // console.log(res)


  $mdDateLocaleProvider.months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  $mdDateLocaleProvider.shortMonths = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  $mdDateLocaleProvider.days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  $mdDateLocaleProvider.shortDays = ['日', '一', '二', '三', '四', '五', '六'];

  $mdDateLocaleProvider.firstDayOfWeek = 7;

  // $mdDateLocaleProvider.dates = [1, 2, 3, 4, 5, 6, ...];

  $mdDateLocaleProvider.parseDate = function (dateString) {
    let d_arr = dateString.split('-');
    if (d_arr.length !== 3) {
      return new Date(NaN);
    }
    if (parseInt(d_arr[0]) > 2100 || parseInt(d_arr[0]) < 2000) {
      return new Date(NaN);
    }
    if (parseInt(d_arr[1]) - 1 < 0 || parseInt(d_arr[1]) - 1 > 11) {
      return new Date(NaN);
    }

    if (parseInt(d_arr[2]) < 0 || parseInt(d_arr[2]) > 31) {
      return new Date(NaN);
    }

    let date = new Date();
    date.setFullYear(parseInt(d_arr[0]));
    date.setMonth(parseInt(d_arr[1]) - 1);
    date.setDate(parseInt(d_arr[2]));
    if (angular.isDate(date)) {
      return date;
    } else {
      return new Date(NaN);
    }
  };

  $mdDateLocaleProvider.formatDate = function (date) {
    if(!date){
      return '';
    }
    let year = date.getFullYear();
    let month = date.getMonth() + 1 < 10 ? '0' + ( date.getMonth() + 1 ) : (date.getMonth() + 1) + '';
    let dates = date.getDate() < 10 ? '0' + date.getDate() : date.getDate() + '';
    return year + '-' + month + '-' + dates;
  };

  $mdDateLocaleProvider.isDateComplete = function (dateString) {
    dateString = dateString.trim();

    let re = new RegExp('^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}$');
    return re.test(dateString);
  };
}

export {setLanguage, configTranslate, configRouterfunction, configHttpProvider, configDateLocaleProvider, mainCtrl}
