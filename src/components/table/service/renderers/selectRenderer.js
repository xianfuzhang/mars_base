export class SelectRenderer {
  static getDI() {
    return [
      '$compile',
      'renderService'
    ];
  }

  constructor(...args) {
    this.di = {};
    SelectRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.render = (spec) => {
      let tdElm = spec.element,
          scope = spec.getContext.$new(); 
      scope.options = spec.params.options;
      const selectOption = scope.options.find((option) => {return option.value == spec.value});
      scope.selectModel = {'label': selectOption.label, 'value': spec.value};
      scope.changeSelect = (val) => {
        console.log('selectRender current select =' + JSON.stringify(val));
        spec.object[spec.col.field] = val.value;
        spec.value = val.value;
        scope.$emit('td-select-change', {'column': spec.col.field, 'newValue': val, 'trObject': spec.object});
        console.log('selectRender spec object =' + JSON.stringify(spec.object));
      };

      const innerHtml = '<mdl-select ng-model="selectModel" display-label="{options: options}"'
                      + 'ng-change="changeSelect($value)"></mdl-select>';
      const elm = this.di.$compile(innerHtml)(scope);
      angular.element(tdElm).empty().append(elm);
    }

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_DOM;
    };
  }

  createFactory () {
    return new SelectRenderer(this.di.$compile, this.di.renderService);
  }
}
SelectRenderer.$inject = SelectRenderer.getDI();
SelectRenderer.$$ngIsClass = true;