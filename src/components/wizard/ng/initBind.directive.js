/**
 * Created by wls on 2018/6/7.
 */

export class initBind {
  static getDI () {
    return [
      '$compile',
    ];
  }

  constructor (...args) {
    this.di = [];
    initBind.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.restrict = 'A';
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attr) {
    (function init () {
      let compile =  this.di.$compile;
      attr.$observe('ngBindHtml',function(){
        if(attr.ngBindHtml){
          compile(element[0].children)(scope);
        }
      })
    }).call(this);
  }
}

initBind.$inject = initBind.getDI();
initBind.$$ngIsClass = true;
