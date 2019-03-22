import {ChartJsFactory, ChartJsProvider, ChartJsService} from './ng/marChart.module';

export default angular
	.module('marChart', [])
	.provider('ChartJs', ChartJsProvider)
	.factory('ChartJsFactory', ['ChartJs', '$timeout', ChartJsFactory])
	.service('chartService', ChartJsService)
	.directive('chartBase', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory(); }])
	.directive('chartLine', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('line'); }])
	.directive('chartBar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('bar'); }])
	.directive('chartHorizontalBar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('horizontalBar'); }])
	.directive('chartRadar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('radar'); }])
	.directive('chartDoughnut', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('doughnut'); }])
	.directive('chartPie', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('pie'); }])
	.directive('chartPolarArea', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('polarArea'); }])
	.directive('chartBubble', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('bubble'); }])
	.name;