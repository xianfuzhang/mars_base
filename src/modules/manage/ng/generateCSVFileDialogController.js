export class  GenerateCSVFileDialogController {
	static getDI() {
		return [
			'$scope',
			'$modalInstance',
			'$q',
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
    this.scope.indiceOptions = this.di.dataModel.indiceOptions;
    this.scope.selectedIndice = this.scope.indiceOptions[0];
    this.scope.globalInvalid = false;
    this.scope.errMsg = '';
    this.scope.dataModel = {
    	option: 'indice',
	    selectedIndice: this.scope.indiceOptions[0],
      query: this.di._.cloneDeep(defaultQuery)
    }
    
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
      let query = this.di._.isEqual(this.scope.dataModel.query, defaultQuery) ? false : this.scope.dataModel.query;
      
      this.di.manageDataManager.generateElasticsearchCSVFile(this.scope.dataModel.selectedIndice.value, query)
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
		
		
		const generateCSVFile = () => {
      let defer = this.di.$q.defer();
			
			
			return defer.promise;
		}
	}
  
}

GenerateCSVFileDialogController.$inject = GenerateCSVFileDialogController.getDI();
GenerateCSVFileDialogController.$$ngIsClass = true;