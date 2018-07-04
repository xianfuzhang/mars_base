export class resize{
  static getDI(){
    return ['$log', '$window'];
  }
  constructor(...agrs){
    this.di = {};
    resize.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope={};
    this.restrict = 'A';
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attr) {

    scope.$watch(() => {
      return {

      };
    }, ()=> {
      this.di.$log.info(scope);
    }, true);

    angular.element(this.di.$window).bind('resize', function () {
      this.di.$log.info('width=' +this.di.$window.innerWidth);
      this.di.$log.info('height'+ this.di.$window.innerHeight);
      scope.$apply();
    });
  }
}

resize.$inject = resize.getDI();
resize.$$ngIsClass = true;