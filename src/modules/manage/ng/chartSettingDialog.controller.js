export class ChartSettingDialogController {
	static getDI() {
		return [
			'$scope',
			'$q',
      '$filter',
      '$modalInstance',
			'dataModel'
		];
	}

	constructor(...args) {
		this.di = {};
    ChartSettingDialogController.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		let scope = this.di.$scope;

		this.translate = this.di.$filter('translate');
		
		let chartTitle = '';
		switch(this.di.dataModel.chartType) {
      case 'nginx-type-analyzer':
        chartTitle = this.translate("MODULES.MANAGE.ELASTICSEARCH.CHART.NGINX_TYPE_SETTING");
        break;
      case 'nginx-analyzer':
        chartTitle = this.translate("MODULES.MANAGE.ELASTICSEARCH.CHART.NGINX_SETTING");
        break;
      case 'syslog-analyzer':
        chartTitle = this.translate("MODULES.MANAGE.ELASTICSEARCH.CHART.SYSLOG");
        break;
      case 'filebeat-analyzer':
        chartTitle = this.translate("MODULES.MANAGE.ELASTICSEARCH.CHART.FILEBEAT");
        break;
		}
		scope.title = chartTitle;
		
		scope.timeRangeOptions = [ // 时间间隔
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.MINUTE'), value: 60},
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.HOUR'), value: 120},
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.DAY'), value: 24 * 60 * 2},
		];
		
    scope.chartModel = {
      beginTime: this.di.dataModel.beginTime,
      endTime: this.di.dataModel.endTime,
    };
    
		this.date = this.di.$filter('date');
		
		let beginTime = this.di.dataModel.beginTime;
		scope.beginTime = this.date(beginTime, 'yyyy-MM-dd\'T\'HH:mm');
		
		let endTime = this.di.dataModel.endTime;
		scope.endTime = this.date(endTime, 'yyyy-MM-dd\'T\'HH:mm');
		
    let init = () => {
    
    };

    scope.timeChange = () => {
      if(!scope.chartModel.endTime || !scope.chartModel.beginTime) return;

    	let range = (scope.chartModel.endTime.getTime() - scope.chartModel.beginTime.getTime()) / 1000
	    if(range <= 0) {
        scope.chartModel.errMsg = this.translate('MODULES.DASHBOARD.SETTING.ERROR_TIME_RANGE_INVALID');
        scope.invalid = true;
      } else if(range < 30 * 60) {
        scope.chartModel.errMsg = this.translate('MODULES.DASHBOARD.SETTING.ERROR_TIME_RANGE_SHORT');
        scope.invalid = true;
      } else {
        scope.chartModel.errMsg = '';
        scope.invalid = false;
	    }
    }
    
    scope.cancel = (event) => {
      this.di.$modalInstance.dismiss({
        canceled: true
      });
      event.stopPropagation();
    };

    scope.save = (event) => {
      this.di.$modalInstance.close({
        canceled: false,
        data: {
	        beginTime: scope.chartModel.beginTime,
	        endTime: scope.chartModel.endTime,
        }
      });
      
      event.stopPropagation();
    };

    init();
	}
}
ChartSettingDialogController.$inject = ChartSettingDialogController.getDI();
ChartSettingDialogController.$$ngIsClass = true;