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
      case 'device-disk':
        chartTitle = this.translate("MODULES.DASHBOARD.CHART.SWITCH_DISK.TITLE");
        break;
		}
		scope.title = chartTitle;
		
		scope.timeRangeOptions = [ // 时间间隔
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.MINUTE'), value: 60},
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.HOUR'), value: 120},
			{label: this.translate('MODULES.DASHBOARD.TIMERANGE.DAY'), value: 24 * 60 * 2},
		];
		
		scope.dataOptions = { options: [{label: this.translate('MODULES.DASHBOARD.SETTING.SELECT_ALL'), value:''}]};
		
    // TODO: array handle
		let selectedData = this.di.dataModel.selectedData[0];
    
    scope.chartModel = {
      beginTime: this.di.dataModel.beginTime,
      endTime: this.di.dataModel.endTime,
      selectedData: scope.dataOptions[0]
    };
    
		this.di.dataModel.chartDataArr.forEach((data) => {
			scope.dataOptions.options.push({
				label: data,
				value: data
			})
			
			if(data == selectedData) {
        scope.chartModel.selectedData = {
          label: data,
          value: data
        }
			}
		})
		
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
	    if(range > 24 * 3600) {
        scope.chartModel.errMsg = this.translate('MODULES.DASHBOARD.SETTING.ERROR_TIME_RANGE_LONG');
        scope.invalid = true;
	    } else if(range <= 0) {
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
          selectedData: scope.chartModel.selectedData.value ? [scope.chartModel.selectedData.value] : [],
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