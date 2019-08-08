export class CalendarController {
	static getDI() {
		return [
			'$scope',
		];
	}

	constructor(...args){
		this.di = {};
		CalendarController.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});

		this.scope = this.di.$scope;
	}
}
CalendarController.$inject = CalendarController.getDI();
CalendarController.$$ngIsClass = true;