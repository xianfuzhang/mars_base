/**
 * Created by wls on 2018/6/7.
 */

export class linkTooltip {
  static getDI () {
    return [
      '$document',
      '$rootScope',
      '$window',
      '$filter',
      '_'
    ];
  }

  constructor (...args) {
    this.di = [];
    linkTooltip.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/linkTooltip');
    this.scope = {
      noApply: '@', //是否显示相应action，默认都隐藏
    };
    this.translate = this.di.$filter('translate');

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      scope.tooltipStyle = {};
      scope.arrowStyle = {};
      scope.isRight = true;


      scope.noApply = scope.noApply|| 'false';
      scope.isNeedRefresh = scope.noApply === 'true'? false:true;

      let getFlowShowInfo = (detail)=>{
        let showArray = [];
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_RECEIVED'), 'value': detail.flow.packetsReceived});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_RX_DROPPED'), 'value': detail.flow.packetsRxDropped});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_RX_ERRORS'), 'value':detail.flow.packetsRxErrors});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.BYTES_RECEIVED'), 'value': detail.flow.bytesReceived});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_SENT'), 'value':detail.flow.packetsSent});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_TX_DROPPED'), 'value': detail.flow.packetsTxDropped});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_TX_ERRORS'), 'value': detail.flow.packetsTxErrors});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.BYTES_SENT'), 'value': detail.flow.bytesSent});
        return showArray;
      };

      let unsubscribers = [];
      unsubscribers.push(this.di.$rootScope.$on('show_link_tooltip',(event, param)=>{
        let detail = param.value;

        scope.srcDevice = detail.src.device_name + '/' + detail.src.port;
        scope.dstDevice = detail.dst.device_name + '/' + detail.dst.port;

        let trStart = '<tr>';
        let trEnd= '</tr>';
        let tdStart = '<td>';
        let tdEnd = '</td>';

        let link_topo_detail = angular.element(document.getElementById('link_tooltip_detail'));
        link_topo_detail.empty();

        let showArray = getFlowShowInfo(detail);
        this.di._.forEach(showArray, (item, key)=>{
          let firstTdContent = '<div>'+ item.label +'</div>';

          // let secondTdContent = '';
          if(item.value === undefined){
            item.value = ''
          }
          let secondTdContent = '<div>'+ item.value +'</div>';

          // if(item.value === "false" || item.value === false){
          //   secondTdContent = '<div><svg  xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"> <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="red"/> <path d="M0 0h24v24H0z" fill="none"/> </svg></div>';
          // } else if(item.value === "true" || item.value === true) {
          //   secondTdContent = "<div><svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'><path fill='none' d='M0 0h18v18H0z'/><path d='M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z' fill='green'/></svg></div>";
          // } else {
          //     if(item.value === undefined){
          //       item.value = ''
          //     }
          //     secondTdContent = '<div>'+ item.value +'</div>';
          // }

          let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
          link_topo_detail.append(tr)
        });

        let win_width = this.di.$window.innerWidth;
        let win_height = this.di.$window.innerHeight;

        let tooltipHeight;
        let tooltipWidth;
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
        if(scope.isNeedRefresh)
          scope.$apply();
      }));

      unsubscribers.push(this.di.$rootScope.$on('hide_link_tooltip',()=>{

        scope.srcDevice = '';
        scope.dstDevice = '';

        let leftDom = angular.element(element[0].getElementsByClassName('linkTooltip__content__body--left'));
        let rightDom = angular.element(element[0].getElementsByClassName('linkTooltip__content__body--right'));
        leftDom.empty();
        rightDom.empty();

        scope.tooltipStyle = {'visibility': 'hidden'};
        if(scope.isNeedRefresh)
          scope.$apply();
      }));


      scope.$on('$destroy', () => {
        unsubscribers.forEach((unSubscribe) => {
          unSubscribe();
        });
      });

    }).call(this);
  }
}

linkTooltip.$inject = linkTooltip.getDI();
linkTooltip.$$ngIsClass = true;
