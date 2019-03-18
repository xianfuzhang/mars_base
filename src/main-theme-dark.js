import './themes/dark/index.scss';

import 'angular';
import 'angular-cookies';
import 'angular-route';
import 'angular-translate';
import 'angular-ui-bootstrap';

import 'lodashService';
import 'crypto';
import 'c3Service';
import 'uuid';
import 'easing';
import 'apis';
import 'localStore';
import 'ngTable';
import 'eventEmitter';
import 'chart';

import 'login';
import 'dashboard';
import 'fabric';
import 'logical';
import 'configuration';
import 'alert';
import 'log';
import 'manage';

import 'mdc';
import 'mdlHeader';
import 'contentHeader';
import 'staticTable';
import 'mdlTable';
import 'modal';
import 'menu';
import 'marDrawer';
import 'marHeader';
import 'marSection';
import 'contentPanel';
import 'footer';
import 'topo';
import 'validInput';
import 'loading';
import 'deviceTooltip';
import 'linkTooltip';
import 'wizard';
import 'datePicker';
import 'marButton';
import 'jsonEditor';
import 'gradientScale';
import 'splineChart';
import 'marChart';

import {setLanguage, configTranslate, configRouterfunction, configHttpProvider, mainCtrl} from './base';

angular
  .module('marsApp', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
    'pascalprecht.translate',
    '_',
    'c3',
    'uuid',
    'eventEmitter',
    'ngTable',
    'crypto',
    // ngTableModule.name,
    'easing',
    'apis',
    'localStore',
    'dashboard',
    'login',
    'fabric',
    'logical',
    'configuration',
    'alert',
    'log',
    'manage',
    'mdc',
    'mdlHeader',
    'mdlTable',
    'modal',
    'menu',
    'marDrawer',
    'marHeader',
    'contentHeader',
    'staticTable',
    'marSection',
    'contentPanel',
    'footer',
    'topo',
    'validInput',
    'loading',
    'deviceTooltip',
    'linkTooltip',
    'wizard',
    'date-picker',
    'marButton',
    'jsonEditor',
    'gradientScale',
    'splineChart',
    'marChart'
  ])
  .factory('setLanguage', ['$q', setLanguage])
  .config(['$translateProvider', configTranslate])
  .config(['$routeProvider', '$locationProvider', configRouterfunction])
  .config(['$httpProvider', configHttpProvider])
  .controller('mainCtrl', ['$scope', '$rootScope', mainCtrl]);
