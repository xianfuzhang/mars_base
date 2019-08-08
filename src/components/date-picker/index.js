// import './scss/date-picker.scss';
import {DatePicker} from './ng/date-picker.directive';
import {TimePicker} from './ng/time-picker.directive';

export default angular
	.module('date-picker', [])
	.directive('datePicker', DatePicker)
	.directive('timePicker', TimePicker)
	.name;