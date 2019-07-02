export class RadioRenderer {
	static getDI() {
    return [
    	'$compile',
      'renderService',
      'uuid'
    ];
  }

  constructor(...args) {
    this.di = {};
    RadioRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.render = (spec) => {
      let tdElm = spec.element,
          scope = spec.getContext.$new();
      if (!spec.object['id']) spec.object['id'] = this.di.uuid();    
      scope.displayLabel = spec.params.displayLabel;
      scope.displayLabel['id'] = spec.object['id'] + '+' + scope.displayLabel['value'];
      scope.displayLabel['name'] = spec.object['id'] + '+' + scope.displayLabel['group_name'];
      scope.radioModel = spec.value;
      scope.onClick = (val) => {
        console.log('radioRender current value =' + val);
        spec.object[spec.col.field] = val;
        spec.value = val;
        scope.$emit('td-radio-change', {'column': spec.col.field, 'newValue': val, 'trObject': spec.object});
        console.log('radioRender spec object =' + JSON.stringify(spec.object));
      };

      const innerHtml = '<mdl-radio ng-model="radioModel" display-label="displayLabel"'
                      + 'on-click="onClick($value)"></mdl-radio>';
      const elm = this.di.$compile(innerHtml)(scope);
      angular.element(tdElm).empty().append(elm);
    }

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_DOM;
    };
  }  

  createFactory () {
    return new RadioRenderer(this.di.$compile, this.di.renderService, this.di.uuid);
  }
}
RadioRenderer.$inject = RadioRenderer.getDI();
RadioRenderer.$$ngIsClass = true;