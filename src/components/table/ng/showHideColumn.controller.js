export class showHideColumnCtrl {
  static getDI() {
    return [
      '$log',
      '$scope',
      '$modalInstance',
      'dataModel'
    ];
  }

  constructor(...agrs) {
    this.di = {};
    showHideColumnCtrl.getDI().forEach((value, index) => {
      this.di[value] = agrs[index];
    });
    this.di.$scope.columns_1 = [];
    this.di.$scope.columns_2 = [];

    this.di.$scope.cancel = () => {
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };
    this.di.$scope.save = () =>{
      this.di.$log.info(this.di.$scope.columns_2);
      let data = this.di.$scope.columns_1.concat(this.di.$scope.columns_2);
      this.di.$modalInstance.close({
        canceled: false,
        result: data
      });
    };

    this.init();
  }

  init() {
    let columns = this.di.dataModel.columns;
    let len = Object.keys(columns).length;
    let harlf = Math.round(len/2);
    Object.keys(columns).forEach((key, index) => {
      let obj = {};
      obj.visible = columns[key].visible;
      obj.ui = {'id': columns[key].field, 'label': columns[key].def.label};
      if (index < harlf) {
        this.di.$scope.columns_1.push(obj);
      }
      else{
        this.di.$scope.columns_2.push(obj);
      }
    });
  }
}

showHideColumnCtrl.$inject = showHideColumnCtrl.getDI();
showHideColumnCtrl.$$ngIsClass = true;