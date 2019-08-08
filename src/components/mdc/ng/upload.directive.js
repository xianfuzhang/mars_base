export class mdlUpload {
  static getDI() {
    return [
      '$log',
      '$compile',
      '$http'
      ];
  }
  constructor(...args){
    this.di = {};
    mdlUpload.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.scope = {
      // disabled: '=',
      // size: '=',
      change: '&',
      value: '=ngModel',
      height: '@'
    };
    this.template = require('../templates/upload.html');
    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element, attr) {
    // scope.name = attr.iconName;
    let DI = this.di;
    let heightStr = scope.height || "40px";
    element.bind("change", function (event) {
      scope.uploadModel.fileText = event.target.files[0].name;
      scope.change({'event':event});
    });

    let height = parseInt(heightStr.slice(0, -2));
    scope.uploadModel = {
      file: null,
      fileText: null,
      randomID : "xxx",
      iconStyle: {"font-size": (height - 11)+ 'px'},
      iconOutletStyle: {"width": heightStr, "height":heightStr},
      textStyle: {"height": (height - 11)+ 'px'},
    };
    // if (disabled) {
    //   element.attr('disabled', true);
    // }
    // if(scope.size && scope.size === 'small' ||attr.size && attr.size === 'small') {
    //   element.addClass('mdc-icon-button__small');
    // }
    // if (attr.classList) {
    //   let classList = attr.classList.split(" ");
    //   classList.forEach((cls) => {
    //     element.addClass(cls);
    //   });
    // }

    // scope.changeInputText = () =>{
    //
    //   var fileInputTextDiv = document.getElementById('file_input_text_div');
    //
    //
    //   var str = scope.uploadModel.file.value;
    //   var i;
    //   if (str.lastIndexOf('\\')) {
    //     i = str.lastIndexOf('\\') + 1;
    //   } else if (str.lastIndexOf('/')) {
    //     i = str.lastIndexOf('/') + 1;
    //   }
    //   scope.uploadModel.fileText = str.slice(i, str.length);
    //
    //   if (scope.uploadModel.fileText.length != 0) {
    //     if (!fileInputTextDiv.classList.contains("is-focused")) {
    //       fileInputTextDiv.classList.add('is-focused');
    //     }
    //   } else {
    //     if (fileInputTextDiv.classList.contains("is-focused")) {
    //       fileInputTextDiv.classList.remove('is-focused');
    //     }
    //   }
    //
    // };

    // scope.$watch('disabled', () => {
    //   if (scope.disabled) {
    //     element.attr('disabled', true);
    //   }
    //   else{
    //     element.attr('disabled', false);
    //   }
    // }, true);
  }
}



mdlUpload.$inject = mdlUpload.getDI();
mdlUpload.$$ngIsClass = true;