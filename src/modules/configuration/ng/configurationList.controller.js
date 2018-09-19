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
      isEditable: false
    };

    scope.checkDisLab = {id: 'check_edit_config', label: this.translate('MODULES.CONFIGURATION.OPTION.START_CHECK')};
    // scope.fileNameSelectedDisLab = {hint: this.translate('MODULES.CONFIGURATION.FILENAME'),options:[]};
    scope.fileNameSelectedDisLab = {options:[]};


    scope.addConfigFile = (evt) => {
      let filename = this.fileNameInput.value;


      let preContent = document.getElementById("configurationListPre").innerHTML;
      let config = JSON.parse(preContent);


      this.di.dialogService.createDialog('warning', this.translate('MODULES.CONFIGURATION_LIST.UPDATE.CONFORM'))
        .then((data)=>{
          this.di.configurationDataManager.setConfigurationFile(filename, config).then(
            (res) => {
              init();
            },
            (err) => {
              console.log(err)
            }
          )
        },(res)=>{

        })


    };

    let getConfigurationList = ()=>{

      // let test_options = [{label:"客户诺配置",value:"myasgaggasdg"},{label:"客户云配置",value:"myasgaggasdg1"},{label:"客户Mars配置",value:"myasgaggasdg2"}]
      // scope.fileNameSelectedDisLab.options = test_options;

      this.di.configurationDataManager.getConfigurationFileList()
        .then((res)=>{

          let opts = [{label:"请选择清单",value:"default"}];
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
      if( name === 'default' || name === '' || name === null|| name === undefined){
        return ;
      }

      this.di.configurationDataManager.getConfigurationByFileName(name)
        .then((res)=>{
          //TODO 具体操作，根据返回结果来具体实现
          this.di.$scope.configurationListModel.configurationShow = JSON.stringify(res['data'], null, 4);
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