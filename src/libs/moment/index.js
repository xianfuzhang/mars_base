angular
  .module('moment', [])
  .factory('moment', function () {
    let moment = require('moment');
    
    return moment;
  });