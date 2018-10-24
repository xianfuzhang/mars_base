export class updateTableCols {
	static getDI() {
		return [
			'$rootScope',
			'$timeout',
			'_'
		];
	}
	constructor(...args) {
		this.di = {};
    updateTableCols.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.restrict = 'A';
    this.require = '^mdlTable';
    this.link = (...args) => this._link.apply(this, args);
	}

	_link(scope, element, attrs, ctrl) {
		const CONST_MIN_WIDTH = 60,
					headerElm = element.children().eq(0), 
					bodyElm = element.children().eq(1);
		let unsubscribers = [];
		let cols = []; // {'resize-col-0': element, 'width:' 100, 'hide': false}

		//检查thead中是否有th的width小于60px
		let colsMinInspect = () => {
			let thElms = headerElm.find('th'),
					inspect = false;
			for(let i=0; i< thElms.length; i++) {
				if (!thElms.eq(i).hasClass('ng-hide') && thElms.eq(i)[0].clientWidth < CONST_MIN_WIDTH) {
					inspect = true;
					break;
				}
			}
			return inspect;
		};
		//获取thead中所有的th以及对应的width
		let getColsWidth = () => {
			let scrollWidth = bodyElm[0].offsetWidth - bodyElm[0].clientWidth;
			if (!cols.length) {
				let thElms = headerElm.find('th');
				for(let i=0; i< thElms.length; i++) {
					let obj = {};
					obj['resize-col-' + i] = thElms.eq(i)[0];
					obj['width'] = thElms.eq(i)[0].clientWidth-2; //table的padding默认是2px
					obj['hide'] = thElms.eq(i).hasClass('ng-hide');
					cols.push(obj);
					//console.log('getColsWidth...index=' + i + ' , width=' + obj['width']);
				}
			}
			//update
			else {
				cols.forEach((colObj, index) => {
					colObj['width'] = colObj['resize-col-' +index].clientWidth-2; //table的padding默认是2px
					colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
					//console.log('getColsWidth...index=' + index + ' , width=' + colObj['width']);
				});
			}
		};
		//调整tbody中td的width
		let updateBodyColsWidth = () => {
			const trElms = bodyElm.find('tr'),
						tdElms = trElms.eq(0).find('td');
			if (tdElms.length > 1) {
				for(let i=0; i< tdElms.length; i++) {
					if (!cols[i].hide) {
						tdElms.eq(i)[0].style.width = cols[i].width + 'px';	
						//console.log('updateBodyColsWidth...index=' + i + ' , width=' + cols[i].width);
					}
				}
			}
		};

    let dict = {};
    //thead手动调整th col width
    unsubscribers.push(this.di.$rootScope.$on('mousemove-th-col', (event, data) => {
      dict = data;
    }));

    //显示隐藏columns时调整table的tds width
		unsubscribers.push(this.di.$rootScope.$on('table-show-hide-columns', (event) => {
      getColsWidth();
      updateBodyColsWidth();
    }));
    //tbody渲染以后调整td宽度（scroll宽度影响tds）
		unsubscribers.push(this.di.$rootScope.$on('table-render-ready', (event) => {
			getColsWidth();
      updateBodyColsWidth();
		}));  

    let mousemoveEvent = (event) => {
      if (dict.startResize) {
        event.preventDefault();
        let offset = event.clientX - dict.startX;
        //当某col达到最小60px，取消move
        if (colsMinInspect() && offset > 0 ) {
        	return false;
        }
        let width = dict.width + offset;
        if (width < CONST_MIN_WIDTH) width = CONST_MIN_WIDTH;
        dict.element.style.width = width + 'px';
        
        //统计table header th的width
				getColsWidth();
				//修改对应class的width
				updateBodyColsWidth();
      }
    };
    let mouseupEvent = (event) => {
      if (dict.startResize) {
        dict = {};
      }
    };
    let resizeEvent = (event) => {
    	getColsWidth();
      updateBodyColsWidth();
    };
    document.addEventListener('mousemove', mousemoveEvent, false);
    document.addEventListener('mouseup', mouseupEvent, false);
    window.addEventListener('resize', resizeEvent, false);

		scope.$on('$destroy', ()=> {
			document.removeEventListener('mousemove', mousemoveEvent);
      document.removeEventListener('mouseup', mouseupEvent);
      window.removeEventListener('resize', resizeEvent);
			unsubscribers.forEach((cb) => {
        cb();
      });
		});
	}
}
updateTableCols.$inject = updateTableCols.getDI();
updateTableCols.$$ngIsClass = true;
