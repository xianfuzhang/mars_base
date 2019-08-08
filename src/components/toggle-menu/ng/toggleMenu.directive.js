/**
 * Created by wls on 2018/6/7.
 */
import {MDCRipple} from '@material/ripple';

export class toggleMenu {
  static getDI () {
    return [
      '$rootScope',
      '$timeout'
    ];
  }

  constructor (...args) {
    this.di = [];
    toggleMenu.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/toggleMenu');

    this.scope={
      displayLabel:'=',
      change:'&',
      value: '=ngModel'
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      scope.menuModel = {};
      scope.change = scope.change ||angular.noop;

      let addRipple = () =>{
        setTimeout(function () {
          let rippleList = document.querySelectorAll('.toggleMenu__button');
          rippleList.forEach(surface=>new MDCRipple(surface));
        })
      };

      let _formatDisplayLabel = (_displayLabel) =>{
        // let displayLabel = angular.copy(_displayLabel);
        _displayLabel.forEach(display=>{
          if(display.type && display.type === 'menu_list'){
            display['isExpand'] = false;
            display['style'] = {'height': '0px'};
          }
        });
        // return displayLabel;
      };

      _formatDisplayLabel(scope.displayLabel);
      // scope.menuModel.displayLabel = _formatDisplayLabel(scope.displayLabel);
      addRipple();
      scope.menu_click = (value, type) => {
        if (type === 'menu_list') {
          scope.displayLabel.forEach((display) => {
            if (display.value === value) {
              display.isExpand = !display.isExpand;
              display.style.height = display.isExpand ? display.list.length * 40 + 'px' : '0px';
            }
          })
        } else {
          scope.displayLabel.forEach((display) => {
            if(display.type && display.type === 'menu_list'){
              display.list.forEach(display=>{
                if (display.value === value) {
                  // scope.value = angular.copy(display);
                  scope.change({$value: angular.copy(display)});
                }
                return false;
              })
            } else {
              if (display.value === value) {
                // scope.value = angular.copy(display);
                scope.change({$value: angular.copy(display)});
                return false;
              }
            }
          });
        }
      };


      let unSubscribers = [];
      unSubscribers.push(scope.$watch('displayLabel', ()=>{
        _formatDisplayLabel(scope.displayLabel);
        addRipple();
      }));


      scope.$on('$destroy', () => {
        unSubscribers.forEach((unSubscribe) => {
          unSubscribe();
        });
      });







      // scope.menuModel = {
      //   // isMenu: scope.isMenu,
      //   isUser: scope.isUser,
      //   urls : scope.groupUrl.items,
      //   groupName: scope.groupUrl.group,
      //   isAct: false
      // };
      // if(scope.menuModel.isUser){
      //   scope.menuModel.groupName = "Nocsys";
      // }


    }).call(this);
  }
}

toggleMenu.$inject = toggleMenu.getDI();
toggleMenu.$$ngIsClass = true;
