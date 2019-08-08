describe('Login Module', function() {

  describe('login controller', function () {
    var loginCtrl, mockTranslateFilter;

    //loginController ==> loginDataManager ==> $cookies
    beforeEach(angular.mock.module('_', 'apis', 'login', 'ngCookies'));

    //this.di.filter('translate')使用下面方式注入translate service
    beforeEach(function() {
      angular.mock.module(function($provide) {
        $provide.value('translateFilter', mockTranslateFilter);
      });
      mockTranslateFilter = function(value) {
        return value;
      };
    });

    //controller的 DI只需要传入scope即可
    beforeEach(inject(function ($rootScope, $controller) {
      var scope = $rootScope.$new();
      loginCtrl = $controller('loginController', {$scope: scope});
    }));

    it('should be defined', function () {
      expect(loginCtrl).toBeDefined();
    });

  });
});