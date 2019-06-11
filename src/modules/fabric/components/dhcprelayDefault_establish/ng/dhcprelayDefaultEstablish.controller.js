export class DHCPRelayDefaultEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$filter',
      '$timeout',
      '$q',
      '_',
      'deviceDataManager',
    ];
  }

  constructor(...args) {
    this.di = {};
    DHCPRelayDefaultEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unsubscribes = [];
    this.scope = this.di.$scope;
    let scope = this.di.$scope;
    let rootScope = this.di.$rootScope;
    let di = this.di;
    let deviceDataManager = this.di.deviceDataManager;
    this.translate = this.di.$filter('translate');

    scope.queue_regex = '^[0-7]$';
    scope.deviceId = null;
    scope.isEdit = false;

    scope.isFromDeviceDetail = false;

    scope.showWizard = false;
    scope.title = this.translate("MODULES.DHCP_RELAY.DHCPRELAY_DEFAULT.WIZARD");
    scope.steps = [
      {
        id: 'step1',
        title: this.translate('MODULES.DHCP_RELAY.DHCPRELAY_DEFAULT.WIZARD'),
        content: require('../template/dhcprelay_default_establish'),
      }
    ];

    scope.dhcpRelayModel = {
      segment_name: '',
      device: null,
      port: null,
      vlan: '',
      ip_address: '',
      ports: [],
      relayAgentIps: [],
      server_ips: [],
      gateway_ips: [],
      server_ip: '',
      gateway_ip: '',
    };

    scope.displayLabel = {
      device: {'options': [], hint: this.translate('MODULES.SWITCHES.TAB.SCHEMA.SWITCH')},
      device4add: {'options': []},
      // port: {'options': [], hint: this.translate('MODULES.SWITCHES.SWITCH.COLUMN.PORT')},
      port: {'options': [], hint:'端口'},
      tag: {
        'options': [
          {'label': 'Tag', 'value': 'tag'},
          {'label': 'Untag', 'value': 'untag'}
        ]
      }
    };

    let inValidJson = {
      valid: false,
      errorMessage: ''
    };


    let validJson = {
      valid: true,
      errorMessage: ''
    };

    function validCurrentDom(dom_class) {
      let out = document.getElementsByClassName(dom_class);

      if (out && out.length === 1) {
        let invalidDoms = out[0].getElementsByClassName('ng-invalid');
        if (invalidDoms && invalidDoms.length > 0) {
          return false;
        }
      }
      return true;
    }


    scope.removeRelayIps = ($index) => {
      this.di._.remove(scope.dhcpRelayModel.relayAgentIps, function (n, index) {
        return $index === index;
      });
    };

    scope.addRelayIps = () => {
      scope.dhcpRelayModel.relayAgentIps.push({'device': scope.displayLabel.device.options[0], 'ipv4': '', 'ipv6': ''});
    };

    scope.cancel = function () {
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };


    scope.addServerIP = () => {
      if ((!this.isIPv4(scope.dhcpRelayModel.server_ip) && !this.isIPv6(scope.dhcpRelayModel.server_ip))
        || scope.dhcpRelayModel.server_ips.indexOf(scope.dhcpRelayModel.server_ip) > -1)
        return;

      scope.dhcpRelayModel.server_ips.push(scope.dhcpRelayModel.server_ip);
    }

    scope.removeSelectedServerIP = (ip) => {
      let index = scope.dhcpRelayModel.server_ips.indexOf(ip);
      if (index > -1) {
        scope.dhcpRelayModel.server_ips.splice(index, 1);
      }

      // const length = scope.dhcpRelayModel.ip_addresses.length;
      // if(length == 0) {
      //   scope.nexthopEsModel.ip_address = '';
      // } else {
      //   scope.nexthopEsModel.ip_address = scope.segmentModel.ip_addresses[length - 1];
      // }
    }


    scope.addGatewayIP = () => {
      if ((!this.isIPv4(scope.dhcpRelayModel.gateway_ip) && !this.isIPv6(scope.dhcpRelayModel.gateway_ip))
        || scope.dhcpRelayModel.gateway_ips.indexOf(scope.dhcpRelayModel.gateway_ip) > -1)
        return;

      scope.dhcpRelayModel.gateway_ips.push(scope.dhcpRelayModel.gateway_ip);
    };

    scope.removeSelectedGatewayIP = (ip) => {
      let index = scope.dhcpRelayModel.gateway_ips.indexOf(ip);
      if (index > -1) {
        scope.dhcpRelayModel.gateway_ips.splice(index, 1);
      }

      // const length = scope.dhcpRelayModel.ip_addresses.length;
      // if(length == 0) {
      //   scope.nexthopEsModel.ip_address = '';
      // } else {
      //   scope.nexthopEsModel.ip_address = scope.segmentModel.ip_addresses[length - 1];
      // }
    }

    let genPortValue4Sub = () => {
      let ports = [];
      this.di._.forEach(scope.hostSegmentModel.ports, (port) => {
        let portStr = '';
        if (port.type === 'port') {
          portStr = port.number + '/' + port.tagValue.value;
        } else {
          portStr = 'trunk' + port.number + '/' + port.tagValue.value;
        }
        ports.push(portStr)
      })
      return ports;
    };

    let _formatRelayIps = (ips) =>{
      let res = {};
      ips.forEach((relay_ip)=>{
        res[relay_ip.device.value] = {ipv4: relay_ip.ipv4, ipv6: relay_ip.ipv6};
      })
      return res;
    }

    scope.submit = function () {
      let inValidJson_Copy = angular.copy(inValidJson);
      let params = {};
      params['dhcpServerConnectPoint'] = scope.dhcpRelayModel.device.value + '/' + scope.dhcpRelayModel.port.value;
      params['serverIps'] = scope.dhcpRelayModel.server_ips;
      params['gatewayIps'] = scope.dhcpRelayModel.gateway_ips;
      params['relayAgentIps'] = _formatRelayIps(scope.dhcpRelayModel.relayAgentIps);

      di.$rootScope.$emit('page_dhcprelay_default_es');
      if (!validCurrentDom('dhcprelay_default_establish')) {
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      if (params['serverIps'].length === 0) {
        inValidJson_Copy['errorMessage'] = "请至少添加一个服务IP地址!";
        return new Promise((resolve, reject) => {
          resolve(inValidJson_Copy);
        });
      }

      return new Promise((resolve, reject) => {
        deviceDataManager.postDHCPRelayDefault({'default':[params]})
          .then(() => {
            rootScope.$emit('relay-default-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            resolve({valid: false, errorMessage: err.message});
          });
      });
    };


    scope.open = () => {
      if (scope.showWizard) return;

      scope.displayLabel.device.options = [];
      scope.displayLabel.port.options = [];
      scope.displayLabel.device4add.options = [];
      scope.dhcpRelayModel = {
        segment_name: '',
        device: null,
        port: null,
        vlan: '',
        ip_address: '',
        ports: [],
        relayAgentIps: [],
        server_ips: [],
        gateway_ips: [],
        server_ip: '',
        gateway_ip: '',
      };

      scope.serverIPDisplayLabel= {
        id: 'serverIP',
        hint: "IPv4或IPv6",
        type: 'text',
        required: 'true'
      };

      scope.gatewayIPDisplayLabel= {
        id: 'gatewayIP',
        hint: "IPv4或IPv6",
        type: 'text',
        required: 'true'
      };

      let deviceDefer = this.di.$q.defer();
      let portsDefer = this.di.$q.defer();
      let promises = [];

      this.di.deviceDataManager.getPorts().then((res)=>{
        if(res.data.ports){
          scope._phyPorts = this.di._.groupBy(res.data.ports , "element");
        }
        portsDefer.resolve();
      },(err)=>{
        portsDefer.reject(err);
      });
      promises.push(portsDefer.promise);

      deviceDataManager.getDeviceConfigs().then((configs) => {
        this.di._.forEach(configs, (config) => {
          scope.displayLabel.device.options.push({'label': config['name'], 'value': config['id']})
          scope.displayLabel.device4add.options.push({'label': config['name'], 'value': config['id']})

        });
        deviceDefer.resolve();
      }, (err) => {
        deviceDefer.reject(err);
      });
      promises.push(deviceDefer.promise);

      Promise.all(promises).then(()=>{
        scope.dhcpRelayModel.device = scope.displayLabel.device.options[0];
        scope.displayLabel.port.options = this.di._.sortBy(this.di._.map(scope._phyPorts[scope.dhcpRelayModel.device.value], (v)=>{return parseInt(v['port'])})).map((portNum)=>{
          return {'label': String(portNum), 'value': String(portNum)}
        });
        scope.dhcpRelayModel.port = scope.displayLabel.port.options[0];

        scope.showWizard = true;
        scope.$apply();
      },(err)=>{
        console.log(err)
      });
    };

    scope.deviceChange = ($value) =>{
      scope.displayLabel.port.options = [];
      scope.displayLabel.port.options = this.di._.sortBy(this.di._.map(scope._phyPorts[$value.value], (v)=>{return parseInt(v['port'])})).map((portNum)=>{
        return {'label': String(portNum), 'value': String(portNum)}
      })

      scope.dhcpRelayModel.port = scope.displayLabel.port.options[0];
    };




    unsubscribes.push(this.di.$rootScope.$on('relay-default-wizard-show', ($event, data) => {
      scope.open();
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    });
  }

  isIPv4(ip) {
    let ipv4_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    let regexp = new RegExp(ipv4_regex);

    return regexp.test(ip);
  }

  isIPv6(ip) {
    let ipv6_regex = /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;
    let regexp = new RegExp(ipv6_regex);

    return regexp.test(ip);
  }
}
DHCPRelayDefaultEstablishController.$inject = DHCPRelayDefaultEstablishController.getDI();
DHCPRelayDefaultEstablishController.$$ngIsClass = true;