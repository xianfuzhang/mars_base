export class  GenerateCSVFileDialogController {
  static getDI() {
    return [
      '$scope',
      '$modalInstance',
      '$q',
      '$filter',
      'dataModel',
      '_',
      'dateService',
      'appService',
      'manageDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    GenerateCSVFileDialogController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    
    const defaultQuery = {
      "query": {
        "match_all": {}
      }
    }
    
    this.scope = this.di.$scope;
    this.scope.globalInvalid = false;
    this.scope.errMsg = '';
    this.scope.chartModel = {
      option: 'indice',
      query: this.di._.cloneDeep(defaultQuery),
      indice: this.di.dataModel.indiceName,
      size: this.di.dataModel.indiceSize
    }
    
    this.scope.title = this.di.$filter('translate')("MODULES.MANAGE.ELASTICSEARCH.BUTTON.DOWNLOAD") + ' ' + this.di.dataModel.indiceName;
    
    // listen the json content change function
    let onChangeText = (stringText) => {
      try {
        JSON.parse(stringText)
        this.scope.globalInvalid = false;
      } catch(e) {
        this.scope.globalInvalid = true;
      }
    }
    
    this.scope.options = {
      mode: 'text',
      navigationBar: false,
      onChangeText: onChangeText,
    }
    
    this.scope.cancel = (event) => {
      this.di.$modalInstance.dismiss({
        canceled: true
      });
      event.stopPropagation();
    };
    
  
    this.scope.generate = (event) => {
      let query = this.di._.isEqual(this.scope.chartModel.query, defaultQuery) ? false : this.scope.chartModel.query;
      
      this.di.manageDataManager.generateElasticsearchCSVFile(this.scope.chartModel.indice, query)
        .then((res) => {
          this.di.$modalInstance.close({
            canceled: false,
            data: {}
          });
        }, (error) => {
          this.scope.errMsg = JSON.stringify(error);
        })
      
       event.stopPropagation();
    };
  }
  
}

GenerateCSVFileDialogController.$inject = GenerateCSVFileDialogController.getDI();
GenerateCSVFileDialogController.$$ngIsClass = true;