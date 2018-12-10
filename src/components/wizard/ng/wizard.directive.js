/**
 * Created by wls on 2018/6/7.
 */

export class Wizard {
  static getDI () {
    return [
      '$compile',
      '$sce',
      '$filter'
    ];
  }

  constructor (...args) {
    this.di = [];
    Wizard.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/wizard');
    this.scope = false;
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope) {
    let unsubscribers = [];

    let init = () => {
      scope.curIndex = 0;
      scope.errorMessage = '';
      scope.showWizard = scope.showWizard || false;
      scope.loading = false;
      scope.wizardStyle = scope.wizardHeight || {};
      scope.wizardForm = {};
    }
    
    init();
  
    scope.preStep = function() {
      let preIndex = scope.curIndex != 0 ? scope.curIndex - 1 : scope.curIndex;
      if(typeof scope.stepValidation == 'function' && preIndex != scope.curIndex) {
        // validate the step form by parent controller scope
        let res = scope.stepValidation(scope.curIndex + 1, preIndex + 1);
        if(res.valid == false) {
          scope.errorMessage = res.errorMessage;
        } else {
          scope.curIndex = preIndex;
          scope.errorMessage = '';
        }
      } else {
        scope.curIndex = preIndex;
      }
    }

    scope.nextStep = function() {
      let nextIndex = scope.curIndex < scope.steps.length ? scope.curIndex + 1 : scope.curIndex;
      if(typeof scope.stepValidation == 'function' && nextIndex != scope.curIndex) {
        // validate the step form by parent controller scope
        let res = scope.stepValidation(scope.curIndex + 1, nextIndex + 1);
        if(res.valid == false) {
          scope.errorMessage = res.errorMessage;
        } else {
          scope.curIndex = nextIndex;
          scope.errorMessage = '';
        }
      } else {
        scope.curIndex = nextIndex;
      }
    }

    scope.switchTo = function($index) {
      let nextIndex = $index;
      if(typeof scope.stepValidation == 'function' && nextIndex != scope.curIndex) {
        // validate the step form by parent controller scope
        let res = scope.stepValidation(scope.curIndex + 1, nextIndex + 1);
        if(res.valid == false) {
          scope.errorMessage = res.errorMessage;
        } else {
          scope.curIndex = nextIndex;
          scope.errorMessage = '';
        }
      } else {
        scope.curIndex = nextIndex;
      }
    }

    scope.postCancel = function() {
      scope.cancel()
        .then((result) => {
          if (result.valid == false) {
            scope.errorMessage = result.errorMessage || '';
          } else {
            scope.showWizard = false;
            scope.$apply();
          }
        });
    }

    scope.postSubmit = function() {
      scope.loading = true;
      scope.submit()
        .then((result) => {
          scope.loading = false;
          
          if (result.valid == false) {
            scope.errorMessage = result.errorMessage || '';
          } else {
            scope.showWizard = false;
          }

          scope.$apply();
        });
    }

    const sce = this.di.$sce;
    scope.trustAsHtml = function(string) {
      return sce.trustAsHtml(string);
    };
    
    unsubscribers.push(scope.$watch('showWizard', (newVal) => {
      if(newVal === true) {
        init()
      }
    }));

    scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }
}

Wizard.$inject = Wizard.getDI();
Wizard.$$ngIsClass = true;
