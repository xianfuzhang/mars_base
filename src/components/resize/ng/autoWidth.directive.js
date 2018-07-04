export class autoWidth{
  static getDI(){
    return ['$log', '$window'];
  }
  constructor(...args){
    this.di = {};
    autoWidth.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope={};
    this.restrict = 'A';
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attr) {
    scope.$watch(() => {
      return {
        width: element[0].clientWidth
      };
    }, ()=> {
      this.di.$log.info(element[0].clientWidth);
    }, true);

    element.on('resize', (event, ui) => {
      this.di.$log.info(ui);
    });

    /*angular.element(this.di.$window).bind('autoWidth', function () {
      this.di.$log.info('width=' +this.di.$window.innerWidth);
      this.di.$log.info('height'+ this.di.$window.innerHeight);
      scope.$apply();
    });*/
  }
}

autoWidth.$inject = autoWidth.getDI();
autoWidth.$$ngIsClass = true;