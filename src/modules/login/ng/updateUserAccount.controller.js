export class UpdateUserAccountController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$modalInstance',
      'dataModel',
      'appService'
    ];
  }

  constructor(...args) {
    this.di = {};
    UpdateUserAccountController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');

    this.scope.user = this.di.dataModel.user;
    this.scope.userModel = {
      user_name: this.scope.user.user_name,
      changePwd: true,
      pwdLabel: {id: 'check_1', label: this.translate('MODULE.ACCOUNT.UPDATE.PASSWORD')},
      changeGroup: true,
      groupLabel: {id: 'check_2', label: this.translate('MODULE.ACCOUNT.UPDATE.GROUP')},
      newPwd: null,
      passwordDisplayLabel: {
        id: 'password',
        //type: 'password'
      },
      passwordHelper: {
        id: 'passwordHelper',
        validation: 'false'
      },
      superGroupDisplayLabel: {
        id: 'super_group',
        label: this.translate('MODULE.ACCOUNT.CREATE.GROUP.SUPER'),
      },
      adminGroupDisplayLabel: {
        id: 'admin_group',
        label: this.translate('MODULE.ACCOUNT.CREATE.GROUP.ADMIN'),
      },
      guestGroupDisplayLabel: {
        id: 'guest_group',
        label: this.translate('MODULE.ACCOUNT.CREATE.GROUP.GUEST'),
      },
      group: {
        'supergroup':  this.scope.user.group.includes(this.di.appService.CONST.SUPER_GROUP),
        'admingroup': this.scope.user.group.includes(this.di.appService.CONST.ADMIN_GROUP),
        'guestgroup': this.scope.user.group.includes(this.di.appService.CONST.GUEST_GROUP)
      },
      groupHelper: {
        validation: 'false',
        content: this.translate('MODULE.ACCOUNT.CREATE.GROUP.HELP')
      }
    };
    this.scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    this.scope.save = (event) =>{
      let canceled = false, data ={}, groups = [];
      if (!this.scope.userModel.changePwd && !this.scope.userModel.changeGroup) {
        canceled = true;
      }
      else {
        if (this.scope.userModel.changePwd) {
          if (!this.scope.userModel.newPwd) {
            this.scope.userModel.passwordHelper.validation = 'true';
            return;
          }
          data['password'] = this.scope.userModel.newPwd;
        }
        if (this.scope.userModel.changeGroup) {
          if (!this.scope.userModel.group.admingroup && !this.scope.userModel.group.guestgroup
            && !this.scope.userModel.group.supergroup) {
            this.scope.userModel.groupHelper.validation = 'true';
            return;
          }
          if (this.scope.userModel.group.supergroup) {
            groups.push('admingroup');
          }
          if (this.scope.userModel.group.admingroup) {
            groups.push('managergroup');
          }
          if (this.scope.userModel.group.guestgroup) {
            groups.push('guestgroup');
          }
          data['groups'] = groups;
        }
        data['user_name'] = this.scope.userModel.user_name;
      }
      this.di.$modalInstance.close({
        canceled: canceled,
        result: data
      });
    };
  }
}
UpdateUserAccountController.$inject = UpdateUserAccountController.getDI();
UpdateUserAccountController.$$ngIsClass = true;