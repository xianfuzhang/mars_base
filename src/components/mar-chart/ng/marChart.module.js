'use strict';
const Chart = require('chart.js');

Chart.plugins.register(require('./range-select-plugin'));
Chart.plugins.register(require('chartjs-plugin-deferred'));

const theme = getTheme();
const DEFAULT_STYLES = {
	colors: {
		colorPool: theme == 'theme_default'
			? ['rgb(46,139,87)', 'rgb(135,206,235)', 'rgb(205,92,92)', 'rgb(138,43,226)', 'rgb(244,164,96)', 'rgb(0,128,0)','rgb(128,0,128)', 'rgb(0,191,255)','rgb(250,128,114)', 'rgb(0,0,255)', 'rgb(255,0,0)', 'rgb(178,34,34)',  'rgb(210,105,30)']
			: ['rgb(144,238,144)', 'rgb(135,206,235)', 'rgb(250,128,114)', 'rgb(255,228,196)', 'rgb(0,0,255)', 'rgb(0,128,0)', 'rgb(205,92,92)', 'rgb(0,191,255)','rgb(178,34,34)', 'rgb(255,0,0)', 'rgb(244,164,96)', 'rgb(210,105,30)'],
		fontColor: theme == 'theme_default' ? '#282828' : '#d8d9da',
		gridLinesColor: theme == 'theme_default' ? '#808080' : '#a8a9aa',
	},
	lines: {
		gridWidth: 0.2,
		borderWidth: 2.5,
		borderLightWidth: 1.5,
		borderBoldWidth: 3.5,
		pointRadius: 1,
		pointHoverRadius: 2,
		pointHitRadius: 2
	},
}

// global default value
Chart.defaults.global.defaultFontColor = theme == 'theme_default' ? '#282828' : '#d8d9da';
Chart.defaults.global.title.fontSize = 15;
Chart.defaults.global.elements.line.borderWidth = DEFAULT_STYLES.lines.borderWidth;
Chart.defaults.global.colors = DEFAULT_STYLES.colors.colorPool;
Chart.defaults.global.multiTooltipTemplate = '<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value %>';

export function ChartJsService () {
	this.styles = DEFAULT_STYLES;
	this.Chart = Chart;
	this.helpers = Chart.helpers;
}

/**
 * Wrapper for chart.js
 * Allows configuring chart js using the provider
 *
 * angular.module('myModule', ['chart.js']).config(function(ChartJsProvider) {
 *   ChartJsProvider.setOptions({ responsive: false });
 *   ChartJsProvider.setOptions('Line', { responsive: true });
 * })))
 */
