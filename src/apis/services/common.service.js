/**
 * Created by wls on 2018/9/13.
 */
export class commonService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    commonService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }


  calcRunningDate(ts_diff){
    let dayCount = Math.floor(ts_diff/(1000 * 60 * 60 * 24));
    let hourCount = Math.floor(ts_diff%(1000 * 60 * 60 * 24)/(1000 * 60 * 60));
    let dayStr = '';
    let hourStr = '';
    if(dayCount === 1){
      dayStr =  dayCount + this.translate('MODULES.COMMON.DAY');
    } else if(dayCount > 1){
      dayStr =  dayCount + this.translate('MODULES.COMMON.DAYS');
    }

    if(hourCount === 1){
      hourStr =  hourCount + this.translate('MODULES.COMMON.HOUR');
    } else if(hourCount > 1){
      hourStr =  hourCount + this.translate('MODULES.COMMON.HOURS');
    }

    if(hourCount === 0 && hourCount === 0){
      let seconds = Math.floor(ts_diff%(1000 * 60 * 60 * 24)/1000);
      return seconds + this.translate('MODULES.COMMON.SECONDS');
    }
    return dayStr + hourStr;
  };
}


commonService.$inject = commonService.getDI();
commonService.$$ngIsClass = true;