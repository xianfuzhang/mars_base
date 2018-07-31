export class mdlHeader{
  static getDI() {
    return ['$log'];
  }

  constructor(...args){
    this.di= {};
    mdlHeader.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    //this.controller = 'headerCtrl';
    this.template = require('../template/header.html');
    this.link = (...args)  => this._link.apply(this, args);
  }

  _link(scope, element, attr){
    //this.di.$log.info('mdl-header directive');
  }
}

mdlHeader.$inject = mdlHeader.getDI();
mdlHeader.$$ngIsClass = true;