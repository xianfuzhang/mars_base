export class ConfigurationController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '_',
      '$http',
      '$filter',
      '$q',
      'appService',
      'dialogService',
      'configurationDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    ConfigurationController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let unSubscribers = [];
    let scope = this.di.$scope;
    this.translate = this.di.$filter('translate');

    // this.di.$scope.testJSON = {
    //
    // }

    // let test_subjectclassList = ['org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig', 'org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig'];
    // let test_subjectDict = {
    //   'org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig':['snmp:192.168.0.1:1','snmp:192.168.0.2:1','snmp:192.168.0.3:1'],
    //   'org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig':['dhcp:192.168.0.1','dhcp:192.168.0.2','dhcp:192.168.0.3'],
    // };
    //
    // let test_configurations = [
    //     {
    //       "subject": "snmp:192.168.0.1:1",
    //       "class": "org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig",
    //       "config": {
    //         "ip": "192.168.0.1",
    //         "port": 1,
    //         "username": "admin",
    //         "password": "admin"
    //       }
    //     },
    //     {
    //       "subject": "snmp:192.168.0.2:1",
    //       "class": "org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig",
    //       "config": {
    //         "ip": "192.168.0.2",
    //         "port": 161,
    //         "username": "admin",
    //         "password": "admin"
    //       }
    //     },
    //     {
    //       "subject": "snmp:192.168.0.3:1",
    //       "class": "org.onosproject.provider.snmp.device.impl.SnmpDeviceConfig",
    //       "config": {
    //         "ip": "192.168.0.3",
    //         "port": 1,
    //         "username": "test",
    //         "password": "test"
    //       }
    //     },{
    //       "subject": "dhcp:192.168.0.1",
    //       "class": "org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig",
    //       "config": {
    //         "ip": "192.168.0.1",
    //         "port": 1,
    //       }
    //     },
    //     {
    //       "subject": "dhcp:192.168.0.2",
    //       "class": "org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig",
    //       "config": {
    //         "ip": "192.168.0.2",
    //         "port": 161,
    //       }
    //     },
    //     {
    //       "subject": "dhcp:192.168.0.3",
    //       "class": "org.onosproject.provider.snmp.device.impl.DhcpDeviceConfig",
    //       "config": {
    //         "ip": "192.168.0.3",
    //         "port": 1,
    //       }
    //     }
    //   ];

    scope.configurationModel = {
      // subjectClassList: [],
      // subjectList: [],
      // subjectListDisable: 'true',
      // currentSubjectClass: '',
      // currentSubject: '',
      configurationShow: '',
      isEditable: false
    };

    scope.checkDisLab = {id: 'check_edit_config', label: this.translate('MODULES.CONFIGURATION.OPTION.START_CHECK')};


    scope.updateConfiguration = () =>{
      // let currentSubjectClass = scope.configurationModel.currentSubjectClass;
      // let currentSubject = scope.configurationModel.currentSubject;
      let preContent = document.getElementById("configurationPre").innerHTML;
      let config = JSON.parse(preContent);

      this.di.dialogService.createDialog('warning', this.translate('MODULES.CONFIGURATION.UPDATE.CONFORM'))
        .then((data) =>{
          this.di.configurationDataManager.updateConfiguration(null, null, config)
            .then((res)=>{

            });
        }, (res) =>{
          this.di.$log.debug('update configuration dialog cancel');
        });
    };

    scope.deleteConfiguration = () =>{
      let currentSubjectClass = scope.configurationModel.currentSubjectClass;
      let currentSubject = scope.configurationModel.currentSubject;
      this.di.configurationDataManager.deleteConfiguration(currentSubjectClass, currentSubject)
        .then((res)=>{
          /*
         //TODO 暂时没有需求
           */
      })
    };

    let getConfiguration = ()=>{
      // let currentSubjectClass = scope.configurationModel.currentSubjectClass;
      // let currentSubject = scope.configurationModel.currentSubject;

      //mock没有数据，暂时测试使用 //TODO
      // let filterJ = {};
      // if(currentSubjectClass){
      //   filterJ['class'] = currentSubjectClass;
      //   if(currentSubject){
      //     filterJ['subject'] = currentSubject;
      //   }
      // }
      // this.di.$scope.configurationModel.configurationShow = JSON.stringify(this.di._.filter(test_configurations, filterJ),null ,4);

      //mock没有数据，暂时注释 //TODO
      // this.di.configurationDataManager.getConfiguration(currentSubjectClass, currentSubject)
      this.di.configurationDataManager.getConfiguration()
        .then((res)=>{
          this.di.$scope.configurationModel.configurationShow = JSON.stringify(res, null, 4)
        });
    };

    // unSubscribers.push(this.di.$scope.$watch('configurationModel.currentSubjectClass',(newClass)=>{
    //   // console.log('$watch currentSubjectClass ==');
    //   // console.log(newClass);
    //   //TODO 目前使用测试数据
    //   if(test_subjectDict[newClass]){
    //     scope.configurationModel.subjectList = test_subjectDict[newClass];
    //   } else {
    //     scope.configurationModel.subjectList = [];
    //   }
    //   scope.configurationModel.currentSubject = '';
    //
    //   if (newClass === ''){
    //     scope.configurationModel.subjectListDisable = true;
    //   } else {
    //     scope.configurationModel.subjectListDisable = false;
    //   }
    //   getConfiguration();
    //
    // }));

    // unSubscribers.push(this.di.$scope.$watch('configurationModel.currentSubject',(newSubject)=>{
    //   getConfiguration();
    // }));

    let init = () =>{
      getConfiguration();
    };

    init();

    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });
    });
  }
}

ConfigurationController.$inject = ConfigurationController.getDI();
ConfigurationController.$$ngIsClass = true;