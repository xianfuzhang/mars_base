export class mdlHeader{
  static getDI() {
    return [];
  }

  constructor(...args){
    this.di= {};
    mdlHeader.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.controller = 'headerCtrl';
    this.template = require('../template/header.html');
    this.link = (...args)  => this._link.apply(this, args);
  }

  _link(scope, element, attr){
  }
}

mdlHeader.$inject = mdlHeader.getDI();
mdlHeader.$$ngIsClass = true;