import {MDCRipple} from '@material/ripple';

export class DashboardController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$window',
      '_',
      '$http',
      '$q',
      'appService',
      'c3'

    ];
  }

  constructor(...args) {
    this.di = {};
    DashboardController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.di.$window.requestAnimFrame = (function(callback) {
      return this.di.$window.requestAnimationFrame
        || this.di.$window.webkitRequestAnimationFrame
        || this.di.$window.mozRequestAnimationFrame
        || this.di.$window.oRequestAnimationFrame
        || this.di.$window.msRequestAnimationFrame
        || (function(callback) {
          this.di.$window.setTimeout(callback, 1000 / 60);
        }).call(this);
    }).call(this);

    this.interval_device = null;
    let unSubscribers = [];

    let di = this.di;
    setTimeout(function () {
      // var chart = di.c3.generate({
      //   bindto: '#testC3',
      //   data: {
      //     columns: [
      //       ['data1', 30, 200, 100, 400, 150, 250],
      //       ['data2', 50, 20, 10, 40, 15, 25]
      //     ],
      //     axes: {
      //       data2: 'y2' // ADD
      //     }
      //   },
      //   axis: {
      //     y2: {
      //       show: true // ADD
      //     }
      //   }
      // });

      // var chart1 = di.c3.generate({
      //   bindto: '#testC2',
      //   data: {
      //     columns: [
      //       ['data1', 30, 200, 100, 400, 150, 250],
      //       ['data2', 50, 20, 10, 40, 15, 25]
      //     ],
      //     axes: {
      //       data2: 'y2' // ADD
      //     }
      //   },
      //   axis: {
      //     y2: {
      //       show: true // ADD
      //     }
      //   }
      // });

      var chart2 = di.c3.generate({
        bindto: '#testC1',
        data: {
          columns: [
            ['data1', 1, 32, 124, 64, 78, 124],
            ['data2', 54, 20, 30, 10, 135, 125]
          ],
          axes: {
            data2: 'y2' // ADD
          }
        },
        axis: {
          y2: {
            show: true // ADD
          }
        }
      });
    });



    this.di.$scope.dashboardModel = {

    };

    let getAllDeviceStatistics = () =>{

    };

    // const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));

    let getTop5CPU = (statistics) =>{

    };

    let getTop5Mem = (statistics) => {

    };

    let exec =()=>{
      let statistics = getAllDeviceStatistics();
      getTop5CPU(statistics);
      getTop5Mem(statistics);
    };

    let init = () => {

      this.interval_device = setInterval(exec, 15000);
    };


    this.di.$scope.$on('$destroy', () => {
      this.di._.each(unSubscribers, (unSubscribe) => {
        unSubscribe();
      });

      clearInterval(this.interval_device);

    });
  }
}

DashboardController.$inject = DashboardController.getDI();
DashboardController.$$ngIsClass = true;

