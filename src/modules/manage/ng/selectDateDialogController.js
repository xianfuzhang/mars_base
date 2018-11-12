export class SelectDateDialogController {
	static getDI() {
		return [
			'$scope',
			'$modalInstance',
			'$filter',
			'dataModel',
			'dateService'
		];
	}

	constructor(...args) {
		this.di = {};
		SelectDateDialogController.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.scope = this.di.$scope;
		this.scope.dialogModel = {
			calendar: {
				begin_date: this.di.dataModel.begin_date,
				end_date: this.di.dataModel.end_date,
				begin_time: this.di.dataModel.begin_time,
				end_time: this.di.dataModel.end_time
			},
			datePickerOptions: {
				isOpend: false,
				dateOptions: {
			    maxDate: new Date(),
			    minDate: new Date(Date.now() - 1000*60*60*24*15),  //后台最多支持50条数据，8小时去一次平均值
			    startingDay: 1
			  },
			  altInputFormats: ['M!/d!/yyyy'],
			}
		};
    this.scope.errMsg = '';
    let now = Date.now();
    this.date = this.di.$filter('date');
    let today = this.date(now, 'yyyy-MM-dd\'T\'hh:mm');
    this.scope.endtime = '';
    this.scope.defaultTime = this.di.dataModel.defaultTime ? this.di.dataModel.defaultTime : today;
    this.scope.dialogModel.endtime = new Date(this.scope.defaultTime)
    
		this.scope.cancel = (event) => {
			this.di.$modalInstance.dismiss({
        canceled: true
      });
      event.stopPropagation();
		};

		this.scope.save = (event) => {
			if(!this.scope.dialogModel || !(this.scope.dialogModel.endtime instanceof Date)) {
				this.scope.errMsg = '请选择时间！'
        return;
			}
			
			this.di.$modalInstance.close({
        canceled: false,
        data: {
					endtime: this.scope.dialogModel.endtime
        }
      });
 			event.stopPropagation();
		};
	}

	// getBeginDate() {
	// 	let year = this.di.dateService.getLocalYear(this.scope.dialogModel.calendar.begin_date);
	// 	let month = this.scope.dialogModel.calendar.begin_date.getMonth();
	// 	let day = this.scope.dialogModel.calendar.begin_date.getDate();
	// 	let hour = this.scope.dialogModel.calendar.begin_time.getHours();
	// 	let minute = this.scope.dialogModel.calendar.begin_time.getMinutes();
  //
	// 	return new Date(year, month, day, hour, minute, 0);
	// }
  //
	// getEndDate() {
	// 	let year = this.di.dateService.getLocalYear(this.scope.dialogModel.calendar.end_date);
	// 	let month = this.scope.dialogModel.calendar.end_date.getMonth();
	// 	let day = this.scope.dialogModel.calendar.end_date.getDate();
	// 	let hour = this.scope.dialogModel.calendar.end_time.getHours();
	// 	let minute = this.scope.dialogModel.calendar.end_time.getMinutes();
  //
	// 	return new Date(year, month, day, hour, minute, 0);
	// }
}

SelectDateDialogController.$inject = SelectDateDialogController.getDI();
SelectDateDialogController.$$ngIsClass = true;