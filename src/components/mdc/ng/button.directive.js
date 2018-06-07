import {MDCRipple} from '@material/ripple';

export class mdlButton {
  static getDI() {
    return [];
  }
  constructor(...args){
    this.di = {};
    mdlButton.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.mdcRipple = MDCRipple;
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, elem) {
    elem.addClass('mdc-button mdc-ripple-surface');
    const ripple = this.mdcRipple.attachTo(elem[0]);
    scope.$on('destroy', function() {
      ripple.destroy();
    });
  }
}

mdlButton.$inject = mdlButton.getDI();
mdlButton.$$ngIsClass = true;