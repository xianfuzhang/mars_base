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
      subjectClassList: test_configurations,
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

      let test_options = [{label:"客户诺配置",value:"myasgaggasdg"},{label:"客户云配置",value:"myasgaggasdg1"},{label:"客户Mars配置",value:"myasgaggasdg2"}]
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
      //TODO 测试使用
      this.di.$scope.configurationListModel.configurationShow = '';

      // this.di.configurationDataManager.getConfigurationByFileName(name)
      //   .then((res)=>{
      //     //TODO 具体操作，根据返回结果来具体实现
      //     this.di.$scope.configurationModel.configurationShow = JSON.stringify(res['data']['config'], null, 2);
      //   });
    };

    let init = ()=> {
      getConfigurationList();

    };

    init();

    unSubscribers.push(this.di.$scope.$watch('configurationListModel.isEditable',(newValue)=>{
      // console.log(newValue);
      if(newValue){
        this.fileNameInput.disabled = false;
        this.di.$scope.configurationListModel.configurationShow = '';
      } else {
        this.fileNameInput.disabled = true;
        getConfigurationByName(this.fileNameInput.value);
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