export function ChartJsProvider () {
	let globalDefaultOptions = {
    responsive: true,
    maintainAspectRatio: false
	}
	
	let options = {
		line: {
			plugins: {
				deferred: {
					yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
					delay: 0      // delay of 500 ms after the canvas is considered inside the viewport
				}
			},
			legend: {
				labels: {
					// This more specific font property overrides the global property
					fontColor: DEFAULT_STYLES.colors.fontColor
				},
				position: 'bottom',
				onHover: function(e, legendItem) {
					let index = legendItem.datasetIndex;
					let ci = this.chart;
					
					ci.data.datasets.forEach((value, key) => {
						if(key !== index) {
							value.borderColor = Chart.helpers.color(value.borderColor).alpha(0.2).rgbString();
							value.backgroundColor = Chart.helpers.color(value.backgroundColor).alpha(0.1).rgbString();
							value.borderWidth = DEFAULT_STYLES.lines.borderWidth;
							value.pointRadius = 1;
						} else {
							value.borderColor = Chart.helpers.color(value.borderColor).alpha(1).rgbString();
							value.backgroundColor = Chart.helpers.color(value.backgroundColor).alpha(0.5).rgbString();
							value.borderWidth = DEFAULT_STYLES.lines.borderBoldWidth;
							value.pointRadius = 3;
						}
					})
					// rerender the chart
					ci.update();
				},
			},
			tooltips: {
				mode: 'index',
				intersect: true
			},
			scales: {
				yAxes: [{
					gridLines: {
						color: DEFAULT_STYLES.colors.gridLinesColor,
						lineWidth: DEFAULT_STYLES.lines.gridWidth
					},
          ticks: {
            suggestedMin: 0,
            suggestedMax: 10,
          }
				}],
				xAxes: [{
					scaleLabel: DEFAULT_STYLES.colors.fontColor,
					gridLines: {
						drawBorder: false,
						color: DEFAULT_STYLES.colors.gridLinesColor,
						lineWidth: DEFAULT_STYLES.lines.gridWidth
					},
				}],
			},
			zoom: {
				// Boolean to enable zooming
				enabled: true,
				// Drag-to-zoom rectangle style can be customized
				backgroundColor: theme == 'theme_default' ? 'rgb(0,0,0,0.2)' : 'rgb(225,225,225,0.3)',
				// Zooming directions. Remove the appropriate direction to disable
				mode: 'x',
			}
		},
		pie: {
			title: {
				display: true,
				fontSize: 14
			},
			legend: {
				labels: {
					// This more specific font property overrides the global property
					fontColor: DEFAULT_STYLES.colors.fontColor
				},
				position: 'bottom',
			},
			animation: {
				animateScale: true,
				animateRotate: true
			}
		},
		bar: {
			plugins: {
				deferred: {
					yOffset: '50%', // defer until 50% of the canvas height are inside the viewport
					delay: 0      // delay of 500 ms after the canvas is considered inside the viewport
				}
			},
			title: {
				display: true,
			},
			legend: {
				labels: {
					fontColor: DEFAULT_STYLES.colors.fontColor
				},
				position: 'bottom'
			},
			tooltips: {
				mode: 'index',
				intersect: false
			},
			scales: {
				yAxes: [{
					gridLines: {
						color: DEFAULT_STYLES.colors.gridLinesColor,
						lineWidth: DEFAULT_STYLES.lines.gridWidth
					},
          ticks: {
            suggestedMin: 0,
            suggestedMax: 10,
          }
				}],
				xAxes: [{
					scaleLabel: DEFAULT_STYLES.colors.fontColor,
					gridLines: {
						drawBorder: false,
						color: DEFAULT_STYLES.colors.gridLinesColor,
						lineWidth: DEFAULT_STYLES.lines.gridWidth,
						offsetGridLines: false
					},
				}],
			}
		}
	};
	let ChartJs = {
		Chart: Chart,
		getOptions: function (type) {
			let typeOptions = type && options[type] || {};
			return angular.merge({}, globalDefaultOptions, typeOptions);
		}
	};
	
	/**
	 * Allow to set global options during configuration
	 */
	this.setOptions = function (type, customOptions) {
		// If no type was specified set option for the global object
		if (! customOptions) {
			customOptions = type;
			options = angular.merge(options, customOptions);
		} else {
			// Set options for the specific chart
			options[type] = angular.merge(options[type] || {}, customOptions);
		}
		
		angular.merge(ChartJs.Chart.defaults, options);
	};
	
	this.$get = function () {
		return ChartJs;
	};
}

