/**
 * Created by wls on 2018/10/9.
 */
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

rimraf.sync('public');
mkdirp('public', function (err) {
  if (err)
    console.error(err);
  else
    console.log('pow!');
});
