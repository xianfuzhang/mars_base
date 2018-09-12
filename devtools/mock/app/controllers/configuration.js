const express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  path = require('path');

router.get('/', function (req, res) {
  let file = '../assets/configuration.json';
  let filepath = path.join(__dirname, file);
  
  let config = JSON.parse(fs.readFileSync(filepath));
  
  res.json(config);
});

module.exports = router;