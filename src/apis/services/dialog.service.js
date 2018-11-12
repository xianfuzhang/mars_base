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
		let header = '';
		type = type || 'warning';

		let isInfoNotJson = false;
    switch(type.toLowerCase()) {
      case 'confirm':
        header = this.translate('MODULES.SWITCHES.DIALOG.HEADER.CONFIRM');
        break;
      case 'error':
        header = this.translate('MODULES.SWITCHES.DIALOG.HEADER.ERROR');
        break;
      case 'success':
        header = this.translate('MODULES.SWITCHES.DIALOG.HEADER.SUCCESS');
        break;
      case 'info':
        isInfoNotJson = true;
        break;
      case 'info_json':
        break;
      case 'warning':
      default:
        header = this.translate('MODULES.SWITCHES.DIALOG.HEADER.WARNING');
    }
    this.di.$uibModal
      .open({
        template: require('../../components/mdc/templates/dialog.html'),
        controller: 'dialogCtrl',
        backdrop: true,
        resolve: {
          dataModel: () => {
            return {
              type: type,
              headerText: header,
              contentText: content,
              isInfoNotJson: isInfoNotJson
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
    },()=>{

    });

    return defer.promise;
	}
}

DialogService.$inject = DialogService.getDI();
DialogService.$$ngIsClass = true;