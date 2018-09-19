/**
 * Created by wls on 2018/6/7.
 */

export class marSection {
  static getDI () {
    return [
      '$rootScope',
      'easingService'
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
      noFold: '=',
      settingFunc: '&'
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attrs) {
    (function init () {
      // this.isFold =  false;
      // this.showOrNot

      scope.sectionModel = {
        'title': scope.title,
        'showStyle': {'display':'block'},
        'iconStyle':{},
        'noFoldStyle':{},
        'isFold': false,
        'noFold': false,
        'setting': attrs.supportSetting || false
      };

      if(scope.noFold === true){
        scope.sectionModel.noFold = true;
        scope.sectionModel.noFoldStyle = {'cursor':'auto', 'padding':'8px 16px'};
      }

      scope.lastHeight = 0;
      scope.isUp = false;
      scope.isDown = false;


      let bodyDom = angular.element(element[0].getElementsByClassName('mar_section__body'))

      let dynamicDown = (starttime, duration) => {
        // console.log('==' + starttime + duration);
        let time = (new Date()).getTime() - starttime;
        if(time > duration) {
          // bodyDom.css('height',scope.lastHeight+'px');
          bodyDom.css('height','auto');
          scope.isDown = false;
          // scope = false;
          return;
        }

        if(!scope.isDown) {
          return;
        }
        let percentage = time/duration;
        let nP = this.di.easingService.easeOutBounce(percentage);
        let height = scope.lastHeight * nP;
        bodyDom.css('height',height+'px');
        bodyDom.css('display','block');
        // scope.sectionModel.showStyle.height =  height+'px';
        // scope.$apply();
        requestAnimFrame(function () {
          dynamicDown(starttime, duration);
        });
      };


      let dynamicUp = (starttime, duration) => {
        let time = (new Date()).getTime() - starttime;
        if(time > duration) {
          bodyDom.css('height','auto');
          bodyDom.css('display','none');
          scope.isUp = false;
          return;
        }
        if(!scope.isUp) {
          return;
        }
        let percentage = time/duration;
        let nP = this.di.easingService.easeInOutQuad(percentage);
        let height = scope.lastHeight * (1- nP);
        bodyDom.css('height',height+'px');
        bodyDom.css('display','block');
        requestAnimFrame(function () {
          dynamicUp(starttime, duration);
        });
      };


      scope.foldAndNot = (event) =>{
        if(scope.sectionModel.noFold ===  true){
          return;
        }
        // let bodyDom = angular.element(element[0].getElementsByClassName('mar_section__body'));
        // scope.lastHeight = scope.lastHeight > bodyDom[0].clientHeight? scope.lastHeight :bodyDom[0].clientHeight ;
        if(scope.sectionModel.isFold){
          scope.sectionModel.showStyle = {'display':'block','height':'0px'};
          scope.sectionModel.iconStyle = {'animation': '.15s ease-out', 'animation-name': 'section_expand', 'transform': 'rotateZ(0deg)'};
          scope.isDown = true;
          scope.isUp = false;
          dynamicDown((new Date()).getTime(), 1000);
        } else {
          // scope.sectionModel.showStyle = {'display':'none'};
          scope.sectionModel.iconStyle = {'animation': '.15s ease-out', 'animation-name': 'section_fold', 'transform': 'rotateZ(270deg)'};
          // console.log(scope.isDown);
          if(!scope.isDown && !scope.isUp){
            let bodyDom = angular.element(element[0].getElementsByClassName('mar_section__body'));
            scope.lastHeight = bodyDom[0].clientHeight;
            //scope.lastHeight > bodyDom[0].clientHeight? scope.lastHeight :bodyDom[0].clientHeight ;
          }
          scope.isDown = false;
          scope.isUp = true;
          setTimeout(dynamicUp((new Date()).getTime(), 500),10);
        }
        scope.sectionModel.isFold = !scope.sectionModel.isFold;
      };

      scope.showSetting = (event) => {
        event.stopPropagation();
        let settingFunc = scope.settingFunc || angular.noop;
        settingFunc();
      };

      setTimeout(function () {
        let bodyDom = angular.element(element[0].getElementsByClassName('mar_section__body'));
        scope.lastHeight = bodyDom[0].clientHeight;
        // console.log(scope.lastHeight)
      },200)

    }).call(this);
  }
}

marSection.$inject = marSection.getDI();
marSection.$$ngIsClass = true;
