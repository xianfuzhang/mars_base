export class DialogService {
	static getDI() {
		return [
			'$q',
			'$filter',
			'$uibModal'
		];
	}

	constructor(...args) {
		this.di = {};

		DialogService.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.translate = this.di.$filter('translate');
	}

	createDialog(type, content) {
		let defer = this.di.$q.defer();
    this.di.$uibModal
      .open({
        template: require('../../components/mdc/templates/dialog.html'),
        controller: 'dialogCtrl',
        backdrop: true,
        resolve: {
          dataModel: () => {
            return {
              type: type || 'warning',
              headerText: this.translate('MODULES.SWITCHES.DIALOG.HEADER'),
              contentText: content,
            };
          }
        }
      })
      .result.then((data) => {
      if(data) {
        defer.resolve(data);
      }
      else {
        defer.reject(null);
      }
    });

    return defer.promise;
	}
}

DialogService.$inject = DialogService.getDI();
DialogService.$$ngIsClass = true;