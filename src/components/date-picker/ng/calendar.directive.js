export class Calendar {
	static getDI() {
		return [];
	}

	constructor(...args){
		this.di = {};
		Calendar.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/calendar.html');
    this.scope = {
    	model: "=ngModel",
    	dateOptions: "="
    };
	}
}
Calendar.$inject = Calendar.getDI();
Calendar.$$ngIsClass = true;