angular
  .module('uuid', [])
  .factory('uuid', function () {
    let uuid = require('./ng/uuid.service');
    return uuid;
  });
