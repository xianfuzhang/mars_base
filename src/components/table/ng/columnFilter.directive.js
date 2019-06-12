export class columnFilter {
	static getDI() {
	 	return [
	 		'$filter',
	 		'$templateCache',
	 		'$compile',
	 		'$rootScope',
	 		'$timeout'
	 	];
	}
	constructor(...args){
		this.di = {};
    columnFilter.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.require = 'ngModel';
    this.restrict = 'E';
    this.template = require('../template/columnFilter.html');
    this.scope = {
    	selectedColumn: '=ngModel',
    	tableSize: '=',
    	columns: '=',
    	onFilterAction: '&'
    };
    this.link = (...args) => this._link.apply(this, args);
	}
	_link(scope, element, attrs, ngModel) {
		scope.show = false;
		const buttonElm = element[0].querySelector('button');
		let created = false;
		let updateColumnFields = () => {
			const allObj = {'label':this.di.$filter('translate')('MODULES.TABLE.COLUMN.ALL'), 'value': 'all'};
			scope.columnFields = [];

			scope.columnFields.push(allObj);
			for (let key in scope.columns) {
				if (scope.columns[key]['visible']	&& !scope.columns[key]['hidden']) {
					scope.columnFields.push({
						'label': scope.columns[key]['def']['label'],
						'value': key
					});
				}
			}
			scope.selectedColumn = scope.columnFields[0]['value'];
		};

		scope._showHideDetail = (event) => {
			if (!created) {
				let menuHtml = this.di.$templateCache.get('columns-filter-list.html');
	      let menuElement = this.di.$compile(menuHtml)(scope);
	      document.body.appendChild(menuElement[0]);

	      menuElement.css({
	        position: 'absolute',
	        left: (event.clientX - 12) + 'px',
	        top: (event.clientY + 24) + 'px'
	      });	
			}
			created = true;
			scope.show = !scope.show;
		};

		scope._changeSelectedColumn = (value) => {
			scope.selectedColumn = value;
			this.di.$timeout(() => {
				scope.onFilterAction = scope.onFilterAction || angular.noop;
				scope.onFilterAction(); 	
			});
		};

		updateColumnFields();

		let onClickHideDetail = (event) => {
			if (event.target === buttonElm) {
				return;
			}
			scope.show = false;
		};
		let unsubscribers = [];
		unsubscribers.push(this.di.$rootScope.$on('table-show-hide-columns', (event) => {
			//columns显示发生变更，数据需要同步更新
			updateColumnFields();

			let columnsElm = document.body.querySelector('.columns-field');
			if (columnsElm) {
				columnsElm.remove();
				created = false;
			}
		}));
		document.body.addEventListener('click', onClickHideDetail, true);

		/*scope.$watch('selectedColumn', (newVal) => {
			 ngModel.$setViewValue(newVal);
		});*/
		scope.$on('$destroy', () => {
			document.body.removeEventListener('click', onClickHideDetail);
			unsubscribers.forEach(cb => cb());
		});
	}
}
columnFilter.$inject = columnFilter.getDI();
columnFilter.$$ngIsClass = true;