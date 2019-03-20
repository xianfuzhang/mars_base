angular
  .module('chart', [])
  .factory('chart', function () {
    let Chart = require('chart.js');
    
    return Chart;
  });