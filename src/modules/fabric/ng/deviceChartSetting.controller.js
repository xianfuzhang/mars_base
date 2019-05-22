export class DeviceChartSettingController {
	static getDI() {
		return [
			'$scope',
      '$filter',
      '$modalInstance',
			'dataModel'
		];
	}

	constructor(...args) {
		this.di = {};
    DeviceChartSettingController.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		let scope = this.di.$scope;

		this.translate = this.di.$filter('translate');
		
		switch(this.di.dataModel.chartType) {
			case 'device-cpu':
        scope.title = '交换机CPU设置';
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
				break;
			case 'device-memory':
        scope.title = '交换机内存设置';
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
				break;
      case 'device-port':
        scope.title = '端口流量设置';
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
        break;
		}

		scope.type = this.di.dataModel.chartType;

    scope.chartModel = {
      type: this.di.dataModel.chartType,
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
      let data = {
        beginTime: scope.chartModel.beginTime,
        endTime: scope.chartModel.endTime,
      }
      this.di.$modalInstance.close({
        canceled: false,
        data
      });
      
      event.stopPropagation();
    };

    init();
	}
}
DeviceChartSettingController.$inject = DeviceChartSettingController.getDI();
DeviceChartSettingController.$$ngIsClass = true;