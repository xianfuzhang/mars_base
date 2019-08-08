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
      '$window',
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
  
    // filename regex expression
    const fileNameRegex = /^[\w\-.]+$/i;
    const DEFAULT_FILENAME = this.di.appService.CONST.DEFAULT_FILENAME;

    this.fileNameInput = new MDCTextField(document.querySelector('#fileName'));
    this.fileNameInput.disabled = true;

    let initConfig = {
      // configurationShow: '',
      // fileName: '',
      mode: 'show',  // 'show' / 'edit' / 'add' / 'start_up'
      globalInvalid: false,
      saveBtnInvalid: false
    };
  
    scope.configurationListModel = this.di._.cloneDeep(initConfig);
    scope.checkDisLab = {id: 'check_edit_config', label: this.translate('MODULES.CONFIGURATION.OPTION.START_CHECK')};
    // scope.fileNameSelectedDisLab = {hint: this.translate('MODULES.CONFIGURATION.FILENAME'),options:[]};
    scope.fileNameSelectedDisLab = {options:[]};
    scope.downloadBtnDisable = true;
    scope.saveBtnLabel = this.translate('MODULES.CONFIGURATION.OPTION.UPDATE');
    scope.broseLabel = {id: 'show_radio', label: this.translate('MODUELS.CONFIGURATION.BROWSE'), name: 'mode', value: 'show'};
    scope.editLabel = {id: 'edit_radio', label: this.translate('MODUELS.CONFIGURATION.EDIT'), name: 'mode', value: 'edit'};
    scope.addLabel = {id: 'add_radio', label: this.translate('MODUELS.CONFIGURATION.ADD'), name: 'mode', value: 'add'};
    scope.saveLabel = {id: 'add_radio', label: this.translate('MODUELS.CONFIGURATION.SAVE'), name: 'mode', value: 'start_up'};
    // listen the json content change function
    let onChangeText = function(stringText) {
      try {
        JSON.parse(stringText)
        scope.configurationListModel.globalInvalid = false;
      } catch(e) {
        scope.configurationListModel.globalInvalid = true;
      }
    }
    
    // check if the filename is valid
    const filenameIsValid = (filename) => {
      if(filename == null || filename == undefined || filename == "" || !fileNameRegex.test(filename) || filename == DEFAULT_FILENAME){
        return false;
      } else {
        let index = scope.fileNameSelectedDisLab.options.findIndex((option) => {
          return option.value == filename && filename != 'default';
        })
    
        if(index != -1) {
          return false;
        } else {
          return true;
        }
      }
    }
    
    // json editor options
    scope.options = {
      mode: 'view',
      navigationBar: false,
      onChangeText: onChangeText,
      languages: {
        'zh-cn': {
          'expandAll': '展开',
          'collapseAll': '折叠',
        }
      },
      language: 'zh-cn'
    }
    
    scope.saveConfigFile = (evt) => {
      let filename = this.fileNameInput.value.trim(' ');
      let config;
  
      // check if the file name has existed
      if(scope.configurationListModel.mode == 'add') {
        if(!filenameIsValid(filename)) {
          this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.FILENAME.INVALID'))
            .then((data)=>{
              // error
            },(res)=>{
              // error
            })
    
          return
        }
      }
      
      if(scope.configurationListModel.mode == 'start_up'){
        filename = DEFAULT_FILENAME
      }
  
      this.di.dialogService.createDialog('confirm', this.translate('MODULES.CONFIGURATION.UPDATE.CONFORM'))
        .then((data)=>{
          saveConfiguration(filename)
        },(res)=>{
          // error
        })
    };

    scope.downloadFile = () => {
      if (scope.configurationListModel.fileNameSelected.value == '') return false;

      this.di.$window.location.href = this.di.appService.getConfigurationHistoryFilesUrl() + `/${scope.configurationListModel.fileNameSelected.value}`;
    }

    let saveConfiguration = (filename) => {
      let config = scope.configurationListModel.configurationShow;
      console.log(config);
      
      // invalid save button
      scope.saveBtnInvalid = true;
      
      // save the config to file
      // if(filename == 'default') { // save the config file
      //   this.di.configurationDataManager.updateConfiguration(null, null, config).then(
      //     () => {
      //       this.di.dialogService.createDialog('success', this.translate('MODULES.CONFIGURATION_LIST.SUCCESS.SAVE'))
      //         .then((data)=>{
      //           init();
      //         })
      //     },
      //     () => {
      //       this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.SAVE'))
      //         .then((data)=>{
      //           scope.saveBtnInvalid = false;
      //         })
      //     }
      //   );
      // } else { // save the other config file
      //   this.di.configurationDataManager.setConfigurationFile(filename, config).then(
      //     (res) => { // success to save
      //       this.di.dialogService.createDialog('success', this.translate('MODULES.CONFIGURATION_LIST.SUCCESS.SAVE'))
      //         .then((data)=>{
      //           init();
      //         })
      //     },
      //     (err) => { // error to save
      //       this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.SAVE'))
      //         .then((data)=>{
      //           scope.saveBtnInvalid = false;
      //         })
      //     }
      //   )
      // }
  
      this.di.configurationDataManager.setConfigurationFile(filename, config).then(
        (res) => { // success to save
          this.di.dialogService.createDialog('success', this.translate('MODULES.CONFIGURATION_LIST.SUCCESS.SAVE'))
            .then((data)=>{
              init();
            })
        },
        (err) => { // error to save
          this.di.dialogService.createDialog('error', this.translate('MODULES.CONFIGURATION_LIST.ERROR.SAVE'))
            .then((data)=>{
              scope.saveBtnInvalid = false;
            })
        }
      )
    }
    
    let getConfigurationList = ()=>{
      this.di.configurationDataManager.getConfigurationFileList()
        .then((res)=>{

          let opts = [{label:this.translate('MODUELS.CONFIGURATION.RUN_CONFIG'),value:"default"}];
          let startUpFile = '';
          if(res && res['files'] && res['files'] instanceof Array){
            this.di._.forEach(res['files'], (item)=>{
              if(item != DEFAULT_FILENAME){ // is not default file
                opts.push({label:item, value:item})
              } else {
                startUpFile = DEFAULT_FILENAME;
              }
            });
          }
          
          if(startUpFile != ''){
            opts.splice(1, 0, {label:this.translate('MODUELS.CONFIGURATION.BOOT_CONFIG'), value:DEFAULT_FILENAME})
          }

          scope.fileNameSelectedDisLab.options = opts;
          scope.configurationListModel.fileNameSelected = scope.fileNameSelectedDisLab.options[0];
        });
    };

    let getConfigurationByName = (name) =>{
      this.di.$scope.configurationListModel.configurationShow = '';
      if(name === '' || name === null|| name === undefined){
        return ;
      }

      if(name === 'default') { // get default config file
        this.di.configurationDataManager.getConfiguration()
          .then((res)=>{
            this.di.$scope.configurationListModel.configurationShow = res.data
          });
      } else { // get other config files
        this.di.configurationDataManager.getConfigurationByFileName(name)
          .then((res)=>{
            this.di.$scope.configurationListModel.configurationShow = res['data'];
          });
      }
    };

    let init = ()=> {
      scope.configurationListModel = this.di._.cloneDeep(initConfig);
      getConfigurationList();
    };

    init();

    unSubscribers.push(this.di.$scope.$watch('configurationListModel.mode',(newValue)=>{
      console.log(newValue);
      if(newValue == 'show'){
        scope.options.mode = 'view';
        scope.saveBtnInvalid = true;
      } else if(newValue == 'start_up') {
        scope.options.mode = 'view';
        scope.saveBtnInvalid = false;
        scope.saveBtnLabel = this.translate('MODULES.CONFIGURATION.OPTION.SAVE');
      } else if((newValue == 'add')){
        scope.options.mode = 'text';
        scope.saveBtnInvalid = false;
        this.fileNameInput.disabled = false;
        scope.saveBtnLabel = this.translate('MODULES.CONFIGURATION.OPTION.ADD');
      } else {
        scope.options.mode = 'text';
        scope.saveBtnInvalid = false;
        scope.saveBtnLabel = this.translate('MODULES.CONFIGURATION.OPTION.UPDATE');
      }
    }));

    unSubscribers.push(this.di.$scope.$watch('configurationListModel.fileNameSelected',(newValue, oldValue)=>{
      if(newValue == oldValue) return;
      if(newValue !== null && newValue !== undefined && newValue !== ''){
        scope.configurationListModel.mode = 'show';
        scope.options.mode = 'view';
        scope.configurationListModel.saveBtnInvalid = false;
        getConfigurationByName(newValue.value);

        if(newValue.value == 'default' || newValue.value == DEFAULT_FILENAME) {
          scope.downloadBtnDisable = true;
        } else {
          scope.downloadBtnDisable = false;
        }
      }
    }));
  
    unSubscribers.push(this.di.$scope.$watch('configurationListModel.fileName',(newValue, oldValue)=>{
      if(newValue === oldValue) return;
      if(scope.configurationListModel.mode === 'add') {
        if(filenameIsValid(newValue)) {
          scope.configurationListModel.saveBtnInvalid = false;
        } else {
          scope.configurationListModel.saveBtnInvalid = true;
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