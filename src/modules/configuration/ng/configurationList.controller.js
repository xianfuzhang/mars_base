import {MDCTextField} from '@material/textfield';

export class ConfigurationListController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$filter',
      '$q',
      'appService',
      'configurationDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    ConfigurationListController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');

    let test_subjectclassList = ['org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig', 'org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig'];
    let test_subjectDict = {
      'org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig':['snmp:192.168.0.1:1','snmp:192.168.0.2:1','snmp:192.168.0.3:1'],
      'org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig':['dhcp:192.168.0.1','dhcp:192.168.0.2','dhcp:192.168.0.3'],
    };

    this.fileNameInput = new MDCTextField(document.querySelector('#fileName'));
    this.fileNameInput.disabled = true;

    let test_configurations = [
        {
          "subject": "snmp:192.168.0.1:1",
          "class": "org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig",
          "config": {
            "ip": "192.168.0.1",
            "port": 1,
            "username": "admin",
            "password": "admin"
          }
        },
        {
          "subject": "snmp:192.168.0.2:1",
          "class": "org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig",
          "config": {
            "ip": "192.168.0.2",
            "port": 161,
            "username": "admin",
            "password": "admin"
          }
        },
        {
          "subject": "snmp:192.168.0.3:1",
          "class": "org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig",
          "config": {
            "ip": "192.168.0.3",
            "port": 1,
            "username": "test",
            "password": "test"
          }
        },{
          "subject": "dhcp:192.168.0.1",
          "class": "org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig",
          "config": {
            "ip": "192.168.0.1",
            "port": 1,
          }
        },
        {
          "subject": "dhcp:192.168.0.2",
          "class": "org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig",
          "config": {
            "ip": "192.168.0.2",
            "port": 161,
          }
        },
        {
          "subject": "dhcp:192.168.0.3",
          "class": "org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig",
          "config": {
            "ip": "192.168.0.3",
            "port": 1,
          }
        }
      ];

    scope.configurationListModel = {
      subjectClassList: test_subjectclassList,
      subjectList: [],
      subjectListDisable: 'true',
      currentSubjectClass: '',
      currentSubject: '',
      configurationShow: '',
      isEditable: false
    };

    scope.checkDisLab = {id: 'check_edit_config', label: this.translate('MODULES.CONFIGURATION.OPTION.START_CHECK')};
    scope.fileNameSelectedDisLab = {hint: this.translate('MODULES.CONFIGURATION.FILENAME'),options:[]};
    // "{hint: '档案名', options: [{label: '男1', value: '0'}, {label: '男2', value: '1'}]}"


    scope.addConfigFile = (evt) => {
      console.log(this.fileNameInput);
      let filename = this.fileNameInput.value;
      let config = scope.configurationListModel.configurationShow;

      this.di.configurationDataManager.setConfigurationFile(filename, config).then(
        (res) => {
          init();
        },
        (err) => {
          console.log(err)
        }
      )
    };

    let getConfigurationList = ()=>{

      let test_options = [{label:"myasgaggasdg",value:"myasgaggasdg"},{label:"myasgaggasdg1",value:"myasgaggasdg1"},{label:"myasgaggasdg2",value:"myasgaggasdg2"}]
      scope.fileNameSelectedDisLab.options = test_options;

      // //mock没有数据，暂时注释 //TODO
      // this.di.configurationDataManager.getConfigurationFileList()
      //   .then((res)=>{
      //     // {label: '男1', value: '0'}
      //     let opts = [];
      //     //TODO 具体操作，根据返回结果来具体实现
      //     scope.fileNameSelectedDisLab.options = opts;
      //   });

    };


    let getConfigurationByName = (name) =>{
      this.di.configurationDataManager.getConfigurationByFileName(name)
        .then((res)=>{
          //TODO 具体操作，根据返回结果来具体实现
          this.di.$scope.configurationModel.configurationShow = JSON.stringify(res['data']['config'], null, 2);
        });
    };

    let init = ()=> {
      getConfigurationList();

    };

    init();

    unSubscribers.push(this.di.$scope.$watch('configurationListModel.isEditable',(newValue)=>{
      // console.log(newValue);
      if(newValue){
        this.fileNameInput.disabled = false;
      } else {
        this.fileNameInput.disabled = true;
      }
    }));

    unSubscribers.push(this.di.$scope.$watch('configurationListModel.fileNameSelected',(newValue)=>{
      if(newValue !== null && newValue !== undefined && newValue !== ''){
        getConfigurationByName(newValue.value);
      }
    }));

    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }
}

ConfigurationListController.$inject = ConfigurationListController.getDI();
ConfigurationListController.$$ngIsClass = true;