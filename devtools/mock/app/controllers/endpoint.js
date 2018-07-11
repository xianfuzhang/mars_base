const router = require('express').Router(),
      cloudLib = require('../lib/cloud');

router.get('/endpoints', (req, res) => {
  return res.json({hosts: cloudModel.endpoints});
});

router.get('/endpoints/:mac/:segment', (req, res) => {
  if (!req.params.mac) {
    return res.status(404).json('Mac address is required!');
  }
  
  if (!req.params.segment) {
    return res.status(404).json('Segment name is required!');
  }
  
  let host = cloudModel.endpoints.find(endpoint => endpoint.mac === req.params.mac && endpoint.segment === req.params.segment);
  
  if(!host) {
    return res.status(404).json("Cann't find the endpoint!");
  }
  
  return res.json(host);
});

router.delete('/endpoints/:tenant/:segment/:mac', (req, res) => {
  if (!req.params.tenant) {
    return res.status(404).json('Tenant is required!');
  }
  
  if (!req.params.segment) {
    return res.status(404).json('Segment name is required!');
  }
  
  if (!req.params.mac) {
    return res.status(404).json('Mac address is required!');
  }
  
  let result = cloudLib.deleteEndpoint(req.params.tenant, req.params.segment, req.params.mac);
  if (result) {
    return res.status(200).json("This endpoint has been deleted!");
  } else {
    return res.status(400).json("Failed to delete the endpoint!");
  }
});

router.post('/devices', function(req, res) {
  //  TODO: need validation
  if(params.mac
    && params.tenant
    && params.segment
    && params.location
    && params.location.device_id
    && params.location.port) {
  
    if(cloudLib.addEndpoint(req.body)) {
      return res.status(200).json('Success to add new endpoint!');
    } else {
      return res.status(400).json('Failed to add new endpoint!');
    }
    
  } else {
    return res.status(400).json('The request params to add new endpoint are invalid!');
  }
});

module.exports = router;