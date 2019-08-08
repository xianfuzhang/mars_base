export class ClickableTextRendererFactory {
  static getDI () {
    return [
      '$filter',
      'renderService',
      'tableConsts',
      '$rootScope',
      'clickableTextRenderer'
    ];
  }

  constructor (...args) {
    this.di = [];
    ClickableTextRendererFactory.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  createFactory () {
    return this.di.clickableTextRenderer.getClickableTextRenderer(this.di.$filter,
      this.di.renderService, this.di.tableConsts, this.di.$rootScope);
  }
}

ClickableTextRendererFactory.$inject = ClickableTextRendererFactory.getDI();
ClickableTextRendererFactory.$$ngIsClass = true;