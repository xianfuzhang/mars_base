angular
  .module('crypto', [])
  .factory('crypto', function () {
    let crypto = require('crypto-js');
    return crypto;
  });