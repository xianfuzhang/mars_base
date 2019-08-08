import {MDCTextField} from '@material/textfield';
export class TestController {
  static getDI() {
    return [
      '$scope',
      '$log',
      '$q',
      '$timeout',
      '$uibModal',
      '_',
    ];
  }

  constructor(...args) {
    this.di = {};
    TestController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });


    // const textField = new MDCTextField(document.querySelector('.mdc-text-field'));


  }

}

TestController.$inject = TestController.getDI();
TestController.$$ngIsClass = true;

