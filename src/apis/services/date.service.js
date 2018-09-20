export class DateService{
	static getDI() {
		return [];
	}

	constructor(...args) {

	}

	getTodayObject() {
		let date = new Date();
		let year = this.getLocalYear(date);
		let month = date.getMonth();
		let day = date.getDate();
		return {
			year: year,
			month: month,
			day: day
		};
	}

	getBeforeDateObject() {
		var before = new Date(Date.now() - 1000*60*60*24);
		let year = this.getLocalYear(before);
		let month = before.getMonth();
		let day = before.getDate();
		return {
			year: year,
			month: month,
			day: day
		};
	}

	getLocalYear(date) {
		return 1900 + date.getYear();
	}
}

DateService.$inject = DateService.getDI();
DateService.$$ngIsClass = true; 

