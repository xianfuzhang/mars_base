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


      let FLOW_UNITS_CONSTRAINT = {
        'bps': 1,
        'kbps': 1024,
        'mbps': 1024*1024,
        'gbps': 1024*1024*1024,
      }

      scope.noApply = scope.noApply|| 'false';
      scope.isNeedRefresh = scope.noApply === 'true'? false:true;

      // 'B/s': 1,
      //   'KB/s': 1024,
      //   'MB/s': 1024*1024,
      //   'GB/s': 1024*1024*1024,
      let reformat_packets_value = (value) =>{
        if(value >= FLOW_UNITS_CONSTRAINT.kbps && value < FLOW_UNITS_CONSTRAINT.mbps ){
          value = (value/FLOW_UNITS_CONSTRAINT.kbps).toFixed(2) + 'Kp/s'
        } else if ( value >= FLOW_UNITS_CONSTRAINT.mbps && value < FLOW_UNITS_CONSTRAINT.gbps ){
          value = (value/FLOW_UNITS_CONSTRAINT.mbps).toFixed(2) + 'Mp/s'
        } else if( value >= FLOW_UNITS_CONSTRAINT.gbps){
          value = (value/FLOW_UNITS_CONSTRAINT.mbps).toFixed(2) + 'Gp/s'
        } else {
          value = value.toFixed(2) + 'p/s'
        }
        return value
      };

      let reformat_bytes_value = (value) =>{
        if(value >= FLOW_UNITS_CONSTRAINT.kbps && value < FLOW_UNITS_CONSTRAINT.mbps ){
          value = (value/FLOW_UNITS_CONSTRAINT.kbps).toFixed(2) + 'KB/s'
        } else if ( value >= FLOW_UNITS_CONSTRAINT.mbps && value < FLOW_UNITS_CONSTRAINT.gbps ){
          value = (value/FLOW_UNITS_CONSTRAINT.mbps).toFixed(2) + 'MB/s'
        } else if( value >= FLOW_UNITS_CONSTRAINT.gbps){
          value = (value/FLOW_UNITS_CONSTRAINT.mbps).toFixed(2) + 'GB/s'
        } else {
          value = value.toFixed(2)+ 'B/s'
        }
        return value
      };

      let getUpFlowShowInfo = (detail)=>{
        let showArray = [];
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.BYTES_SENT'), 'value': reformat_bytes_value(detail.flow.bytesSent)});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_SENT'), 'value':reformat_packets_value(detail.flow.packetsSent)});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_TX_DROPPED'), 'value': reformat_packets_value(detail.flow.packetsTxDropped)});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_TX_ERRORS'), 'value': reformat_packets_value(detail.flow.packetsTxErrors)});
        return showArray;
      };

      let getDownFlowShowInfo = (detail)=>{
        let showArray = [];
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.BYTES_RECEIVED'), 'value': reformat_bytes_value(detail.flow.bytesReceived)});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_RECEIVED'), 'value': reformat_packets_value(detail.flow.packetsReceived)});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_RX_DROPPED'), 'value': reformat_packets_value(detail.flow.packetsRxDropped)});
        showArray.push({'label': this.translate('MODULES.TOPO.LINK_TOOLTIP.PACKETS_RX_ERRORS'), 'value':reformat_packets_value(detail.flow.packetsRxErrors)});
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

        let link_up_div = angular.element(document.getElementById('link_up_div'));
        let link_down_div = angular.element(document.getElementById('link_down_div'));
        link_up_div.empty();
        link_down_div.empty();

        let upArray = getUpFlowShowInfo(detail);
        this.di._.forEach(upArray, (item, key)=>{
          let firstTdContent = '<div>'+ item.label +'</div>';

          // let secondTdContent = '';
          if(item.value === undefined){
            item.value = ''
          }
          let secondTdContent = '<div>'+ item.value +'</div>';
          let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
          link_up_div.append(tr)
        });


        let downArray = getDownFlowShowInfo(detail);
        this.di._.forEach(downArray, (item, key)=>{
          let firstTdContent = '<div>'+ item.label +'</div>';

          // let secondTdContent = '';
          if(item.value === undefined){
            item.value = ''
          }
          let secondTdContent = '<div>'+ item.value +'</div>';
          let tr = trStart + tdStart + firstTdContent + tdEnd + tdStart + secondTdContent + tdEnd + trEnd;
          link_down_div.append(tr)
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
        // return;
        scope.srcDevice = '';
        scope.dstDevice = '';

        // let leftDom = angular.element(element[0].getElementsByClassName('linkTooltip__content__body--left'));
        // let rightDom = angular.element(element[0].getElementsByClassName('linkTooltip__content__body--right'));
        let link_up_div = angular.element(document.getElementById('link_up_div'));
        let link_down_div = angular.element(document.getElementById('link_down_div'));
        link_up_div.empty();
        link_down_div.empty();

        // leftDom.empty();
        // rightDom.empty();

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
