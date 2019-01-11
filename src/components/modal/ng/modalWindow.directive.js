export class modalWindow {
  static getDI () {
    return [
      '$timeout',
      'modalStack'
    ];
  }

  constructor (...args) {
    this.di = [];
    modalWindow.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'EA';
    this.transclude = true;
    this.template = require('../templates/window');
    this.scope = {
      index: '@',
      top: '=',
      left: '=',
      hiddenX: '='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs) {
    (function init () {
      angular.noop(element);
      scope.windowClass = attrs.windowClass || '';

      scope.close = (evt) => {
        let modal = this.di.modalStack.getTop();

        let _close = () =>{
          scope.isModalClosing =  true;
          this.di.$timeout(()=>{
            this.di.modalStack.dismiss(modal.key, {canceled: true});
            scope.isModalClosing =  false;
          },400);
        };

        if (modal && evt.target === evt.currentTarget) {
          evt.preventDefault();
          evt.stopPropagation();
          // this.di.modalStack.dismiss(modal.key, {canceled: true});
          _close();
        }
      };

      // trigger CSS transitions
      this.di.$timeout(() => {
        scope.animate = true;
      });
    }).call(this);
  }
}

modalWindow.$inject = modalWindow.getDI();
modalWindow.$$ngIsClass = true;
