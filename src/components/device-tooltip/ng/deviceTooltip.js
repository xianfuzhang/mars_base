/**
 * Created by wls on 2018/6/7.
 */

export class deviceTooltip {
  static getDI () {
    return [
      '$document',
      '$rootScope',
      '$window'
    ];
  }

  constructor (...args) {
    this.di = [];
    deviceTooltip.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/deviceTooltip');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      scope.tooltipStyle = {};
      scope.arrowStyle = {};


      let unsubscribers = [];
      unsubscribers.push(this.di.$rootScope.$on('show_tooltip',(event, param)=>{
        // console.log(param);
        let win_width = this.di.$window.innerWidth;
        let win_height = this.di.$window.innerHeight;

        // let out_width = this.di.$window.outerWidth;
        // let out_height = this.di.$window.outerHeight;
        // let scrollY  = this.di.$window.scrollY;
        // let scrollX  = this.di.$window.scrollX;

        let tooltipHeight = 400;
        let tooltipWidth = 428;

        let tooltipTop = param.event.clientY - tooltipHeight/2;

        let tooltipLeft = param.event.clientX + 20;
        if (tooltipTop + tooltipHeight > win_height){
          tooltipTop = win_height - tooltipHeight;
        }

        if(tooltipTop < 0){
          tooltipTop = 0;
        }

        if(tooltipLeft + tooltipWidth > win_width){
          tooltipLeft = param.event.clientX - 20 -  tooltipWidth;
          if(tooltipLeft < 0){
            tooltipLeft = param.event.clientX + 20;
          }
        }

        scope.tooltipStyle = {'left': tooltipLeft + 'px', 'top': tooltipTop + 'px','visibility': 'visible'};
        scope.arrowStyle = {'top': (param.event.clientY - tooltipTop - 10) + 'px'};
        scope.$apply();
      }));

      unsubscribers.push(this.di.$rootScope.$on('hide_tooltip',()=>{
        // console.log('hide_tooltip');
        scope.tooltipStyle = {'visibility': 'hidden'};
        scope.$apply();
      }));


      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });
      });

    }).call(this);
  }
}

deviceTooltip.$inject = deviceTooltip.getDI();
deviceTooltip.$$ngIsClass = true;
