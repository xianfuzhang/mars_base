import './themes/dark/index.scss';

import 'angular';
import 'angular-cookies';
import 'angular-route';
import 'angular-animate';
import 'angular-material';
import 'angular-messages';
import 'angular-route';
import 'angular-translate';
import 'angular-ui-bootstrap';

import 'lodashService';
import 'crypto';
import 'c3Service';
import 'd3Service';
import 'uuid';
import 'easing';
import 'apis';
import 'localStore';
import 'ngTable';
import 'eventEmitter';
import 'moment';

import 'login';
import 'dashboard';
import 'function';
import 'fabric';
import 'logical';
import 'configuration';
import 'alert';
import 'log';
import 'manage';
import 'vlan';

import 'mdc';
import 'mdlHeader';
import 'contentHeader';
import 'staticTable';
import 'mdlTable';
import 'modal';
import 'menu';
import 'toggleMenu';
import 'marDrawer';
import 'marHeader';
import 'marSection';
import 'contentPanel';
import 'footer';
import 'topo';
import 'forceTopo';
import 'vlanTopo';
import 'validInput';
import 'loading';
import 'deviceTooltip';
import 'linkTooltip';
import 'chartTooltip';
import 'wizard';
import 'datePicker';
import 'marButton';
import 'jsonEditor';
import 'gradientScale';
import 'splineChart';
import 'marChart';
import 'portsGroup';
import 'languageSelection';

import {setLanguage, configTranslate, configRouterfunction, configHttpProvider, mainCtrl, configDateLocaleProvider} from './base';

angular
  .module('marsApp', [
    'ngRoute',
    'ngCookies',
    'ngAnimate',
    'ngMaterial', 'ngMessages',
    'ui.bootstrap',
    'pascalprecht.translate',
    '_',
    'c3',
    'd3',
    'uuid',
    'eventEmitter',
    'ngTable',
    'crypto',
    // ngTableModule.name,
    'easing',
    'moment',
    'apis',
    'localStore',
    'dashboard',
    'function',
    'login',
    'fabric',
    'logical',
    'configuration',
    'alert',
    'log',
    'manage',
    'vlan',
    'mdc',
    'mdlHeader',
    'mdlTable',
    'modal',
    'menu',
    'toggleMenu',
    'marDrawer',
    'marHeader',
    'contentHeader',
    'staticTable',
    'marSection',
    'contentPanel',
    'footer',
    'topo',
    'forceTopo',
    'vlanTopo',
    'validInput',
    'loading',
    'deviceTooltip',
    'linkTooltip',
    'chartTooltip',
    'wizard',
    'date-picker',
    'marButton',
    'jsonEditor',
    'gradientScale',
    'splineChart',
    'marChart',
    'portsGroup',
    'languageSelection'
  ])
  .factory('setLanguage', ['$q', setLanguage])
  .config(['$translateProvider', configTranslate])
  .config(['$routeProvider', '$locationProvider', configRouterfunction])
  .config(['$httpProvider', configHttpProvider])
  .config(['$mdDateLocaleProvider',configDateLocaleProvider])
  .controller('mainCtrl', ['$scope', '$rootScope', mainCtrl]);
