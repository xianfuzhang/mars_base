const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  _ = require('lodash');

router.get('/history/list', function (req, res) {
  
  return res.json({history: cloudModel.alerts});
});


module.exports = router;