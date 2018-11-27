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
      let scrollWidth = bodyElm[0].offsetHeight - bodyElm[0].clientHeight - 2;
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
        	if (!colObj.type) {
        		colObj['width'] = colObj['resize-col-' +index].clientWidth-2; //table的padding默认是2px
  	        colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
	          //console.log('getColsWidth...index=' + index + ' , width=' + colObj['width']);	
        	}
        });
      }
      if (scrollWidth > 0) {
      	//cols没有x-sroll-patch，新增col，然后更新width
      	let patch = cols.filter((col) =>{return col.type === 'patch'});
      	if (!patch.length) {
      		cols.push({
      			'type': 'patch',
      			'width': scrollWidth -2
      		});
      		let thElm = document.createElement('th');
      		thElm.className = 'x-sroll-patch';
      		thElm.style.width = scrollWidth + 'px';
      		//thElm.setAttribute('style', {'width': scrollWidth + 'px'});
      		headerElm.find('tr')[0].appendChild(thElm);
      	}
      }
      else {
      	//cols如果有x-sroll-patch，移除col
      	let index = cols.findIndex((col) =>{return col.type === 'patch'});
      	if (index > -1) {
      		let patchNode = headerElm.find('tr')[0].lastChild;
      		headerElm.find('tr')[0].removeChild(patchNode);
      		cols.splice(index, 1);
      	}
      }
    };
    let updateColsMinWidth = () => {
    	let thElms = headerElm.find('th');
    	for(let i=0; i< thElms.length; i++) {
        if ((!thElms.eq(i).hasClass('ng-hide') && !thElms.eq(i).hasClass('x-sroll-patch')) 
        		&& thElms.eq(i)[0].clientWidth < CONST_MIN_WIDTH) {
        	thElms.eq(i)[0].style.width = CONST_MIN_WIDTH + 'px';
        }
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
    scope.$on('mousemove-th-col', (event, data) => {
    	dict = data;
    });

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
        /*//当某col达到最小60px，取消move
        if (colsMinInspect() && offset > 0 ) {
          return false;
        }*/
        let width = dict.width + offset;
        if (width < CONST_MIN_WIDTH) width = CONST_MIN_WIDTH;
        dict.element.style.width = width + 'px';
        
        //统计table header th的width
        getColsWidth();
        updateColsMinWidth();
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
    	if (scope.resizePromise) {
    		this.di.$timeout.cancel(scope.resizePromise);
    	}
    	scope.resizePromise = this.di.$timeout(() => {
    		getColsWidth();
      	updateBodyColsWidth();
    	}, 500);
    };
    
    document.addEventListener('mousemove', mousemoveEvent, false);
    document.addEventListener('mouseup', mouseupEvent, false);
    window.addEventListener('resize', resizeEvent, false);
    bodyElm[0].onscroll = (event)  => {
    	let scrollLeft = bodyElm[0].scrollLeft;
    	headerElm[0].scrollLeft = scrollLeft;
    	//console.log('scroll... scrollLeft = ' + scrollLeft);

    	if (scope.scrollPromise) {
    		this.di.$timeout.cancel(scope.scrollPromise);
    	}
    	scope.scrollPromise = this.di.$timeout(() => {
    		getColsWidth();
      	updateBodyColsWidth();
    	}, 500);
    }

    scope.$on('$destroy', ()=> {
      document.removeEventListener('mousemove', mousemoveEvent);
      document.removeEventListener('mouseup', mouseupEvent);
      window.removeEventListener('resize', resizeEvent);
      unsubscribers.forEach((cb) => {
        cb();
      });
      bodyElm[0].onscroll = null;
    });
  }
}
updateTableCols.$inject = updateTableCols.getDI();
updateTableCols.$$ngIsClass = true;
