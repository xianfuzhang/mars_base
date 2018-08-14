/**
 * Created by wls on 2018/7/26.
 */
import {MDCMenu} from '@material/menu';
import {Corner} from '@material/menu';

export class mdlMenu {
  static getDI () {
    return [
      '$rootScope',
      '_'
    ];
  }

  constructor (...args) {
    this.di = [];
    mdlMenu.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../templates/menu');

    this.scope={
      data: '=',
      isShow: '=',
      location: '=',
    };
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {

    (function init () {
      let unSubscribers = [];
      let Di = this.di;

      scope.mdlMenuModel ={
       data: scope.data,
      };
      let menuEl = element[0];
      // let menu = new MDCMenu(menuEl);
      this.menu = new MDCMenu(menuEl);
      menuEl.addEventListener('MDCMenu:selected', function(evt) {
        let msg = evt.detail.item.getAttribute('msg');
        Di.$rootScope.$emit(msg)
      });

      unSubscribers.push(scope.$watch('isShow',()=>{
        // console.log(scope.isShow);
        if(scope.isShow === true){
          // menu.open = false;
          let menuEl = element[0];
          menuEl.style.left = scope.location.x + 'px';
          menuEl.style.top = scope.location.y + 'px';

          this.menu.setAnchorCorner(Corner.BOTTOM_END);
          // this.menu.quickOpen = false;
          this.menu.open = true;
        } else {
          // menu.open = false;
          this.menu.open = false;
        }
      }));

      scope.$on('$destroy', () => {
        this.di._.each(unSubscribers, (unSubscriber) => {
          unSubscriber();
        });
      });
    }).call(this);
  }
}

mdlMenu.$inject = mdlMenu.getDI();
mdlMenu.$$ngIsClass = true;
