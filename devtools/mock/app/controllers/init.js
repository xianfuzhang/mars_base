const cloudLib = require('../lib/cloud');
// const _ = require('lodash');

function init(req, res, next) {
  
  if (cloudLib.isCloudEmpty()) {
    cloudLib.createCloud();
  }
  
  next();
}

module.exports = init;