/**
 * modalTransition service provides a consistent interface to trigger CSS 3 transitions
 * and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
export class modalTransition {
  static getDI () {
    return [
      '$q',
      '$timeout',
      '$rootScope',
      '$document'
    ];
  }

  constructor (...args) {
    this.di = [];
    modalTransition.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    // Work out the name of the transitionEnd event
    this.transElement = this.di.$document[0].createElement('trans'); // NOTE: angular.element doesn't seem to work
    this.transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
      };
    this.animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
      };

    this.modalTransition = (element, trigger, options) => {
      options = options || {};
      let deferred = this.di.$q.defer();
      let transitionEndHandler;
      let endEventName = modalTransition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

      transitionEndHandler = () => { // (event)
        this.di.$rootScope.$apply(() => {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };

      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }

      // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
      this.di.$timeout(() => {
        if (angular.isString(trigger)) {
          element.addClass(trigger);
        } else if (angular.isFunction(trigger)) {
          trigger(element);
        } else if (angular.isObject(trigger)) {
          element.css(trigger);
        }
        // If browser does not support transitions, instantly resolve
        if (!endEventName) {
          deferred.resolve(element);
        }
      });

      // Add our custom cancel function to the promise that is returned
      // We can call this if we are about to run a new transition, which we know will prevent this transition
      // from ending, i.e. it will therefore never raise a transitionEnd event for that transition
      deferred.promise.cancel = () => {
        if (endEventName) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };

      return deferred.promise;
    };

    this.modalTransition.transitionEndEventName = this.findEndEventName(this.transitionEndEventNames);
    this.modalTransition.animationEndEventName = this.findEndEventName(this.animationEndEventNames);
  }

  findEndEventName (endEventNames) {
    let name;
    for (name in endEventNames) {
      if (endEventNames.hasOwnProperty(name)) {
        if (this.transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
  }
}

modalTransition.$inject = modalTransition.getDI();
modalTransition.$$ngIsClass = true;
