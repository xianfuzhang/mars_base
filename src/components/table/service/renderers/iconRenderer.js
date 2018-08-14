export class iconRenderer {
  static getDI() {
    return [
      'renderService'
    ];
  }

  constructor(...args) {
    this.di = {};
    iconRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.render = (spec) => {
      if (!spec.value) {
        spec.innerHTML = '-';
      }
      else {
        spec.innerHTML = '<div class="status_icon '+ spec.value.toLowerCase() +'"></div>';
      }
      return spec.innerHTML;
    };

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_HTML;
    };
  }

  createFactory () {
    return new iconRenderer(this.di.renderService);
  }
}

iconRenderer.$inject = iconRenderer.getDI();
iconRenderer.$$ngIsClass = true;