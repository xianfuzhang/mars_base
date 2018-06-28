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
    this.scope = {
      title: '=',
      steps: '=',
      allowSkip: '=',
      showWizard: '=',
      beforeCancel: '&',
      beforeSubmit: '&'
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope) {
    let unsubscribers = [];

    (function init () {
      scope.curIndex = 0;
      scope.showWizard = scope.showWizard || false;

      scope.preStep = function() {
        scope.curIndex = scope.curIndex != 0 ? scope.curIndex - 1 : scope.curIndex;
      }

      scope.nextStep = function() {
        scope.curIndex = scope.curIndex < scope.steps.length ? scope.curIndex + 1 : scope.curIndex;
      }

      scope.switchTo = function($index) {
        scope.curIndex = $index;
      }

      scope.cancel = function() {
        let formModel = {};
        for(let key in scope.wizardForm) {
          if (!key.startsWith('$')) {
            formModel[key] = scope.wizardForm[key].$viewValue;
          }
        }

        if (scope.beforeCancel({formData: formModel}))
          scope.showWizard = false;
      }

      scope.submit = function() {
        let formModel = {};
        for(let key in scope.wizardForm) {
          if (!key.startsWith('$')) {
            formModel[key] = scope.wizardForm[key].$viewValue;
          }
        }

        if (scope.beforeSubmit({formData: formModel}))
            scope.showWizard = false;
      }

      const sce = this.di.$sce;
      scope.trustAsHtml = function(string) {
        return sce.trustAsHtml(string);
      };

      scope.$on('$destroy', () => {
        unsubscribers.forEach((cb) => {
          cb();
        });
      });
    }).call(this);
  }
}

Wizard.$inject = Wizard.getDI();
Wizard.$$ngIsClass = true;
