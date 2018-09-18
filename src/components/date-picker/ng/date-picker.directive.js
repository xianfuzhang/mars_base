export class DatePicker{
	static getDI() {
		return [];
	}
	constructor(...args) {
		this.di = {};
		DatePicker.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.replace = true;
    this.restrict = 'E';
    this.require = 'ngModel';
    this.template = require('../template/date-picker.html');
    this.scope = {
			data: '=ngModel',
			options: '='
    };
    this.link = (...args) => this._link.apply(this, args);
	}

	_link(scope, element, attr) {
		//scope.popupPlacement = scope.options.popupPlacement || 'auto bottom-left';
		scope.isOpend = scope.options.isOpend || false;
		scope.dateOptions = scope.options.dateOptions;
		scope.altInputFormats = scope.options.altInputFormats;

		scope.open = (event) => {
			scope.isOpend = true;
		};
	}
}
DatePicker.$inject = DatePicker.getDI();
DatePicker.$$ngIsClass = true;