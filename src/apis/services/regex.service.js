export class regexService {
  static getDI() {
    return [];
  }

  constructor(...args) {
    this.di = {};
    regexService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.reg = {
      //包含中文,A-Z,a-z,0-9,(,),-,_限定最长15个字符长度
      'nameString': /^[\u4e00-\u9fa5\uff08\uff09\u2014\A-\Z\a-\z\d\_\-\(\)]{1,15}$/,
      'account': /^[A-Za-z0-9]{5,20}$/,
      'mac': /^([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/,
      'int': /^[1-9]\d*|-[1-9]\d*$/,
      'number': /^[0-9]\d*$/,
      'dscp_number': /^((0|[1-5]\d|6[0-3]),?)*(0|[1-5]\d|6[0-3])$/, //0-63,数据间用,分割
      'vlan_number': /^([0-9]{1,3}|40[0-9][0-6])$/, //0-4096
      'positive_int': /^[1-9]\d*$/,
      'ip': /^(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))$/,
      'ip_mask':/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|[1-2][0-9]|3[0-2])$/
    }
  }

  excute(type, value) {
    return value ? this.reg[type].test(value) : false;
  }
}
regexService.$inject = regexService.getDI();
regexService.$$ngIsClass = true;
