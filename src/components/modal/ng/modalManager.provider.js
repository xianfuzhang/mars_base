/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
export class modalManager {
  static getDI () {
    return [
      /*'$injector',
      '$rootScope',
      '$q',
      '$http',
      '$templateCache',
      '$controller',
      'modalStack'*/
    ];
  }

  constructor (...args) {
    this.di = [];
    modalManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.options = {
      backdrop: true, // can be also false or 'static'
      keyboard: true
    };

    this.$get = ['$injector',
      '$rootScope',
      '$q',
      '$http',
      '$templateCache',
      '$controller',
      'modalStack',
      ($injector, $rootScope, $q, $http, $templateCache, $controller, modalStack) => {
      let modalManager = {};

      let getTemplatePromise = (options) => {
        if (options.template) {
          return $q.when(options.template);
        }

        return $http.get(options.templateUrl, {cache: $templateCache}).then((result) => {
          return result.data;
        });
      };

      let getResolvePromises = (resolves) => {
        let promisesArr = [];
        angular.forEach(resolves, (value) => {
          if (angular.isFunction(value) || angular.isArray(value)) {
            promisesArr.push($q.when($injector.invoke(value)));
          }
        });
        return promisesArr;
      };

      modalManager.open = (modalOptions) => {
        let modalResultDeferred = $q.defer();
        let modalOpenedDeferred = $q.defer();
          // prepare an instance of a modal to be injected into controllers and returned to a caller
        let modalInstance = {
            result: modalResultDeferred.promise,
            opened: modalOpenedDeferred.promise,
            close: (result) => {
              modalStack.close(modalInstance, result);
            },
            dismiss: (reason) => {
              modalStack.dismiss(modalInstance, reason);
            }
          };
        //modal弹出层目前仅允许一个,阻止多次弹出modal  
        if (modalStack.getOpenedWindowsLength() > 0) {
          modalResultDeferred.resolve();
          return modalInstance;
        }  
        let templateAndResolvePromise;

        // merge and clean up options
        modalOptions = angular.extend({}, this.options, modalOptions);
        modalOptions.resolve = modalOptions.resolve || {};

        // verify options
        if (!modalOptions.template && !modalOptions.templateUrl) {
          throw new Error('One of template or templateUrl options is required.');
        }

        templateAndResolvePromise =
          $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));

        templateAndResolvePromise.then((tplAndVars) => {
          let modalScope = (modalOptions.scope || $rootScope).$new();
            // ctrlInstance,
          let ctrlLocals = {};
          let resolveIter = 1;
          modalScope.$close = modalInstance.close;
          modalScope.$dismiss = modalInstance.dismiss;
          modalScope.hiddenX = modalOptions.hiddenX;
          // controllers
          if (modalOptions.controller) {
            ctrlLocals.$scope = modalScope;
            ctrlLocals.$modalInstance = modalInstance;
            angular.forEach(modalOptions.resolve, (value, key) => {
              angular.noop(value);
              ctrlLocals[key] = tplAndVars[resolveIter];
              resolveIter += 1;
            });

            $controller(modalOptions.controller, ctrlLocals);
          }
          
          modalStack.open(modalInstance, {
            scope: modalScope,
            deferred: modalResultDeferred,
            content: tplAndVars[0],
            backdrop: modalOptions.backdrop,
            keyboard: modalOptions.keyboard,
            windowClass: modalOptions.windowClass,
            windowTemplateUrl: modalOptions.windowTemplateUrl,
            size: modalOptions.size,
            top: modalOptions.top,
            left: modalOptions.left
          });
        }, (reason) => {
          modalResultDeferred.reject(reason);
        });

        templateAndResolvePromise.then(() => {
          modalOpenedDeferred.resolve(true);
        }, () => {
          modalOpenedDeferred.reject(false);
        });

        return modalInstance;
      };

      return modalManager;
    }];
  }
}

modalManager.$inject = modalManager.getDI();
modalManager.$$ngIsClass = true;
