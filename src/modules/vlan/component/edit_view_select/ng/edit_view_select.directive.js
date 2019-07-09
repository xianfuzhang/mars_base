import {MDCRipple} from '@material/ripple';
export class EditViewSelectDirective {
  static getDI () {
    return [
      '$document',
      '$rootScope',
      '$window',
      '_'
    ];
  }

  constructor (...args) {
    this.di = [];
    EditViewSelectDirective.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/edit_view_select');
    this.scope = {
      typeModel: '=',
      viewChange: '&',
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {

      let rippleList = document.querySelectorAll('.select_ripple');
      rippleList.forEach(surface=>new MDCRipple(surface));


      // scope.typeModel
      scope.model = {
        isShow: false
      }

      scope.anchorClick = () =>{
        scope.model.isShow = !scope.model.isShow;
      }

      let unsubscribers = [];
      // unsubscribers.push(this.di.$rootScope.$on('show_chart_tooltip',(event, param)=>{
      //
      // }));

      scope.setViewType = (type) =>{
        if(scope.typeModel.label !== type){
          scope.typeModel.label = type;
          scope.viewChange = scope.viewChange || angular.noop;
          scope.viewChange();
        }

        scope.model.isShow = !scope.model.isShow;
        // if(scope.model.isShow){
        //   scope.model.isShow = false;
        // }
      };


      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });
      });



    }).call(this);
  }
}

EditViewSelectDirective.$inject = EditViewSelectDirective.getDI();
EditViewSelectDirective.$$ngIsClass = true;
