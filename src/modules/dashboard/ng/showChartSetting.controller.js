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
		
		switch(this.di.dataModel.chartType) {
			case 'controller-cpu':
        scope.title = this.translate("MODULES.DASHBOARD.CHART.CONTROLLER_CPU.TITLE");
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_CONTROLLER');
				break;
			case 'controller-memory':
        scope.title = this.translate("MODULES.DASHBOARD.CHART.CONTROLLER_MEMORY.TITLE");
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_CONTROLLER');
				break;
      case 'controller-interface':
        scope.title = this.translate("MODULES.DASHBOARD.CHART.CONTROLLER_INTERFACE.TITLE");
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_CONTROLLER');
        scope.unitTypeOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.FLOW_STATE');
        scope.stateTypeOptionTitle = this.translate("MODULES.DASHBOARD.SETTING.FLOW_TYPE");
        break;
			case 'device-cpu':
        scope.title = this.translate("MODULES.DASHBOARD.CHART.SWITCH_CPU.TITLE");
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
				break;
			case 'device-memory':
        scope.title = this.translate("MODULES.DASHBOARD.CHART.SWITCH_MEMORY.TITLE");
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
				break;
      case 'device-disk':
        scope.title = this.translate("MODULES.DASHBOARD.CHART.SWITCH_DISK.TITLE");
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
        break;
      case 'device-interface':
        scope.title = "交换机流量设置";
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
        break;
      case 'device-interface-drop-error':
        scope.title = "交换机异常流量设置";
        scope.selectOptionTitle = this.translate('MODULES.DASHBOARD.SETTING.SELECT_SWITCH');
        break;
		}

		scope.type = this.di.dataModel.chartType;
		scope.dataOptions = { options: [{label: this.translate('MODULES.DASHBOARD.SETTING.SELECT_ALL'), value:''}]};

    scope.interfaceUnitTypes = [{
      label: 'Packets_TX',
      value: 'packets_tx'
    },{
      label: 'Packets_RX',
      value: 'packets_rx'
    },{
      label: 'Bytes_TX',
      value: 'bytes_tx'
    },{
      label: 'Bytes_RX',
      value: 'bytes_rx'
    }];

    scope.interfaceStateTypes = [{
      label: 'Normal',
      value: 'normal'
    },{
      label: 'Dropped',
      value: 'dropped'
    },{
      label: 'Error',
      value: 'error'
    }];
		
    // TODO: array handle
		let selectedData = this.di.dataModel.selectedData[0];
    
    scope.chartModel = {
      type: this.di.dataModel.chartType,
      beginTime: this.di.dataModel.beginTime,
      endTime: this.di.dataModel.endTime,
      selectedData: scope.dataOptions[0],
      unitTypeOption: this.di.dataModel.unitTypeOption,
      stateTypeOption: this.di.dataModel.stateTypeOption,
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
      let data;
      switch (this.di.dataModel.chartType) {
        case 'controller-interface':
          data = {
            unitTypeOption: scope.chartModel.unitTypeOption,
            stateTypeOption: scope.chartModel.stateTypeOption,
            beginTime: scope.chartModel.beginTime,
            endTime: scope.chartModel.endTime,
          }
          break;
        default:
          data = {
            selectedData: scope.chartModel.selectedData.value ? [scope.chartModel.selectedData.value] : [],
            beginTime: scope.chartModel.beginTime,
            endTime: scope.chartModel.endTime,
          }
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
ShowChartSettingController.$inject = ShowChartSettingController.getDI();
ShowChartSettingController.$$ngIsClass = true;