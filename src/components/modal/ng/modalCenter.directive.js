/*global angular, document*/
/**
 * Main scope of this directive is to center an absolutely/fixed position modal in the middle of the screen.
 * This directive will consider window size and element size resize and position accordingly
 *
 */
export class modalCenter {
  static getDI () {
    return [
      '$window',
      '$document',
      '$compile',
      '$timeout'
    ];
  }

  constructor (...args) {
    this.di = [];
    modalCenter.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.restrict = 'EA';
    this.priority = -10;

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      let w = angular.element(this.di.$window);
      let windowHeight = this.di.$window.innerHeight;
      let oldModalHeight = 0;
      let modalHeight;
      let modalWidth;
      let body = this.di.$document.find('body').eq(0);
      let container = angular.element('<div class="modal-container" ng-style="{\'z-index\': 1050 + index*10}"></div>');
      let unsubscribers = [];

      scope.index = parseInt(element.attr('index'), 10);
      // move the modal into its own container
      container = this.di.$compile(container)(scope);
      container.append(element);
      body.prepend(container);

      scope.getWindowHeight = () => {
        return this.di.$window.innerHeight;
      };

      scope.getModalHeight = () => {
        let dim = element[0].getBoundingClientRect();
        return dim.height;
      };
      scope.getModalWidth = () => {
        let dim = element[0].getBoundingClientRect();
        return dim.width;
      };

      scope.reposition = () => {
        let top;
        let percentageFromTop = 0.3;
        modalHeight = modalHeight || scope.getModalHeight();
        modalWidth = modalWidth || scope.getModalWidth();
        if (!scope.top) {
          if (modalHeight < windowHeight / 8) {
            percentageFromTop = 0.2;
          }
          if (windowHeight >= modalHeight) {
            top = (windowHeight - modalHeight) * percentageFromTop;
            element.css('top', top + 'px');
          } else {
            element.css('top', '0px');
          }
        } else {
          element.css('top', scope.top + 'px');
        }
        if (scope.left) {
          element.css('left', scope.left + 'px');
        }
        // force reflow
        angular.noop(element[0].clientHeight);
      };

      scope.onWindowResize = () => {
        windowHeight = this.di.$window.innerHeight;
        scope.reposition();
      };

      scope._checkHeightChange = () => {
        modalHeight = scope.getModalHeight();
        // is there a height difference ?
       /* if (Math.abs(modalHeight - oldModalHeight) >= 5) {
          // yes
          scope.reposition();
        }*/
        oldModalHeight = modalHeight;
      };

      unsubscribers.push(scope.$watch(() => {
        // wait for layout - notice o, false - don't trigger a digest
        this.di.$timeout(scope._checkHeightChange, 0, false);
        return 0;
      }, (height, oldHeight) => {
        if (Math.abs(height - oldHeight) >= 5) {
          scope.reposition();
        }
      }));

      w.on('resize', scope.onWindowResize);

      // reposition after digest/layout
      this.di.$timeout(scope.reposition, 0, false);

      scope.$on('$destroy', () => {
        w.off('resize', scope.onWindowResize);
        container.remove();
      });
    }).call(this);
  }
}

modalCenter.$inject = modalCenter.getDI();
modalCenter.$$ngIsClass = true;
