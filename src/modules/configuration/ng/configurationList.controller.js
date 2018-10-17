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
      'dialogService',
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

    scope.configurationListModel = {
      configurationShow: '',
      fileName: '',
      mode: 'show',
      nameInvalid: false
    };

    scope.checkDisLab = {id: 'check_edit_config', label: this.translate('MODULES.CONFIGURATION.OPTION.START_CHECK')};
    // scope.fileNameSelectedDisLab = {hint: this.translate('MODULES.CONFIGURATION.FILENAME'),options:[]};
    scope.fileNameSelectedDisLab = {options:[]};

    scope.saveConfigFile = (evt) => {
      const regex = /[^\\s\\\\/:\\*\\?\\\"<>\\|](\\x20|[^\\s\\\\/:\\*\\?\\\"<>\\|])*[^\\s\\\\/:\\*\\?\\\"<>\\|\\.]$/;
      let filename = this.fileNameInput.value.trim(' ');
      let config;
  
      if(!regex.test(filename)) {
        this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.FILENAME.INVALID'))
          .then((data)=>{
            // error
          },(res)=>{
            // error
          })
        
        return
      }
      
      // check if the file name has existed
      if(scope.configurationListModel.mode == 'add') {
        let index = scope.fileNameSelectedDisLab.options.findIndex((option) => {
          return option.value == filename;
        })
        
        if(index != -1) {
          this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.FILENAME.REPEAT'))
            .then((data)=>{
              // error
            },(res)=>{
              // error
            })
          
          return;
        }
      }
  
      // check if the file name is JSON style
      let preContent = document.getElementById("configurationListPre").innerHTML;
      try {
        config = JSON.parse(preContent);
      } catch(e) {
        this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.JSONCONDIG'))
          .then((data)=>{
            // error
          },(res)=>{
            // error
          })
        
        return;
      }

      // save the config to file
      if(filename == 'default') { // save the config file
        this.di.configurationDataManager.updateConfiguration(null, null, config).then(
          () => {
            this.di.dialogService.createDialog('success', this.translate('MODULES.CONFIGURATION_LIST.SUCCESS.SAVE'))
              .then((data)=>{
                init();
              },(res)=>{
      
              })
          },
          () => {
            this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.SAVE'))
              .then((data)=>{
              
              },(res)=>{
      
              })
          }
        );
      } else { // save the other config file
        this.di.configurationDataManager.setConfigurationFile(filename, config).then(
          (res) => { // success to save
            this.di.dialogService.createDialog('success', this.translate('MODULES.CONFIGURATION_LIST.SUCCESS.SAVE'))
              .then((data)=>{
                init();
              },(res)=>{
      
              })
          },
          (err) => { // error to save
            () => {
              this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.SAVE'))
                .then((data)=>{
        
                },(res)=>{
        
                })
            }
          }
        )
      }
    };

    let getConfigurationList = ()=>{
      this.di.configurationDataManager.getConfigurationFileList()
        .then((res)=>{

          let opts = [{label:"默认配置",value:"default"}];
          // let opts = [];
          if(res && res['files'] && res['files'] instanceof Array){
            this.di._.forEach(res['files'], (item)=>{
              opts.push({label:item,value:item})
            });
          }

          scope.fileNameSelectedDisLab.options = opts;
          scope.configurationListModel.fileNameSelected = scope.fileNameSelectedDisLab.options[0];
        });
    };

    let getConfigurationByName = (name) =>{
      //TODO 测试使用
      this.di.$scope.configurationListModel.configurationShow = '';
      if(name === '' || name === null|| name === undefined){
        return ;
      }

      if(name === 'default') { // get default config file
        this.di.configurationDataManager.getConfiguration()
          .then((res)=>{
            this.di.$scope.configurationListModel.configurationShow = JSON.stringify(res, null, 4)
          });
      } else { // get other config files
        this.di.configurationDataManager.getConfigurationByFileName(name)
          .then((res)=>{
            this.di.$scope.configurationListModel.configurationShow = JSON.stringify(res['data'], null, 4);
          });
      }
    };

    let init = ()=> {
      getConfigurationList();
    };

    init();

    unSubscribers.push(this.di.$scope.$watch('configurationListModel.mode',(newValue)=>{
      console.log(newValue);
      if(newValue == 'add'){
        this.fileNameInput.disabled = false;
      } else {
        this.fileNameInput.disabled = true;
      }
    }));

    unSubscribers.push(this.di.$scope.$watch('configurationListModel.fileNameSelected',(newValue)=>{
      if(newValue !== null && newValue !== undefined && newValue !== ''){
        this.di.$scope.configurationListModel.mode = 'show';
        getConfigurationByName(newValue.value);
      }
    }));
  
    unSubscribers.push(this.di.$scope.$watch('configurationListModel.fileName',(newValue)=>{
      if(scope.configurationListModel.mode == 'add') {
        if(newValue == null || newValue == undefined || newValue == ""){
          scope.configurationListModel.nameInvalid = true;
        } else {
          let index = scope.fileNameSelectedDisLab.options.findIndex((option) => {
            return option.value == newValue;
          })
    
          if(index != -1) {
            scope.configurationListModel.nameInvalid = true;
          } else {
            scope.configurationListModel.nameInvalid = false;
          }
        }
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