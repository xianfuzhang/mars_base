const express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  path = require('path');

const configFilePath = path.join(__dirname, '../assets/network');

router.get('/files', function (req, res) {
  
  let files = fs.readdirSync(configFilePath);
  
  res.json({files:files});
});

router.get('/files/:filename', function (req, res) {
  
  let filepath = path.join(configFilePath, req.params.filename);
  
  if(fs.existsSync(filepath)) {
    try {
      res.json(JSON.parse(fs.readFileSync(filepath)));
    } catch(e) {
      console.error(`Error occurred when read file:${filepath}!`);
      res.status(504).json('Error occurred when read this file!');
    }
  } else {
    res.status(404).json('This file does not exist!');
  }
});


module.exports = router;