const router = require('express').Router(),
  cloudLib = require('../lib/cloud'),
  _ = require('lodash');

router.post('/login', function (req, res) {
  let username = req.body.username,
    password = req.body.password;

  let account = login(username, password);
  if (account) {
    res.json(account);
  }
  else {
    res.status(401).json('invalid login');
  }
});


router.get('/logout', function (req, res) {
  res.end();
});

function login(username, password) {
  let account;
  let useraccounts = _.cloneDeep(cloudModel.useraccounts).map((user, index) => {
    return user.toJson();
  });
  useraccounts.forEach((user) => {
    if (user.user_name === username && user.password === password) {
      account = {
        'user_name': user.user_name,
        'groups': user.groups
      };
    }
  });
  return account;
}
module.exports = router;