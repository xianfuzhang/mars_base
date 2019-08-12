var express = require('express'),
  path = require('path'),
  bodyParser = require('body-parser'),
  initController = require('./controllers/init');
  deviceController = require('./controllers/device'),
  endPointController = require('./controllers/endpoint'),
  statisticController = require('./controllers/statistic'),
  flowController = require('./controllers/flow'),
  alertRuleController = require('./controllers/alertRule'),
  alertController = require('./controllers/alert'),
  logController = require('./controllers/log'),
  clusterController = require('./controllers/cluster'),
  useraccountController = require('./controllers/useraccount'),
  loginController = require('./controllers/login'),
  confighistoryController = require('./controllers/confighistory'),
  // configurationController = require('./controllers/configuration'),
  networkConfigurationController = require('./controllers/network_configuration'),
  analyzerController = require('./controllers/analyzer'),
  flowgroupController = require('./controllers/flowgroup'),
  intentController = require('./controllers/intent'),
  dhcpController = require('./controllers/dhcp'),
  elasticsearchController = require('./controllers/elasticsearch'),
  tenantController = require('./controllers/tenant'),
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
app.use('/mars/v1', deviceController);
app.use('/mars/v1/hosts', endPointController);
app.use('/mars/v1/statistics', statisticController);
app.use('/mars/useraccount/v1', useraccountController);
app.use('/mars/v1/flows', flowController);
app.use('/mars/healthycheck/v1', alertRuleController);
app.use('/mars/alert/v1', alertController);
app.use('/mars/utility/logs/v1', logController);
app.use('/mars/v1/cluster', clusterController);
app.use('/mars/v1', loginController);
// app.use('/mars/v1/configuration', configurationController);
app.use('/mars/v1/network/configuration', networkConfigurationController);
app.use('/mars/utility/confighistory/v1', confighistoryController);
app.use('/mars/analyzer/v1/timerangebar', analyzerController);
app.use('/mars/v1/intents', intentController);
app.use('/mars/v1/groups', flowgroupController);
app.use('/mars/dhcpserver/ztp/v1/dhcpserver', dhcpController);
app.use('/mars/utility/elasticsearch/v1', elasticsearchController);
app.use('/mars/v1/tenants/v1', tenantController)

// set port
app.set('port', (process.env.PORT || 4001));

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