// import './scss/date-picker.scss';
import {DatePicker} from './ng/date-picker.directive';

export default angular
	.module('date-picker', [])
	.directive('datePicker', DatePicker)
	.name;