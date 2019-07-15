export class  InputFilenameDialogController {
  static getDI() {
    return [
      '$scope',
      '$modalInstance',
      'dataModel',
      'dateService'
    ];
  }

  constructor(...args) {
    this.di = {};
    InputFilenameDialogController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.scope.fileNameRegex = '^[\w\-.]+$';
    this.scope.dialogModel = {
      filename: ''
    };

    this.scope.cancel = (event) => {
      this.di.$modalInstance.dismiss({
        canceled: true
      });
      event.stopPropagation();
    };

    this.scope.save = (event) => {
      this.di.$modalInstance.close({
        canceled: false,
        data: {
          filename: this.scope.dialogModel.filename
        }
      });
       event.stopPropagation();
    };
  }
}

InputFilenameDialogController.$inject = InputFilenameDialogController.getDI();
InputFilenameDialogController.$$ngIsClass = true;