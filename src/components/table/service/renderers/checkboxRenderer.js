export class checkboxRendererFactory {
  static getDI () {
    return [
      'renderService',
      '$filter',
      '_'
    ];
  }

  constructor (...args) {
    this.di = [];
    checkboxRendererFactory.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  checkboxRenderer () {
    let stringFilter = this.di.$filter('string');

    this.initialize = (spec) => {
      this.spec = spec;
    };

    this.render = (spec) => {
      return this.di._.escape(stringFilter(spec.value));
    };

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_HTML;
    };

    this.getClasses = () => {
      return 'test';
    };
  }

  createItem () {
    return new this.checkboxRenderer();
  }
}

checkboxRendererFactory.$inject = checkboxRendererFactory.getDI();
checkboxRendererFactory.$$ngIsClass = true;
