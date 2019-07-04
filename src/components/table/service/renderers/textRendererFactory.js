export class textRendererFactory {
  static getDI () {
    return [
      '$filter',
      'renderService',
      'tableConsts',
      'textRenderer'
    ];
  }

  constructor (...args) {
    this.di = [];
    textRendererFactory.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  createFactory () {
    return this.di.textRenderer.getTextRenderer(this.di.$filter, this.di.renderService, this.di.tableConsts);
  }
}

textRendererFactory.$inject = textRendererFactory.getDI();
textRendererFactory.$$ngIsClass = true;