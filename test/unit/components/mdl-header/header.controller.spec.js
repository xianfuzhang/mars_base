describe('mdl-header controller', function () {
  var headerCtrl, mockTranslateFilter;
  beforeEach(angular.mock.module('_', 'ngCookies', 'apis', 'mdlHeader'));

  beforeEach(function() {
    angular.mock.module(function($provide) {
      $provide.value('translateFilter', mockTranslateFilter);
    });
    mockTranslateFilter = function(value) {
      return value;
    };
  });

  beforeEach(inject(function ($rootScope, $controller) {
    var scope = $rootScope.$new();
    headerCtrl = $controller('headerCtrl', {'$scope': scope})
  }));

  it('should be defined', function () {
    expect(headerCtrl).toBeDefined();
  });
});