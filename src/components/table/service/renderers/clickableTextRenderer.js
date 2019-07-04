export class ClickableTextRenderer {
  static getDI () {
    return [
      '$filter',
      'renderService',
      'tableConsts',
      '$rootScope'
    ];
  }

  constructor (...args) {
    this.di = [];
    ClickableTextRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    let clickHandler = ($event) => {
      if (!$event.target._clickdata || $event.target._clickdata.value === '-'){
        return;
      }
      this.di.$rootScope.$emit('clickabletext', $event.target._clickdata);
    };

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
      tdElm.innerHTML = (spec.value === null || spec.value === undefined ? '' : String(spec.value));
      tdElm._clickdata = {value: spec.value, field: spec.col.field, object: spec.object};
      tdElm.addEventListener('click', clickHandler);
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
      return spec.value == '-' ? 'unclickable' : 'clickable';
    };
    this.cleanClasses = (tdElm) => {
      tdElm.className = '';
    };

    this.getFilterFragment = () => {
      let filterElm = document.createElement('div');
      filterElm.className = 'td_filter';
      filterElm.title = this.di.$filter('translate')('MODULES.TABLE.FILTER.TITLE');
      return filterElm;
    };
  }

  getClickableTextRenderer (filterService, renderService, tableConsts, $rootScope) {
    return new ClickableTextRenderer(filterService, renderService, tableConsts, $rootScope);
  }
}

ClickableTextRenderer.$inject = ClickableTextRenderer.getDI();
ClickableTextRenderer.$$ngIsClass = true;
