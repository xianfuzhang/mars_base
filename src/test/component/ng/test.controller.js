export class TestController {
  static getDI() {
    return [
      '$scope',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    TestController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.di.$scope.dashModel = {
      switch: false,
      checkbox: {
        state1: false,
        state2: true,
        state3: true,
      },
      radio1: 'DD',
      radio: 'AA',
      text1: null,
      text2: 'zhang'
    }
  }
}

TestController.$inject = TestController.getDI();
TestController.$$ngIsClass = true;

