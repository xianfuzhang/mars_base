export class splineChart {
  static getDI() {
    return ['$timeout', 'c3'];
  }
  constructor(...args){
    this.di= {};
    splineChart.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/splineChart.html');
    this.scope= {
      data: '=',
      c3Params: '=',
      aync: '='
    };
    this.link = (...args)  => this._link.apply(this, args);
  }

  _link(scope, element, attr){
    let data = scope.data || [],
      c3Params = scope.c3Params || {},
      chart;

    let initChart = () => {
      let params = {
        size: {
          height: 280
        },
        padding: {
          right: 24
        },
        data: {
          x: 'x',
          xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
          columns: data,
          type: 'spline'
        },
        color: {
          pattern: ['#0077cb', '#c78500', '#009f0e', '#008e7f', '#34314c']
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: (d) => {
                return this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
              }
            }
          },
          y: {
            tick: {
              format: function (d) { return d.toFixed(2) + '%'; }
            }
          }
        },
        tooltip: {
          format: {
            title: (d) => {
              return this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate()) + ' ' 
                + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
            }
          }
        }
      };
      Object.assign(params, c3Params);
      chart = this.di.c3.generate(params);

      element.append(chart.element);
    }
    initChart();

    let resizeEvent = () =>{
      if (scope.resizePromise) {
        this.di.$timeout.cancel(scope.resizePromise);
      }
      scope.resizePromise = this.di.$timeout(() => {
        chart.resize({
          width: element[0].clientWidth,
          height: element[0].clientHeight
        });
      });
    }

    window.addEventListener('resize', resizeEvent, false);

    scope.$watch('aync', (data) => {
      chart.load({
        columns: scope.data
      });
      chart.legend.show();
    });

    scope.$on('$destroy', ()=> {
      window.removeEventListener('resize', resizeEvent);
    });
  }

  pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
  }
}

splineChart.$inject = splineChart.getDI();
splineChart.$$ngIsClass = true;