/**
 * Created by yazhou.miao on 2019/2/21.
 */
export class chartService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_',
    ];
  }

  constructor(...args) {
    this.di = {};
    chartService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    let theme = this.getTheme();
  
    let Chart = require('chart.js');
    const colorHelper = Chart.helpers.color;
    
    this.helpers = Chart.helpers;
  
    this.styles = {
      colors: {
        colorPool: theme == 'theme_default'
          ? ['seagreen', 'skyblue', 'indianred', 'blueviolet', 'sandybrown', 'green','purple', 'deepskyblue','salmon', 'blue', 'red', 'firebrick',  'chocolate']
          : ['lightgreen', 'skyblue', 'salmon', 'bisque', 'blue',  'blueviolet', 'green', 'indianred', 'deepskyblue','firebrick', 'red', 'sandybrown', 'chocolate'],
        fontColor: theme == 'theme_default' ? '#282828' : '#d8d9da',
        gridLinesColor: theme == 'theme_default' ? 'gray' : '#a8a9aa',
      },
      lines: {
        gridWidth: 0.2,
        borderWidth: 2.5,
        borderLightWidth: 1.5,
        borderBoldWidth: 3.5,
        pointRadius: 0,
        pointHoverRadius: 2
      },
    }
  }

  getTheme() {
    const CONST_LOCAL_STORAGE_KEY = 'userPrefs__';
    const CONST_THEME = 'theme';
    let theme =  window.localStorage.getItem(CONST_LOCAL_STORAGE_KEY + CONST_THEME);
    
    return theme || 'theme_default';
  }
  
  getColor(color) {
    let foundColor = this.styles.colors.find((col) => {
      return col === color;
    })
    
    return foundColor ? foundColor : 'rgba(0,0,0,0.1)';
  }
  
  formatTime() {
    return this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
  }
  
  _pad(number) {
    if ( number < 10 ) {
      return '0' + number;
    }
    return number;
  }
  
}


chartService.$inject = chartService.getDI();
chartService.$$ngIsClass = true;