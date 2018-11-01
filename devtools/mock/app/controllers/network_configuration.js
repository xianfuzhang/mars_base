const express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  path = require('path');

const configFilePath = path.join(__dirname, '../assets/network');

// router.get('/', function (req, res) {
//   let file = '../assets/startup_netcfg';
//   let filepath = path.join(__dirname, file);
//
//   let config = JSON.parse(fs.readFileSync(filepath));
//
//   res.json(config);
// });
//
// router.post('/', function (req, res) {
//   let file = '../assets/startup_netcfg';
//   let filepath = path.join(__dirname, file);
//
//   fs.writeFile(filepath, JSON.stringify(req.body), null, (err) => {
//     if(err) {
//       res.status(500).json('Fail to save the configuration file!');
//     } else {
//       res.status(200).json('Success to save the configuration file!');
//     }
//   })
// });

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

router.post('/file-modify/:filename', function (req, res) {
  let filepath = ''
  if(req.params.filename == 'startup_netcfg') {
    filepath = path.join(__dirname, '../assets/', req.params.filename);
  } else {
    filepath = path.join(configFilePath, req.params.filename);
  }
  
  fs.writeFile(filepath, JSON.stringify(req.body), null, (err) => {
    if(err) {
      res.status(500).json(`Fail to save the ${req.params.filename} file!`);
    } else {
      res.status(200).json(`Success to save the ${req.params.filename} file!`);
    }
  })
});

module.exports = router;