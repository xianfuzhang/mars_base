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

    (function init () {
      scope.curIndex = 0;
      scope.showWizard = scope.showWizard || false;
      scope.wizardForm = {};

      scope.preStep = function() {
        scope.curIndex = scope.curIndex != 0 ? scope.curIndex - 1 : scope.curIndex;
      }

      scope.nextStep = function() {
        scope.curIndex = scope.curIndex < scope.steps.length ? scope.curIndex + 1 : scope.curIndex;
      }

      scope.switchTo = function($index) {
        scope.curIndex = $index;
      }

      scope.postCancel = function() {
        let result = scope.cancel();
        if (result == true) {
          scope.showWizard = false;
        } else {
          scope.errMsg = result.message || '';
        }
      }

      scope.postSubmit = function() {
        let result = scope.submit();
        if (result == true) {
          scope.showWizard = false;
        } else {
          scope.errMsg = result.message || '';
        }
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
