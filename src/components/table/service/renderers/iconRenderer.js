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
        if (spec.value.toLowerCase() == 'available' || spec.value.toLowerCase() == 'unavailable') {
          spec.innerHTML = '<div class="status_icon '+ spec.value.toLowerCase() +'"></div>';
        }
        else {
          spec.innerHTML = '<div class="status_icon material_icon '+ spec.value.toLowerCase() +'">'  +
            '<i class="material-icons">'+ spec.value.toLowerCase() +'</i></div>';
        }
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