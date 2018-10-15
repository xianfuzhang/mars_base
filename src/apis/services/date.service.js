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
			day: day,
			hour: date.getHours(),
			minute: date.getMinutes()
		};
	}

	getBeforeDateObject(millisecond) {
		var before = new Date(Date.now() - millisecond);
		let year = this.getLocalYear(before);
		let month = before.getMonth();
		let day = before.getDate();
		return {
			year: year,
			month: month,
			day: day,
			hour: before.getHours(),
			minute: before.getMinutes()
		};
	}

	getLocalYear(date) {
		return 1900 + date.getYear();
	}
}

DateService.$inject = DateService.getDI();
DateService.$$ngIsClass = true; 

