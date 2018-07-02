export class mdlButton {
  static getDI() {
    return ['$log', '$compile'];
  }
  constructor(...args){
    this.di = {};
    mdlButton.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.scope = {
      disabled: '=',
      ngClick: '&'
    };
    this.template = require('../templates/button.html');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attr) {
    scope.name = attr.iconName;
    let disabled = scope.disabled || false;
    if (disabled) {
      element.attr('disabled', true);
    }
    if (attr.classList) {
      let classList = attr.classList.split(" ");
      classList.forEach((cls) => {
        element.addClass(cls);
      });
    }

    scope.$watch('disabled', () => {
      if (scope.disabled) {
        element.attr('disabled', true);
      }
      else{
        element.attr('disabled', false);
      }
    }, true);
  }
}

mdlButton.$inject = mdlButton.getDI();
mdlButton.$$ngIsClass = true;