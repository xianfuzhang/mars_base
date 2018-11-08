export class PopupTextRenderer {
  static getDI () {
    return [
      'renderService',
      'tableConsts',
      '$rootScope'
    ];
  }

  constructor (...args) {
    this.di = [];
    PopupTextRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    let clickHandler = ($event) => {
      if ($event.target._clickdata.value === '-'){
        return;
      }
      this.di.$rootScope.$emit('popuptext', $event.target._clickdata);
    };
    this.initialize = (spec) => {
      this.spec = spec;
    };

    this.render = (spec) => {
      spec.element.innerHTML = (spec.value === null || spec.value === undefined ? '-' : String(spec.value));
      spec.element.addEventListener('click', clickHandler);

    };
    this.cleanup = (spec) => {
      if (spec.element) { // NOTE: initial cleanup is called before render, so there's no element in spec
        spec.element.removeEventListener('click', clickHandler);
      }
    };

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_DOM;
    };
    this.getClasses = (spec) => {
      if (spec && spec.col.sort !== this.di.tableConsts.CONST.SORT_UNDEFINED) {
        return 'text-bold';
      }
      if (spec.col.type === 'clickabletext' && (spec.value !== '-')) {
        return 'clickable';
      }
    };
  }

  getPopupTextRenderer (renderService, tableConsts, $rootScope) {
    return new PopupTextRenderer(renderService, tableConsts, $rootScope);
  }
}

PopupTextRenderer.$inject = PopupTextRenderer.getDI();
PopupTextRenderer.$$ngIsClass = true;
