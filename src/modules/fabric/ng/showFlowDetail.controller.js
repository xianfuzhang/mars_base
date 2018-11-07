export class ShowFlowDetailController {
  static getDI() {
    return ['$scope', 'dataModel', 'flowService'];
   }
	constructor(...args) {
		this.di = {};
    ShowFlowDetailController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.detail = this.di.dataModel.detail;
    this.scope.criteria = this.di.flowService.selectorHandler(this.scope.detail.selector);
    this.scope.treatment = this.di.flowService.treatmentHander(this.scope.detail.treatment);
	}
}
ShowFlowDetailController.$inject = ShowFlowDetailController.getDI();
ShowFlowDetailController.$$ngIsClass = true;