export function ChartJsFactory (ChartJs, $timeout) {
	return function chart (type) {
		return {
			restrict: 'CA',
			scope: {
				chartGetColor: '=?',
				chartType: '=',
				chartData: '=?',
				chartLabels: '=?',
				chartOptions: '=?',
				chartSeries: '=?',
				chartFill: '=?',
				chartColors: '=?',
				chartClick: '=?',
				chartHover: '=?',
				chartDatasetOverride: '=?'
			},
			link: function (scope, elem/*, attrs */) {
				let unSubscribers = [];
				// Order of setting "watch" matter
				unSubscribers.push(scope.$watchGroup(['chartData','chartSeries','chartLabels','chartOptions','chartColors','chartDatasetOverride','chartType'], watchData, true));
				
				scope.$on('$destroy', function () {
					unSubscribers.forEach((unSubscribe) => {
						unSubscribe();
					});
					
					destroyChart(scope);
				});
				
				scope.$on('$resize', function () {
					if (scope.chart) scope.chart.resize();
				});
				
				function watchData (newVal, oldVal) {
					// if (! newVal[0] || ! newVal[0].length || (Array.isArray(newVal[0][0]) && ! newVal[0][0].length)) {
					// 	// destroyChart(scope);
					// 	return;
					// }
					if (angular.equals(newVal, oldVal)) return;
					
					let chartType = type || scope.chartType;
					if (! chartType) return;
					
					scope.chartType = scope.chartType || chartType;
					if (scope.chart)
						return updateChart(newVal, scope);
					
					createChart(chartType, scope, elem);
				}
				
				function watchOther (newVal, oldVal) {
					if (isEmpty(newVal)) return;
					if (angular.equals(newVal, oldVal)) return;
					let chartType = type || scope.chartType;
					if (! chartType) return;
					
					// chart.update() doesn't work for series and labels
					// so we have to re-create the chart entirely
					createChart(chartType, scope, elem);
				}
				
				function watchType (newVal, oldVal) {
					if (isEmpty(newVal)) return;
					if (angular.equals(newVal, oldVal)) return;
					createChart(newVal, scope, elem);
				}
			}
		};
	};
	
	function createChart (type, scope, elem) {
		let options = getChartOptions(type, scope);
		if (! hasData(scope) || ! canDisplay(type, scope, elem, options)) return;
		
		let cvs = elem[0];
		let ctx = cvs.getContext('2d');
		
		scope.chartGetColor = getChartColorFn(scope);
		let data = getChartData(type, scope);
		// Destroy old chart if it exists to avoid ghost charts issue
		// https://github.com/jtblin/angular-chart.js/issues/187
		destroyChart(scope);
		
		scope.chart = new ChartJs.Chart(ctx, {
			type: type,
			data: data,
			options: options
		});
		scope.$emit('chart-create', scope.chart);
		bindEvents(cvs, scope);
	}
	
	function canUpdateChart (newVal, oldVal) {
		if (newVal && oldVal && newVal.length && oldVal.length) {
			return Array.isArray(newVal[0]) ?
				newVal.length === oldVal.length && newVal.every(function (element, index) {
					return element.length === oldVal[index].length; }) :
				oldVal.reduce(sum, 0) > 0 ? newVal.length === oldVal.length : false;
		}
		return false;
	}
	
	function sum (carry, val) {
		return carry + val;
	}
	
	function getEventHandler (scope, action, triggerOnlyOnChange) {
		let lastState = {
			point: void 0,
			points: void 0
		};
		return function (evt) {
			let atEvent = scope.chart.getElementAtEvent || scope.chart.getPointAtEvent;
			let atEvents = scope.chart.getElementsAtEvent || scope.chart.getPointsAtEvent;
			if (atEvents) {
				let points = atEvents.call(scope.chart, evt);
				let point = atEvent ? atEvent.call(scope.chart, evt)[0] : void 0;
				
				if (triggerOnlyOnChange === false ||
					(! angular.equals(lastState.points, points) && ! angular.equals(lastState.point, point))
				) {
					lastState.point = point;
					lastState.points = points;
					scope[action](points, evt, point);
				}
			}
		};
	}
	
	function getOnClick(scope) {
		
		return function(evt) {
			
			if(typeof scope.chartClick == 'function') {
				scope.chartClick(evt,scope.chart);
			}
		}
	}
	
	function getOnHover(scope) {
		return function(evt) {
			if(typeof scope.chartHover == 'function') {
				scope.chartHover(evt, scope.chart)
			}
		}
	}
	
	function getColors (type, scope) {
		let colors = angular.copy(scope.chartColors ||
			ChartJs.getOptions(type).chartColors ||
			Chart.defaults.global.colors
		);
		let notEnoughColors = colors.length < scope.chartData.length;
		while (colors.length < scope.chartData.length) {
			colors.push(scope.chartGetColor());
		}
		// mutate colors in this case as we don't want
		// the colors to change on each refresh
		if (notEnoughColors) scope.chartColors = colors;
		
		let res = []
		colors.forEach((color) => {
      res.push(convertColor(color, scope))
		});
    
    return res;
  }
	
	function convertColor (color, scope) {
		// Allows RGB and RGBA colors to be input as a string: e.g.: "rgb(159,204,0)", "rgba(159,204,0, 0.5)"
		if (typeof color === 'string' && color.startsWith('rgb')) return getColor(rgbStringToRgb(color), scope);
		// Allows hex colors to be input as a string.
		if (typeof color === 'string' && color[0] === '#') return getColor(hexToRgb(color.substr(1)), scope);
		// Allows colors to be input as an object, bypassing getColor() entirely
		if (typeof color === 'object' && color !== null) return color;
		// Allows colors to be input as a color string.
		// if (typeof color === 'string'&& !isEmpty(color)) return color;
		return getRandomColor(scope);
	}
	
	function getRandomColor (scope) {
		let color = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
		return getColor(color,scope);
	}
	
	function getColor (color, scope) {
		let alpha = color[3] || 1;
		color = color.slice(0, 3);
		return {
			backgroundColor: rgba(color, 0.2),
			pointBackgroundColor: rgba(color, alpha),
			pointHoverBackgroundColor: rgba(color, 0.8),
			borderColor: rgba(color, alpha),
			pointRadius: 1,
			// pointBorderColor: '#fff',
			pointHoverBorderColor: rgba(color, alpha),
			// pointHoverBorderColor: '#fff',
			fill: (scope && scope.chartFill == true) ? true : false,
			lineTension: 0
		};
	}
	
	function getRandomInt (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	function rgba (color, alpha) {
		// rgba not supported by IE8
		return false ? 'rgb(' + color.join(',') + ')' : 'rgba(' + color.concat(alpha).join(',') + ')';
	}
	
	// Credit: http://stackoverflow.com/a/11508164/1190235
	function hexToRgb (hex) {
		let bigint = parseInt(hex, 16),
			r = (bigint >> 16) & 255,
			g = (bigint >> 8) & 255,
			b = bigint & 255;
		
		return [r, g, b];
	}
	
	function rgbStringToRgb (color) {
		let match = color.match(/^rgba?\(([\d,.]+)\)$/);
		if (! match) throw new Error('Cannot parse rgb value');
		color = match[1].split(',');
		return color.map(Number);
	}
	
	function hasData (scope) {
		return scope.chartData && scope.chartData.length;
	}
	
	function getChartColorFn (scope) {
		return typeof scope.chartGetColor === 'function' ? scope.chartGetColor : getRandomColor;
	}
	
	function getChartData (type, scope) {
		let colors = getColors(type, scope);
		return Array.isArray(scope.chartData[0]) ?
			getDataSets(scope.chartLabels, scope.chartData, scope.chartSeries || [], colors, scope.chartDatasetOverride) :
			getData(scope.chartLabels, scope.chartData, colors, scope.chartDatasetOverride);
	}
	
	function getDataSets (labels, data, series, colors, datasetOverride) {
		return {
			labels: labels,
			datasets: data.map(function (item, i) {
				let dataset = angular.merge({}, colors[i], {
					label: series[i],
					data: item
				});
				if (datasetOverride && datasetOverride.length >= i) {
					angular.merge(dataset, datasetOverride[i]);
				}
				return dataset;
			})
		};
	}
	
	function getData (labels, data, colors, datasetOverride) {
		let dataset = {
			labels: labels,
			datasets: [{
				data: data,
				backgroundColor: colors.map(function (color) {
					return color.pointBackgroundColor;
				}),
				hoverBackgroundColor: colors.map(function (color) {
					return color.backgroundColor;
				})
			}]
		};
		if (datasetOverride) {
			angular.merge(dataset.datasets[0], datasetOverride);
		}
		return dataset;
	}
	
	function getChartOptions (type, scope) {
		return angular.merge({}, ChartJs.getOptions(type), scope.chartOptions);
	}
	
	function bindEvents (cvs, scope) {
		cvs.onclick = getOnClick(scope);
		cvs.onmousemove = getOnHover(scope);
	}
	
	function updateChart (values, scope) {
		let options = getChartOptions(scope.chartType, scope);
		// if (! hasData(scope)) {
		// 	destroyChart(scope);
		// 	return;
		// }
		
		scope.chartGetColor = getChartColorFn(scope);
		let data = getChartData(scope.chartType, scope);
		
		scope.chart.data  = data;
		scope.chart.options = options;
		
		scope.chart.update();
		scope.$emit('chart-update', scope.chart);
	}
	
	function isEmpty (value) {
		return ! value ||
			(Array.isArray(value) && ! value.length) ||
			(typeof value === 'object' && ! Object.keys(value).length);
	}
	
	function canDisplay (type, scope, elem, options) {
		// TODO: check parent?
		if (options.responsive && elem[0].clientHeight === 0) {
			$timeout(function () {
				createChart(type, scope, elem);
			}, 50, false);
			return false;
		}
		return true;
	}
	
	function destroyChart(scope) {
		if(! scope.chart) return;
		scope.chart.destroy();
		scope.$emit('chart-destroy', scope.chart);
	}
}

function getTheme() {
	const CONST_LOCAL_STORAGE_KEY = 'userPrefs__';
	const CONST_THEME = 'theme';
	let theme =  window.localStorage.getItem(CONST_LOCAL_STORAGE_KEY + CONST_THEME);
	
	return theme || 'theme_default';
}

function _randomColorFactor() {
	return Math.round(Math.random() * 255);
}

function getRandomColor(opacity) {
	return 'rgba(' + this._randomColorFactor() + ',' + this._randomColorFactor() + ',' + this._randomColorFactor() + ',' + (opacity || '.3') + ')';
}

function pad(number) {
	if ( number < 10 ) {
		return '0' + number;
	}
	return number;
}

