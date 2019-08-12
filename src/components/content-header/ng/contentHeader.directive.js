/**
 * Created by wls on 2018/6/7.
 */
import {MDCTemporaryDrawer} from '@material/drawer';

export class contentHeader {
  static getDI () {
    return [
      '$rootScope',
      '_'
    ];
  }

  constructor (...args) {
    this.di = [];
    contentHeader.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.transclude = true;
    this.template = require('../template/content_header');

    this.scope = {
      bigTitle : '@',
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init(){

      let unSubscribes = [];

      scope.contentHeaderModel = {
        'title': scope.bigTitle
      };

      unSubscribes.push(scope.$watch('bigTitle', (newValue) => {
        scope.contentHeaderModel.title = newValue;
      }));

      scope.$on('$destroy', () => {
        this.di._.each(unSubscribes, (unsubscribe) => {
          unsubscribe();
        });
      });

    }).call(this);
  }
}

contentHeader.$inject = contentHeader.getDI();
contentHeader.$$ngIsClass = true;