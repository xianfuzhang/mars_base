export class regexService {
  static getDI() {
    return [
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    regexService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.mac = '^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$';
    this.ipV4 = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    this.number = '^\d$|^[1-9]+[0-9]*$'

  }
}
regexService.$inject = regexService.getDI();
regexService.$$ngIsClass = true;


// let ress = '^[0-9]$|^[1-9]+[0-9]*$';
//
// var str="1010";
//
// console.log(str.match(ress));
