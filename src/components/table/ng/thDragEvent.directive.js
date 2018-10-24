export class thDragEvent {
	static getDI() {
		return ['$rootScope'];
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
		let allowResize = false,  //允许调整col，在col右侧10px以内
				startResize = false,  //开始计算调整，mousedown开始，mouseup结束
				startX = 0;
		let mousedownEvent = (event) => {
			event.preventDefault();
			if (allowResize) {
				startResize = true;
				startX = event.clientX;
				this.di.$rootScope.$emit('mousemove-th-col', 
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

		element[0].addEventListener('mousedown', mousedownEvent, false);
		element[0].addEventListener('mousemove', mousemoveEvent, false);

		scope.$on('$destroy', ()=> {
			element[0].removeEventListener('mousedown', mousedownEvent);
			element[0].removeEventListener('mousemove', mousemoveEvent);
    });
	}
}

thDragEvent.$inject = thDragEvent.getDI();
thDragEvent.$$ngIsClass = true;