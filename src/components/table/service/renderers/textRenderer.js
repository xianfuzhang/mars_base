export class textRenderer {
  static getDI () {
    return [
      '$filter',
      'renderService',
      'tableConsts'
    ];
  }

  constructor (...args) {
    this.di = [];
    textRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.render = (spec) => {
      let scope = spec.getContext.$new(),
          tdElm = spec.element;

      let clickFilterHandler = () => {
        scope.$emit('td-filter-event', {
          'display': spec.col.def.label + ':=' + spec.value,
          'result': [[spec.col.field, 'equals', spec.value]]
        });
      };

      let tdEnterFunc = (event) => {
        let filterElm = this.getFilterFragment();
        tdElm.appendChild(filterElm);
        filterElm.addEventListener('click', clickFilterHandler);
      };

      let tdLeaveFunc = (event) => {
        let filterElm =tdElm.querySelector('.td_filter');
        if (filterElm) {
          filterElm.removeEventListener('click', clickFilterHandler);
          tdElm.removeChild(filterElm);
        }
      };
      
      if (tdElm) {
        tdElm.removeEventListener('mouseenter', tdEnterFunc);
        tdElm.removeEventListener('mouseleave', tdLeaveFunc);
      }

      tdElm.innerHTML = (spec.value === null || spec.value === undefined ? '-' : String(spec.value));
      if (spec.col.def.tooltip) {
        tdElm.title = spec.col_title || spec.value;
      }
      tdElm.addEventListener('mouseenter', tdEnterFunc);
      tdElm.addEventListener('mouseleave', tdLeaveFunc);
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

    this.getFilterFragment = () => {
      let filterElm = document.createElement('div');
      filterElm.className = 'td_filter';
      filterElm.title = this.di.$filter('translate')('MODULES.TABLE.FILTER.TITLE');
      return filterElm;
    };
  }

  getTextRenderer (filterService, renderService, tableConsts) {
    return new textRenderer(filterService, renderService, tableConsts);
  }
}

textRenderer.$inject = textRenderer.getDI();
textRenderer.$$ngIsClass = true;