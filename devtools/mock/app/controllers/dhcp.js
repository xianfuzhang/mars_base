const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  {AlertRule} = require('../models/alert'),
  _ = require('lodash');

router.get('/mappings', function (req, res) {
  let bindings = [
    {mac:'0A:0A:0A:0A:0A:0A',ip:'0.0.0.1'},
    {mac:'0A:1B:1A:1A:1A:1A',ip: '0.0.0.2'},
     {mac:'2A:2A:2A:2A:2A:2A',ip: '1.1.1.1'},
     {mac:'2A:3B:3A:3A:3A:3A',ip: '1.1.1.2'},
     {mac:'4A:4A:4A:4A:4A:4A',ip: '2.2.1.2'}
  ]
  
  return res.json({binding: bindings});
});

module.exports = router;