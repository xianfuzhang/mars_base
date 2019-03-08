angular
  .module('chart', [])
  .factory('chart', function () {
    let chart = require('chart.js');
    
    // plugins
    require('./chart-range-selection');
    
    let defferred = require('chartjs-plugin-deferred');
	  chart.plugins.register(defferred);
    
    return chart;
  });