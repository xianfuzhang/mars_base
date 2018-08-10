export class notificationService{
  static getDI() {
   return [
     '$compile'
   ];
  }

  constructor(...args){
    this.di = {};
    notificationService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  render(scope) {
    let templateHtml = '<div class="notification-wrapper">'
      + '<div uib-alert class="notification-wrapper__content"'
      + 'ng-class="\'alert-\' + (alert.type || \'warning\')" dismiss-on-timeout="2000"'
      + 'close="closeAlert()">{{alert.msg}}</div></div>';

    let elm = this.di.$compile(templateHtml)(scope);
    document.body.appendChild(elm[0]);

    scope.closeAlert = () => {
      let closeDom = document.getElementsByClassName('notification-wrapper');
      for(let i=0; i< closeDom.length; i++) {
        document.body.removeChild(closeDom[i]);
      }
    };
    return this;
  }
}

notificationService.$inject = notificationService.getDI();
notificationService.$$ngIsClass = true;