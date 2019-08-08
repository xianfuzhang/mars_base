export class TimePicker{
	static getDI() {
		return ['$log'];
	}
	constructor(...args) {
		this.di = {};
		TimePicker.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/time-picker.html');
    this.scope = {
			time: '='
    };
    this.link = (...args) => this._link.apply(this, args);
	}

	_link(scope, element, attr) {
		this.di.$log.info(this.scope.time);
		this.di.$log.info(scope.time);
	}
}
TimePicker.$inject = TimePicker.getDI();
TimePicker.$$ngIsClass = true;