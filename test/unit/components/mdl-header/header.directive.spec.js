describe('mdl-header directive', function () {
  var  $compile, $rootScope;

  //加载directive所在module
  beforeEach(angular.mock.module('_', 'ngCookies', 'apis', 'mdlHeader'));

  beforeEach(function() {
    angular.mock.module(function($provide) {
      $provide.value('translateFilter', mockTranslateFilter);
    });
    mockTranslateFilter = function(value) {
      return value;
    };
  });

  beforeEach(inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should create html', function () {
    var elem = $compile("<mdl-header></mdl-header>")($rootScope);
    $rootScope.$digest();
    expect(elem.html()).toContain("navbar");
  })
});