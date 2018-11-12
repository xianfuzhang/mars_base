export class PopupTextRendererFactory {
  static getDI () {
    return [
      'renderService',
      'tableConsts',
      '$rootScope',
      'popupTextRenderer'
    ];
  }

  constructor (...args) {
    this.di = [];
    PopupTextRendererFactory.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  createFactory () {
    return this.di.popupTextRenderer.getPopupTextRenderer(this.di.renderService,
      this.di.tableConsts, this.di.$rootScope);
  }
}

PopupTextRendererFactory.$inject = PopupTextRendererFactory.getDI();
PopupTextRendererFactory.$$ngIsClass = true;