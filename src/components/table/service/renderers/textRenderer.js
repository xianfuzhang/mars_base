export class textRenderer {
  static getDI () {
    return [
      'renderService',
      'tableConsts'
    ];
  }

  constructor (...args) {
    this.di = [];
    textRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.initialize = (spec) =>{
      this.spec = spec;
    };

    this.render = (spec) => {
      spec.element.innerHTML = (spec.value === null || spec.value === undefined ? '-' : String(spec.value));
      if (spec.col.def.tooltip) {
        spec.element.title = spec.col_title || spec.value;
      }
    };

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_DOM;
    };
    this.getClasses = (spec) => {
      return;
      if (spec && spec.col) {
        if (spec.col.def.cursor) {
          if (spec.col.sort !== this.di.tableConsts.CONST.SORT_UNDEFINED) {
            return 'text-bold cursor-' + spec.col.def.cursor;
          } else {
            return 'cursor-' + spec.col.def.cursor;
          }
        } else if (spec.col.sort !== this.di.tableConsts.CONST.SORT_UNDEFINED) {
          return 'text-bold';
        }
      }
    };
  }

  getTextRenderer (renderService, tableConsts) {
    return new textRenderer(renderService, tableConsts);
  }
}

textRenderer.$inject = textRenderer.getDI();
textRenderer.$$ngIsClass = true;