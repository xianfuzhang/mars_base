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

    scope.$on('$destroy', () => {
      scope.closeAlert();
    });
    scope.closeAlert = () => {
      let closeDom = document.getElementsByClassName('notification-wrapper');
      let size = closeDom.length;
      for(let i=size -1; i>= 0; i--) {
        document.body.removeChild(closeDom[i]);
      }
    };
    return this;
  }

  renderSuccess(scope, message) {
    if(message instanceof Object){
      message = JSON.stringify(message)
    }
    let templateHtml = '<div class="notification-wrapper">'
      + '<div uib-alert class="notification-wrapper__content alert-success"'
      + 'dismiss-on-timeout="2000"'
      + 'close="closeAlert()">'+ message+'</div></div>';

    let elm = this.di.$compile(templateHtml)(scope);
    document.body.appendChild(elm[0]);

    scope.$on('$destroy', () => {
      scope.closeAlert();
    });
    scope.closeAlert = () => {
      let closeDom = document.getElementsByClassName('notification-wrapper');
      let size = closeDom.length;
      for(let i=size -1; i>= 0; i--) {
        document.body.removeChild(closeDom[i]);
      }
    };
    return this;
  }

  renderWarning(scope, message) {
    if(message instanceof Object){
      message = JSON.stringify(message)
    }
    let templateHtml = '<div class="notification-wrapper">'
      + '<div uib-alert class="notification-wrapper__content alert-warning"'
      + 'dismiss-on-timeout="6000"'
      + 'close="closeAlert()">'+ message+'</div></div>';

    let elm = this.di.$compile(templateHtml)(scope);
    document.body.appendChild(elm[0]);

    scope.$on('$destroy', () => {
      scope.closeAlert();
    });
    scope.closeAlert = () => {
      let closeDom = document.getElementsByClassName('notification-wrapper');
      let size = closeDom.length;
      for(let i=size -1; i>= 0; i--) {
        document.body.removeChild(closeDom[i]);
      }
    };
    return this;
  }

}

notificationService.$inject = notificationService.getDI();
notificationService.$$ngIsClass = true;