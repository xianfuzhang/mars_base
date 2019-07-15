export class CheckboxRenderer {
  static getDI() {
    return [
      '$compile',
      'renderService',
      'uuid'
    ];
  }

  constructor(...args) {
    this.di = {};
    CheckboxRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.render = (spec) => {
      let tdElm = spec.element,
          scope = spec.getContext.$new();
      if (!spec.object['id']) spec.object['id'] = this.di.uuid();    
      scope.displayLabel = spec.params.displayLabel;
      scope.displayLabel['id'] = spec.object['id'] + '+' + scope.displayLabel['identify'];
      scope.checkboxModel = spec.value;
      scope.onClick = (val) => {
        console.log('checkboxRender current value =' + val);
        spec.object[spec.col.field] = val;
        spec.value = val;
        scope.$emit('td-checkbox-change', {'column': spec.col.field, 'newValue': val, 'trObject': spec.object});
        console.log('checkboxRender spec object =' + JSON.stringify(spec.object));
      };

      const innerHtml = '<mdl-checkbox ng-model="checkboxModel" display-label="displayLabel"'
                      + 'on-click="onClick($value)"></mdl-checkbox>';
      const elm = this.di.$compile(innerHtml)(scope);
      angular.element(tdElm).empty().append(elm);
    }

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_DOM;
    };
  }  

  createFactory () {
    return new CheckboxRenderer(this.di.$compile, this.di.renderService, this.di.uuid);
  }
}
CheckboxRenderer.$inject = CheckboxRenderer.getDI();
CheckboxRenderer.$$ngIsClass = true;