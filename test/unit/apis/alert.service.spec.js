describe('API services', function() {

  describe('alert service', function () {
    var alertService, mockTranslateFilter;

    //service 依赖的services所在module需要先引入
    beforeEach(angular.mock.module('_'));
    beforeEach(angular.mock.module('apis'));

    //this.di.filter('translate')使用下面方式注入translate service
    beforeEach(function() {
      angular.mock.module(function($provide) {
        $provide.value('translateFilter', mockTranslateFilter);
      });
      mockTranslateFilter = function(value) {
        return value;
      };
    });

    //注入service两种方式
    /*beforeEach(inject(function (_$injector_) {
      alertService = _$injector_.get('alertService');
    }));*/
    beforeEach(inject(function (_alertService_) {
      alertService = _alertService_;
    }));

    it('should be defined', function () {
      expect(alertService).toBeDefined();
    });

    it('should have a table schema function', function () {
      expect(angular.isFunction(alertService.getAlertTableSchema)).toBe(true);
    });

    it('should return array from table schema function', function () {
      var result = alertService.getAlertTableSchema();
      expect(result.length).toBe(5);
    });
  });

});