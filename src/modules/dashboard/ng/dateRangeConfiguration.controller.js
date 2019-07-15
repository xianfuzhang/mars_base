export class DateRangeConfigurationController {
  static getDI() {
    return [
      '$scope',
      '$modalInstance',
      'dataModel',
      'dateService'
    ];
  }

  constructor(...args) {
    this.di = {};
    DateRangeConfigurationController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.switchRangeModel = {
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

    this.scope.cancel = (event) => {
      this.di.$modalInstance.dismiss({
        canceled: true
      });
      event.stopPropagation();
    };

    this.scope.save = (event) => {
      let begin_date = this.getBeginDate();
      let end_date = this.getEndDate();
      if (Date.parse(begin_date) > Date.parse(end_date)) {
        this.scope.switchRangeModel.configForm.$invalid = true;
        return;
      }
      this.di.$modalInstance.close({
        canceled: false,
        data: {
          'begin_date': begin_date,
          'end_date': end_date
        }
      });
       event.stopPropagation();
    };
  }

  getBeginDate() {
    let year = this.di.dateService.getLocalYear(this.scope.switchRangeModel.calendar.begin_date);
    let month = this.scope.switchRangeModel.calendar.begin_date.getMonth();
    let day = this.scope.switchRangeModel.calendar.begin_date.getDate();
    let hour = this.scope.switchRangeModel.calendar.begin_time.getHours();
    let minute = this.scope.switchRangeModel.calendar.begin_time.getMinutes();

    return new Date(year, month, day, hour, minute, 0);
  }

  getEndDate() {
    let year = this.di.dateService.getLocalYear(this.scope.switchRangeModel.calendar.end_date);
    let month = this.scope.switchRangeModel.calendar.end_date.getMonth();
    let day = this.scope.switchRangeModel.calendar.end_date.getDate();
    let hour = this.scope.switchRangeModel.calendar.end_time.getHours();
    let minute = this.scope.switchRangeModel.calendar.end_time.getMinutes();

    return new Date(year, month, day, hour, minute, 0);
  }  
}

DateRangeConfigurationController.$inject = DateRangeConfigurationController.getDI();
DateRangeConfigurationController.$$ngIsClass = true;