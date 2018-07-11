var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  initController = require('./controllers/init');
  deviceController = require('./controllers/device'),
  endPointController = require('./controllers/endpoint'),
  app = express(),
  //expressSession = require('express-session'),
  cookieParser = require('cookie-parser');

var sessionParser = require('express-session')({
    secret:"secret",
    resave: true,
    saveUninitialized: true
});
// bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// setup the session
app.use(sessionParser);

// setup middleware
//app.use(ensureAuthenticated);

app.use(initController);
// setup the routes
app.use('/', deviceController);
app.use('/', endPointController);

// set port
app.set('port', (process.env.PORT || 3001));

var server = app.listen(app.get('port'), function () {
  console.log('Mock server started on port ' + app.get('port'));
});

function ensureAuthenticated (req, res, next) {
  if (isAuthenticated(req)) {
    return next();
  } else {
    res.status(401).json('Unauthorized');
  }
}

function isAuthenticated (req) {
  console.log('Returns that you are authenticated');
  return true;
}
