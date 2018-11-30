export class RoleService {
  static getDI() {
    return [
      '$cookies',
      'appService',
      'crypto'
    ];
  }

  constructor(...args) {
    this.di = {};
    RoleService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getRole() {
    if (!this.role) {
      if(this.di.$cookies.get('menu')) {
        let menu = this.di.$cookies.get('menu');
        let decodeBytes = this.di.crypto.AES.decrypt(menu.toString(), this.di.appService.CONST.CRYPTO_STRING);
        let decodeData = decodeBytes.toString(this.di.crypto.enc.Utf8);
        this.role = JSON.parse(decodeData).role;
      }
      else {
        this.role = 1;
      }  
    }
    return this.role;
  }

  clearRole() {
    this.role = null;
  }
}
RoleService.$inject = RoleService.getDI();
RoleService.$$ngIsClass = true;  