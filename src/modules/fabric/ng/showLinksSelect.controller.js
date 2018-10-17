export class ShowLinksSelectController {
	static getDI() {
		return [
			'$scope',
			'$q',
      'localStoreService',
      '$filter',
      '$modalInstance'
		];
	}

	constructor(...args) {
		this.di = {};
    ShowLinksSelectController.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		let scope = this.di.$scope;

		this.translate = this.di.$filter('translate');

    let fabric_storage_ns = "storage_farbic_";

		scope.showLinksModel = {
      mode: 0
    };

    scope.topoSetting = {};

    scope.displayLabelArr = [{id: 'check_1', label: this.translate('MODULES.TOPO.LINK.HIDE_LINK'), name: 'linksMode', value:  0},
                          {id: 'check_1', label: this.translate('MODULES.TOPO.LINK.SHOW_SELECTED_LINK'), name: 'linksMode', value:  1},
                          {id: 'check_1', label: this.translate('MODULES.TOPO.LINK.SHOW_ALL_LINK'), name: 'linksMode', value:  2}];

    let init = () => {
      this.di.localStoreService.getStorage(fabric_storage_ns).get('topo_set').then((data)=>{
        if(data === undefined){
          scope.topoSetting = {
            "show_links": 0,
            "show_tooltips":false,
            "show_ports":false,
          };
          this.di.localStoreService.getSyncStorage(fabric_storage_ns).set("topo_set", topoSetting);
        } else {
          scope.topoSetting = data;
        }
        scope.showLinksModel.mode = scope.topoSetting.show_links;
      });
    };

    scope.cancel = (event) => {
      this.di.$modalInstance.dismiss({
        canceled: true
      });
      event.stopPropagation();
    };

    scope.save = (event) => {
      this.di.$modalInstance.close({
        canceled: false,
        data: {
          'mode': scope.showLinksModel.mode
        }
      });
      event.stopPropagation();
    };



    init();
	}
}
ShowLinksSelectController.$inject = ShowLinksSelectController.getDI();
ShowLinksSelectController.$$ngIsClass = true;