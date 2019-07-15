export class tableRenderReady {
  static getDI() {
    return [
      '$timeout'
    ];
  }
  constructor(...args) {
    this.di = {};
    tableRenderReady.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.restrict = 'A';
    this.link = (...args) => this._link.apply(this, args);
  }
  _link(scope, element, attrs, ctrl){
    if (scope.$last === true) {
      this.di.$timeout(function () {
        scope.$emit('table-render-ready');
      });
    }
  }
}
tableRenderReady.$inject = tableRenderReady.getDI();
tableRenderReady.$$ngIsClass = true;