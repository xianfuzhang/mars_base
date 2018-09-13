/**
 * Created by wls on 2018/6/7.
 */

export class deviceTooltip {
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
      scope.isRight = true;

      let unsubscribers = [];
      unsubscribers.push(this.di.$rootScope.$on('show_tooltip',(event, param)=>{
        // console.log(param);
        let showArray = param.value;
        // let leftDom = angular.element(element[0].getElementsByClassName('deviceTooltip__content__body--left'));
        // let rightDom = angular.element(element[0].getElementsByClassName('deviceTooltip__content__body--right'));
        //
        // this.di._.forEach(showArray, (item, key)=>{
        //   leftDom.append('<div>'+ item.label +'</div>');
        //   // rightDom.append('<div>'+ item.value +'</div>');
        //   if(item.value === "false" || item.value === false){
        //     rightDom.append('<div><svg  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"> <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="red"/> <path d="M0 0h24v24H0z" fill="none"/> </svg></div>');
        //   } else if(item.value === "true" || item.value === true) {
        //     rightDom.append("<div><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'><path fill='none' d='M0 0h24v24H0z'/><path d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' fill='green'/></svg></div>");
        //   } else {
        //     rightDom.append('<div>'+ item.value +'</div>');
        //   }
        // });

        let trStart = '<tr>';
        let trEnd= '</tr>';
        let tdStart = '<td>';
        let tdEnd = '</td>';

        let topo_detail = angular.element(document.getElementById('tooltip_detail'));
        topo_detail.empty();

        this.di._.forEach(showArray, (item, key)=>{
          let firstTdContent = '<div>'+ item.label +'</div>';

          let secondTdContent = '';

          if(item.value === "false" || item.value === false){
            secondTdContent = '<div><svg  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"> <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="red"/> <path d="M0 0h24v24H0z" fill="none"/> </svg></div>';
          } else if(item.value === "true" || item.value === true) {
            secondTdContent = "<div><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'><path fill='none' d='M0 0h18v18H0z'/><path d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' fill='green'/></svg></div>";
          } else {
              secondTdContent = '<div>'+ item.value +'</div>';
          }

          let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
          topo_detail.append(tr)
        });

        // angular.element(element).find('.deviceTooltip__content__body--left').append()

        let win_width = this.di.$window.innerWidth;
        let win_height = this.di.$window.innerHeight;

        let tooltipHeight = 400;
        let tooltipWidth = 428;
        tooltipHeight = element[0].clientHeight;
        tooltipWidth = element[0].clientWidth;

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

        scope.arrowStyle = {'top': (param.event.clientY - tooltipTop - 10) + 'px'};
        if(!scope.isRight){
          scope.arrowStyle['left'] = tooltipWidth + 'px';
        }
        scope.$apply();
      }));

      unsubscribers.push(this.di.$rootScope.$on('hide_tooltip',()=>{
        // console.log('hide_tooltip');

        let leftDom = angular.element(element[0].getElementsByClassName('deviceTooltip__content__body--left'));
        let rightDom = angular.element(element[0].getElementsByClassName('deviceTooltip__content__body--right'));
        leftDom.empty();
        rightDom.empty();

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
