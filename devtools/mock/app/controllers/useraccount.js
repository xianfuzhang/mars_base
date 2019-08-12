const router = require('express').Router(),
  cloudLib = require('../lib/cloud'),
  _ = require('lodash');

router.get('/', function (req, res) {
  let useraccounts = _.cloneDeep(cloudModel.useraccounts).map((user, index) => {
    return user.toJson();
  });

  return res.json({users: useraccounts});
});

router.post('/', function (req, res) {
  let username = req.body.user_name;
  let exists = checkUsernameExists(username);
  if (exists) {
    res.status(401).json('username has exists');
  }
  else {
    cloudLib.addUserAccount(req.body);
    res.end();
  }
});

router.delete('/:user_name', (req, res) => {
  if (!req.params.user_name) {
    return res.status(404).json('User name is required!');
  }
  let result = cloudLib.deleteUserAccount(req.params.user_name);
  if (result) {
    return res.status(200).json("This endpoint has been deleted!");
  } else {
    return res.status(400).json("Failed to delete the endpoint!");
  }
});

router.get('/:user_name', (req, res) => {
  if (!req.params.user_name) {
    return res.status(404).json('User name is required!');
  }
  let useraccount = cloudModel.useraccounts.filter((account) => {
    return account.user_name === req.params.user_name;
  });
  if (useraccount.length > 0) {
    return res.status(200).json(useraccount[0]);
  }
  else {
    return res.status(404).json('user not exists.');
  }
  
});

function checkUsernameExists(username) {
  let index = _.findIndex(cloudModel.useraccounts, (item) => {
    return item.user_name === username;
  });

  if (index === -1){
    return false;
  }
  else {
    return true;
  }
}

module.exports = router;