export class mdlSelect {
  static getDI() {
    return [
      '$window',
      '$compile',
      '$timeout'
    ];
  }

  constructor(...args) {
    this.di = {};
    mdlSelect.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../templates/select.html');
    this.scope = {
      value: '=ngModel', //{'label': ***, 'value': ***, 'type': ***}type仅在iconSupport为true时存在
      displayLabel: '=',
      helper: '=',
      disable: '=',
      iconSupport: '@',
      ngChange: '&',
      valueChange: '&'
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs, ngModel) {
    let clsReg = new RegExp('(\\s|^)selected(\\s|$)');;
    scope.menuOpen = false;
    scope.iconSupport = scope.iconSupport === 'true' ? true : false;
    scope.hint = scope.displayLabel && scope.displayLabel.hint;
    scope.options = scope.displayLabel && scope.displayLabel.options;
    if(scope.options){
      if(scope.value == null || typeof scope.value !== 'object'){
        scope.value = scope.options[0];
      }
    }
    if (scope.helper) {
      //scope.helpId = scope.helper.id;
      scope.content = scope.helper.content;
      let helperElement = this.di.$compile('<p aria-hidden="true"' +
        'class="mdc-text-field-helper-text" >{{content}} </p>')(scope);
      element.append(helperElement);
      //说明信息会一直显示
      helperElement.addClass('mdc-text-field-helper-text--persistent');
    }

    let getNormalizedXCoordinate = (target) => {
      const targetClientRect = target.getBoundingClientRect();
      return {
        'left': targetClientRect.left,
        'top': targetClientRect.bottom,
        'bottom': targetClientRect.top,
        'width': targetClientRect.width
      };
    }

    let autoPosition = (menuEl, coordinate) => {
      const menuClientRect = menuEl.getBoundingClientRect();
      let verticalAlign = 'top';
      const bodyHeight = this.di.$window.document.body.scrollHeight;
      console.log(bodyHeight, menuClientRect.height, coordinate.top, coordinate.bottom);
      if (coordinate.top + menuClientRect.height > bodyHeight) {
        verticalAlign = 'bottom';
      }

      angular.element(menuEl).css({
        'top': verticalAlign === 'top' ? coordinate.top + 'px' : '',
        'bottom': verticalAlign === 'bottom' ? (bodyHeight - coordinate.bottom) + 'px' : '',
        'left': coordinate.left + 'px',
        'width': coordinate.width + 'px'
      });
    };

    scope.toggleMenu = (event) => {
      let menuEl = element[0].querySelector('.mdc-select__menu');
      menuEl.classList.add('mdc-menu--open');
      const coordinate = getNormalizedXCoordinate(event.currentTarget);
      autoPosition(menuEl, coordinate);
      scope.menuOpen = !scope.menuOpen;
    };

    scope.changeSelect = (event, item) => {
      let liElms = event.currentTarget.parentElement.children;
      for(let i=0; i<liElms.length; i++) {
        liElms[i].className = liElms[i].className.replace(clsReg, '');
      }
      event.currentTarget.className += ' selected';
      scope.value = item;
      scope.ngChange = scope.ngChange || angular.noop;
      scope.ngChange({'$value': scope.value});
    };

    scope.$watch('displayLabel.options',(newValue)=>{
      scope.options = newValue;
    });

    scope.$watch('value',(newValue)=>{
      scope.valueChange = scope.valueChange || angular.noop;
      scope.valueChange();
    });

    this.di.$timeout(() => {
      let compare = function (Obj_1, Obj_2) {
        let state = true;
        for (let key in Obj_1) {
          if (typeof (Obj_2[key]) === 'undefined') {
            state = false;
          } 
          else {
            if (typeof (Obj_1[key]) === 'object') {
              state = compare(Obj_1[key],Obj_2[key]);
            } 
            else {
              if (Obj_1[key] !== Obj_2[key]) {
                state = false;
              }
            }
          }
        }
        return state;
      };
      let liNodes = element[0].querySelectorAll('.mdc-select-list-item');
      for(let i=0; i<liNodes.length; i++) {
        let index = parseInt(liNodes[i].getAttribute('index'));
        if (compare(scope.options[index], scope.value)) {
          liNodes[i].className += ' selected';
        }
      }
    });

    let menuClosedHandler = (event) => {
      if (!element[0].contains(event.target)) {
        scope.menuOpen = false;
      }
      scope.$evalAsync();
    };
    this.di.$window.addEventListener('click', menuClosedHandler, true);
    this.di.$window.addEventListener('scroll', menuClosedHandler, true);

    scope.$on('$destroy', () => {
      this.di.$window.removeEventListener('click', menuClosedHandler, true);
      this.di.$window.removeEventListener('scroll', menuClosedHandler, true);
    });
  }
}

mdlSelect.$inject = mdlSelect.getDI();
mdlSelect.$$ngIsClass = true;