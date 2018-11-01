const router = require('express').Router(),
      cloudLib = require('../lib/cloud');

router.get('/', (req, res) => {
  return res.json({intents: cloudModel.intents});
});
router.post('/', function (req, res) {
	if(cloudLib.addIntent(req.body.params)) {
    return res.status(200).json('Success to add new intent!');
  } else {
    return res.status(400).json('Failed to add new intent!');
  }
});
router.delete('/:appId/:key', function(req, res) {
	if (!req.params.appId) {
    return res.status(404).json('App Id is required!');
  }
  if (!req.params.key) {
    return res.status(404).json('Key is required!');
  }
  let index = cloudModel.intents.findIndex((intent) => {
    return intent.id === req.params.key;
  })
  
  if (index != -1) {
    cloudModel.intents.splice(index, 1);
    return res.status(200).json("This intent has been deleted!");
  } else {
    return res.status(404).json("This intent does not exist!");
  }
});
module.exports = router;