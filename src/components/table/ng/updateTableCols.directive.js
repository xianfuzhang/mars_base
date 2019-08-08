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
    let body_x_scroll_width = 0, body_y_scroll_width = 0, 
        table_width = element[0].clientWidth,  origin_table_width = element[0].clientWidth;

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
      body_x_scroll_width = bodyElm[0].offsetHeight - bodyElm[0].clientHeight;
      body_y_scroll_width = bodyElm[0].offsetWidth - bodyElm[0].clientWidth;
      if (!cols.length) {
        let thElms = headerElm.find('th');
        for(let i=0; i< thElms.length; i++) {
          let obj = {}, width = thElms.eq(i)[0].clientWidth > 0 ? thElms.eq(i)[0].clientWidth - 2 : 0; //table的padding默认是2px
          obj['resize-col-' + i] = thElms.eq(i)[0];
          obj['width'] = width;//Math.max(width, CONST_MIN_WIDTH);
          obj['hide'] = thElms.eq(i).hasClass('ng-hide');
          cols.push(obj);
        }
      }
      if (body_x_scroll_width > 0) {
        //cols没有x-sroll-patch，新增col，然后更新width
        let patch = cols.filter((col) =>{return col.type === 'patch'});
        if (!patch.length) {
          cols.push({
            'type': 'patch',
            'width': body_x_scroll_width -2
          });
          let thElm = document.createElement('th');
          thElm.className = 'x-sroll-patch';
          thElm.style.width = (body_x_scroll_width - 2) + 'px';
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

    let modifyColsByMouseMoveEvent = () => {
      //向右拖
      let willChangeLen = 0;
      if(g_offset === _last_g_offset){
        return;
      } 
      else if(g_offset > _last_g_offset){
        //获取右侧可变框的数量
        for(let index = 0; index < cols.length ; index ++){
          if(index > curIndex && cols[index]['width'] > CONST_MIN_WIDTH ){
            willChangeLen += 1;
          }
        }
        //右侧没有压缩的框，则不发生变动
        if(willChangeLen === 0){
          return;
        }
        let changedWidth = (g_offset - _last_g_offset)/willChangeLen;
        for(let index = cols.length -1 ; index >=0 ; index --){
          let colObj = cols[index];
          if (!colObj.type) {
            if(index < curIndex) {
              //固定左侧的框，防止意外变动
              colObj['width'] = colObj['width'];
              colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
            }else if(index === curIndex){
              // colObj['width'] = curAllWidth[index] + g_offset;
              colObj['width'] = colObj['width'] + (g_offset - _last_g_offset);
              colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
            } else {
              // 当前框已经到了最小值
              if(colObj['width'] <= CONST_MIN_WIDTH){
                continue;
              }
              colObj['width'] = colObj['width'] - changedWidth;
              colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
            }
          }
        }
      } 
      else {
        //向左拖
        willChangeLen = cols.length - curIndex -1;
        let changedWidth = (g_offset - _last_g_offset)/willChangeLen;
        if(cols[curIndex]['width'] <= CONST_MIN_WIDTH){
          return ;
        }
        for(let index = cols.length -1 ; index >=0 ; index --){
          let colObj = cols[index];
          if (!colObj.type) {
            if(index < curIndex) {
              //固定左侧的框，防止意外变动
              colObj['width'] = colObj['width'];
              colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
            }else if(index === curIndex){
              colObj['width'] = colObj['width'] + (g_offset - _last_g_offset);
              colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
            } else {
              colObj['width'] = colObj['width'] - changedWidth;
              colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
            }
          }
        }
      }
    };

    let modifyColsByResizeEvent = () => {
      let willChangeLen = 0;
      //窗口变大table自动扩展不影响，窗口变小table调整col 宽度
      if (table_width < origin_table_width) {
        for(let index = 0; index < cols.length; index ++){
          if(cols[index]['width'] > CONST_MIN_WIDTH ){
            willChangeLen += 1;
          }
        }
        if(willChangeLen === 0){
          return;
        }
        let colWidth = (origin_table_width - table_width)/willChangeLen;
        for(let index = 0; index < cols.length; index ++){
          let colObj = cols[index];
          if (!colObj.type) {
            if(colObj['width'] <= CONST_MIN_WIDTH){
              continue;
            }
            colObj['width'] = colObj['width'] - colWidth;
            colObj['hide'] = angular.element(colObj['resize-col-' + index]).hasClass('ng-hide');
          }
        }
      }
    };

    let modifyColsByShowHideColumns = () => {
      //不改变原来table宽度情况下，新增的列宽通过把原有总宽度/可见列宽
      let count =0, total = 0;
      for(let i = 0; i < cols.length; i++) {
        if (!cols[i]['resize-col-' + i]) continue; //剔除patch
        //剔除checkbox,menu
        if (cols[i]['resize-col-' + i].classList.contains('control-th')) {
          cols[i]['width'] = CONST_MIN_WIDTH;
          continue;
        }
        else {
          total += cols[i]['width'];
        }
        //根据最新的class设置hide值
        cols[i]['hide'] = cols[i]['resize-col-' + i].classList.contains('ng-hide') 
          || (cols[i]['resize-col-' + i].classList.contains('ng-hide-animate') 
              && cols[i]['resize-col-' + i].classList.contains('ng-hide-add'))
          || false;
        if (!cols[i]['hide']) count++;
      }
      let average = Math.floor(total / count);
      //console.log('total=' + total + ',count=' + count + ',average=' + average);
      for(let i = 0; i < cols.length; i++) {
        if (!cols[i]['resize-col-' + i]) continue;
        if (cols[i]['resize-col-' + i].classList.contains('control-th')) {
          cols[i]['width'] = CONST_MIN_WIDTH;
        }
        else {
          cols[i]['width'] = cols[i]['hide'] === true ? 0 : average;
        }
      }
      //console.log(cols);
    };

    let updateColsWidth = () => {
      let thElms = headerElm.find('th');
      for(let i=0; i< thElms.length; i++) {
        if (!thElms.eq(i).hasClass('x-sroll-patch')) {
          //let width = cols[i].width < CONST_MIN_WIDTH ? CONST_MIN_WIDTH : cols[i].width;
          thElms.eq(i)[0].style.width = cols[i].width + 'px';
        }
      }
    };
    //调整tbody中td的width
    let updateBodyColsWidth = () => {
      const trElms = bodyElm.find('tr'),
            tdElms = trElms.eq(0).find('td');
      if (tdElms.length > 1) {
        for(let i=0; i< tdElms.length; i++) {
          //if (!cols[i].hide) {
            if (i === tdElms.length -1 && body_y_scroll_width > 0) {
              tdElms.eq(i)[0].style.width = (cols[i].width - body_y_scroll_width) + 'px';
            }
            else {
              tdElms.eq(i)[0].style.width = cols[i].width + 'px';   
            }
          //}
        }
      }
    };

    let dict = {};
    let curIndex = -1;
    let g_offset = 0;
    let _last_g_offset = 0;
    scope.$on('mousemove-th-col', (event, data) => {
      dict = data;
      //最后一列不可以拖动
      let isLast = false;
      curIndex = -1;
      cols.forEach((colObj, index) => {
        if(dict.element == colObj['resize-col-' + index]){
          curIndex = index;
          if(index === cols.length -1){
            isLast = true;
          }
        }
      });
      if(!isLast && curIndex > -1){
        document.addEventListener('mousemove', mousemoveEvent, false);
      }
    });

    //显示隐藏columns时调整table的tds width
    unsubscribers.push(this.di.$rootScope.$on('table-show-hide-columns', (event) => {
      this.di.$timeout(() => {
        getColsWidth();
        modifyColsByShowHideColumns();
        updateColsWidth();
        updateBodyColsWidth();  
      }, 500);
    }));
    //tbody渲染以后调整td宽度（scroll宽度影响tds）
    unsubscribers.push(this.di.$rootScope.$on('table-render-ready', (event) => {
      //hard codeing 针对是否overflow显示不同样式
      const tableHeight = bodyElm[0].parentElement.clientHeight;
      const tbodyHeight = bodyElm.children()[0].clientHeight;
      const isPaganation = bodyElm[0].classList.contains('pagination-table');
      //console.log('tableHeight=' + tableHeight + ', tbodyHeight=' + tbodyHeight + ',isPaganation=' + isPaganation);
      //theader.len + tfooter.len = 100
      if (tableHeight - 100 >= tbodyHeight) {
        bodyElm[0].style.height = 'auto';
      }
      else {
        bodyElm[0].style.height = 'calc(100% - 100px)';
      }

      getColsWidth();
      updateColsWidth();
      updateBodyColsWidth();
    }));  

    let mousemoveEvent = (event) => {
      if (dict.startResize) {
        event.preventDefault();
        let offset = event.clientX - dict.startX;
        g_offset = offset;
        /*//当某col达到最小60px，取消move
        if (colsMinInspect() && offset > 0 ) {
          return false;
        }*/

        // let width = dict.width + offset;
        // console.log("width:: " + width + ";offset:" + offset)
        // if (width < CONST_MIN_WIDTH) width = CONST_MIN_WIDTH;
        // dict.element.style.width = width + 'px';

        //统计table header th的width
        getColsWidth();
        modifyColsByMouseMoveEvent();
        updateColsWidth();
        //修改对应class的width
        updateBodyColsWidth();
        _last_g_offset = g_offset;
      }
    };
    let mouseupEvent = (event) => {
      document.removeEventListener('mousemove', mousemoveEvent);
      curIndex = -1;
      g_offset = 0;
      _last_g_offset = 0;

      if (dict.startResize) {
        dict = {};
      }
    };
    let resizeEvent = (event) => {
      if (scope.resizePromise) {
        this.di.$timeout.cancel(scope.resizePromise);
      }
      scope.resizePromise = this.di.$timeout(() => {
        //hard codeing 针对是否overflow显示不同样式
        const tableHeight = bodyElm[0].parentElement.clientHeight;
        const tbodyHeight = bodyElm.children()[0].clientHeight;
        if (tableHeight - 100 >= tbodyHeight) {
          bodyElm[0].style.height = 'auto';
        }
        else {
          bodyElm[0].style.height = 'calc(100% - 100px)';
        }
        table_width = element[0].clientWidth;
        getColsWidth();
        modifyColsByResizeEvent();
        updateColsWidth();
        updateBodyColsWidth();
      }, 500);
    };
    
    // document.addEventListener('mousemove', mousemoveEvent, false);
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
