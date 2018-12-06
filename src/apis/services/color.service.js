export class ColorService {
  static getDI() {
    return [];
  }
  constructor(...args) {
  }

  getFanSensorGradient(pct) {
    let retString = ['linear-gradient(to right,'];
    if (pct >= 0) {
      retString.push(' #00FF00')
    }
    if (pct >= 25) {
      retString.push(', #00EE00 25%')
    }
    if (pct >= 50) {
      retString.push(', #00CD00 50%')
    }
    if (pct >= 60) {
      retString.push(', #FFFF00 60%')
    }
    if (pct >= 80) {
      retString.push(', #FFD700 80%')
    }
    if (pct >= 85) {
      retString.push(', #FFC125 85%')
    }
    if (pct >= 90) {
      retString.push(', #FF7F24 90%')
    }
    if (pct >= 95) {
      retString.push(', #FF4500 95%')
    }
    retString.push(', #ffffff ' + pct + '%'); 
    retString.push(')');
    return retString.join('');
  }
}
ColorService.$inject = ColorService.getDI();
ColorService.$$ngIsClass = true;