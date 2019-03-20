export class ShowChartSettingController {
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
    ShowChartSettingController.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		let scope = this.di.$scope;

		this.translate = this.di.$filter('translate');
		
		let chartTitle = '';
		switch(this.di.dataModel.chartType) {
			case 'controller-cpu':
				chartTitle = this.translate("MODULES.DASHBOARD.CHART.CONTROLLER_CPU.TITLE");
				break;
			case 'controller-memory':
				chartTitle = this.translate("MODULES.DASHBOARD.CHART.CONTROLLER_MEMORY.TITLE");
				break;
			case 'device-cpu':
				chartTitle = this.translate("MODULES.DASHBOARD.CHART.SWITCH_CPU.TITLE");
				break;
			case 'device-memory':
				chartTitle = this.translate("MODULES.DASHBOARD.CHART.SWITCH_MEMORY.TITLE");
				break;
		}
		scope.title = chartTitle;
		
		scope.timeRangeOptions = [ // 时间间隔
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.MINUTE'), value: 60},
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.HOUR'), value: 120},
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.DAY'), value: 24 * 60 * 2},
		];
		
		scope.dataOptions = { options: [{label:'-- 全部 --', value:''}]};
		this.di.dataModel.chartDataArr.forEach((data) => {
			scope.dataOptions.options.push({
				label: data,
				value: data
			})
		})
		
		this.date = this.di.$filter('date');
		
		let beginTime = this.di.dataModel.beginTime;
		scope.beginTime = this.date(beginTime, 'yyyy-MM-dd\'T\'HH:mm');
		
		let endTime = this.di.dataModel.endTime;
		scope.endTime = this.date(endTime, 'yyyy-MM-dd\'T\'HH:mm');
		
    scope.chartModel = {
    	beginTime: this.di.dataModel.beginTime,
	    endTime: this.di.dataModel.endTime,
	    selectedData: scope.dataOptions[0]
    };
    
    let init = () => {
    
    };

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
          selectedData: scope.chartModel.selectedData.value,
	        beginTime: scope.chartModel.beginTime,
	        endTime: scope.chartModel.endTime,
        }
      });
      
      event.stopPropagation();
    };

    init();
	}
}
ShowChartSettingController.$inject = ShowChartSettingController.getDI();
ShowChartSettingController.$$ngIsClass = true;