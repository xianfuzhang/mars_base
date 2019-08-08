/**
 * Created by wls on 2018/6/7.
 */
const Chart = require('chart.js');

export class chartTooltip {
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
    chartTooltip.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/chartTooltip');
    this.scope = {
      noApply: '@', //是否显示相应action，默认都隐藏
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      scope.tooltipStyle = {};
      scope.tooltipAllPageStyle = {'visibility': 'hidden'};
      scope.arrowStyle = {};
      scope.isRight = true;


      scope.chartModel = {
        type: 'pie',
        data: [],
        labels: [],
        options: {},
        colors: [],
      }


      scope.noApply = scope.noApply|| 'false';
      scope.isNeedRefresh = scope.noApply === 'true'? false:true;

      let unsubscribers = [];
      unsubscribers.push(this.di.$rootScope.$on('show_chart_tooltip',(event, param)=>{
        let size = param['size'];
        var canvas = document.getElementById("chartTooltipCanvas");

        if(size){
          canvas.width = size['width'];
          canvas.height = size['height'];
        } else {
          canvas.width = 300;
          canvas.height = 300;
        }

        scope.chartModel = param['data'];
        // scope.chartModel['type'] = 'pie';

        // var ctx = canvas.getContext('2d');

        // var chart = new Chart(ctx, param['data']);

        let win_width = this.di.$window.innerWidth;
        let win_height = this.di.$window.innerHeight;

        let tooltipHeight = 400;
        let tooltipWidth = 428;

        tooltipHeight = element.children()[0].clientHeight;
        tooltipWidth = element.children()[0].clientWidth;

        let tooltipTop = param.event.clientY - tooltipHeight/2;

        let tooltipLeft = param.event.clientX + 20;
        if (tooltipTop + tooltipHeight > win_height){
          tooltipTop = win_height - tooltipHeight;
        }

        if(tooltipTop < 0){
          tooltipTop = 0;
        }

        if(tooltipLeft + tooltipWidth > win_width){
          scope.isRight = false;
          tooltipLeft = param.event.clientX - 20 -  tooltipWidth;
          if(tooltipLeft < 0){
            tooltipLeft = param.event.clientX + 20;
          }
        } else {
          scope.isRight = true;
        }

        scope.tooltipStyle = {'left': tooltipLeft + 'px', 'top': tooltipTop + 'px','visibility': 'visible'};
        scope.tooltipAllPageStyle = {'visibility': 'visible'};

        scope.arrowStyle = {'top': (param.event.clientY - tooltipTop - 10) + 'px'};
        if(!scope.isRight){
          scope.arrowStyle['left'] = tooltipWidth + 'px';
        }
        if(scope.isNeedRefresh)
          scope.$apply();
      }));

      scope.click = () =>{
        hide();
        // if(scope.isNeedRefresh)
        //   scope.$apply();
      }

      scope.stopPro = ($event) =>{
        $event.stopPropagation();
      }

      // unsubscribers.push(this.di.$rootScope.$on('hide_chart_tooltip',()=>{
      //   // console.log('hide_tooltip');
      //   scope.chartModel = {
      //     data: [],
      //     labels: [],
      //     options: {},
      //     colors: [],
      //   }
      //
      //   scope.tooltipStyle = {'visibility': 'hidden'};
      //
      //   if(scope.isNeedRefresh)
      //     scope.$apply();
      // }));

      angular.element(this.di.$window).bind('resize', function(){
        hide();
        scope.$apply();
      });

      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });
      });

      let hide = () =>{
        scope.chartModel = {
          type: 'pie',
          data: [],
          labels: [],
          options: {},
          colors: [],
        }

        scope.tooltipStyle = {'visibility': 'hidden'};
        scope.tooltipAllPageStyle = {'visibility': 'hidden'};
      }

    }).call(this);
  }
}

chartTooltip.$inject = chartTooltip.getDI();
chartTooltip.$$ngIsClass = true;
