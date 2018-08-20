const express = require('express'),
  router = express.Router(),
  _ = require('lodash');

router.get('/controller', function (req, res) {
  
  return res.json({logs: cloudModel.logs});
});


module.exports = router;