/**
 * Created by wls on 2018/6/7.
 */

export class marSection {
  static getDI () {
    return [
      '$rootScope'
    ];
  }

  constructor (...args) {
    this.di = [];
    marSection.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.transclude = true;
    this.template = require('../template/mar_section');

    this.scope = {
      title : '@',
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      // this.isFold =  false;
      // this.showOrNot

      scope.sectionModel = {
        'title': scope.title,
        'showStyle': {'display':'block'},
        'isFold': false
      };


      scope.foldAndNot = (event) =>{
        if(scope.sectionModel.isFold){
          scope.sectionModel.showStyle = {'display':'block'}
        } else {
          scope.sectionModel.showStyle = {'display':'none'}
        }
        // this.isFold = !this.isFold;
        scope.sectionModel.isFold = !scope.sectionModel.isFold;
      }


    }).call(this);
  }
}

marSection.$inject = marSection.getDI();
marSection.$$ngIsClass = true;
