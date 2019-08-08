export class PopupTextRenderer {
  static getDI () {
    return [
      'renderService',
      'tableConsts',
      '$rootScope'
    ];
  }

  constructor (...args) {
    this.di = [];
    PopupTextRenderer.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    let clickHandler = ($event) => {
      if ($event.target._clickdata.value === '-'){
        return;
      }
      this.di.$rootScope.$emit('popuptext', $event.target._clickdata);
    };
    this.initialize = (spec) => {
      this.spec = spec;
    };

    this.render = (spec) => {


      let value = (spec.value === null || spec.value === undefined ? '-':String(spec.value));
      // spec.element.innerHTML = value;
      if(value.length >= 40){
        spec.element.innerHTML = "";
        // let clickSpan = "<i class='material-icons' style='vertical-align: middle;'>comment</i>";
        let popupBtn = document.createElement('i');
        popupBtn.setAttribute('class', 'material-icons');
        popupBtn.setAttribute('style', 'vertical-align: middle;cursor:pointer;');
        popupBtn.innerHTML = 'comment';
        popupBtn._clickdata = {value: spec.value, field: spec.col.field, object: spec.object};
        popupBtn.addEventListener('click', clickHandler);
        spec.element.appendChild(popupBtn);

        let valueP = document.createElement('p');
        valueP.innerHTML = value;
        valueP.setAttribute('style','display:inline;');
        spec.element.appendChild(valueP);
        
      } else {
        spec.element.innerHTML = value;
      }
      // spec.element.innerHTML = value;
      // spec.element.innerHTML = value;


      // if(value.length >= 30){
      //   // let clickSpan = "<i class='material-icons' style='vertical-align: middle;'>comment</i>";
      //   let popupBtn = document.createElement('i');
      //   popupBtn.setAttribute('class', 'material-icons');
      //   popupBtn.setAttribute('style', 'vertical-align: middle;');
      //   popupBtn.innerHTML = 'comment';
      //   popupBtn._clickdata = {value: spec.value, field: spec.col.field, object: spec.object};
      //   spec.element.appendChild(popupBtn);
      // }

      // (spec.value === null || spec.value === undefined ? '-' : clickSpan + String(spec.value));
      // spec.element._clickdata = {value: spec.value, field: spec.col.field, object: spec.object};
      // spec.element.addEventListener('click', clickHandler);

    };
    this.cleanup = (spec) => {
      if (spec.element) { // NOTE: initial cleanup is called before render, so there's no element in spec
        spec.element.removeEventListener('click', clickHandler);
      }
    };

    this.getType = () => {
      return this.di.renderService.render().CONST_TYPE_DOM;
    };
    this.getClasses = (spec) => {
      if (spec && spec.col.sort !== this.di.tableConsts.CONST.SORT_UNDEFINED) {
        return 'text-bold';
      }
      if (spec.col.type === 'clickabletext' && (spec.value !== '-')) {
        return 'clickable';
      }
    };
  }

  getPopupTextRenderer (renderService, tableConsts, $rootScope) {
    return new PopupTextRenderer(renderService, tableConsts, $rootScope);
  }
}

PopupTextRenderer.$inject = PopupTextRenderer.getDI();
PopupTextRenderer.$$ngIsClass = true;
