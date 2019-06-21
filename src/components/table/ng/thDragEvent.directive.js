export class thDragEvent {
  static getDI() {
    return [];
  }

  constructor(...args){
    this.di = {};
    thDragEvent.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.restrict = 'A';
    this.require = '^mdlTable';
    this.link = (...args) => this._link.apply(this, args);
  }

  _link(scope, element, attrs, ctrl) {
    let thNodes = element[0].parentNode.children,
        allowResize = false,  //允许调整col，在col右侧10px以内
        startResize = false,  //开始计算调整，mousedown开始，mouseup结束
        startX = 0;
    let mousedownEvent = (event) => {
      event.preventDefault();
      if (allowResize) {
        startResize = true;
        startX = event.clientX;
        scope.$emit('mousemove-th-col', 
          {
            'field': scope.$col.field, 
            'width': event.offsetX,
            'startX': startX,
            'element': element[0],
            'startResize': startResize
        });
      }
      return false;
    };
    let mousemoveEvent = (event) => {
      event.preventDefault();
      let offset = event.offsetX||(event.originalEvent && event.originalEvent.layerX)||0;
      allowResize = element[0].clientWidth - offset <= 10;
      element.css('cursor', (allowResize ? 'col-resize' : 'pointer'));
      return false;
    };
    let mouseleaveEvent = (event) => {
      for (let i = 0; i < thNodes.length; i++) {
        thNodes[i].classList.remove('border-left');
      }
    };
    let mouseenterEvent = (event) => {
      for (let i = 0; i < thNodes.length; i++) {
        let regResult = /\d+/.exec(thNodes[i].clientWidth),
            width = regResult ? parseInt(regResult[0]) : 0;
        if (i > 0) thNodes[i].style.width = (width > 0 ? width - 2 : 0) + 'px';
        thNodes[i].classList.add('border-left');
      }
    };

    element[0].addEventListener('mousedown', mousedownEvent, false);
    element[0].addEventListener('mousemove', mousemoveEvent, false);
    element[0].addEventListener('mouseleave', mouseleaveEvent, false);
    element[0].addEventListener('mouseenter', mouseenterEvent, false);

    scope.$on('$destroy', ()=> {
      element[0].removeEventListener('mousedown', mousedownEvent);
      element[0].removeEventListener('mousemove', mousemoveEvent);
      element[0].removeEventListener('mouseleave', mouseleaveEvent);
      element[0].removeEventListener('mouseenter', mouseenterEvent);
    });
  }
}

thDragEvent.$inject = thDragEvent.getDI();
thDragEvent.$$ngIsClass = true;