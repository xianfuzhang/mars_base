export class CreateUserAccountController {
  static getDI() {
    return [
      '$log',
      '$scope',
      '$filter',
      '$modalInstance',
      'regexService'
    ];
  }

  constructor(...args) {
    this.di = {};
    CreateUserAccountController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.userModel = {
      userForm: {},
      user_name: null,
      password: null,
      groups: [],
      userNameDisplayLabel: {
        id: 'username',
        hint: this.translate('MODULE.ACCOUNT.CREATE.NAME'),
        regType: 'account',
        type: 'text',
        required: 'true'
      },
      userNameHelper: {
        id: 'userNameHelper',
        validation: 'false',
        content: this.translate('MODULE.LOGIN.FORM.USERNAME.HELP')
      },
      passwordDisplayLabel: {
        id: 'password',
        hint: this.translate('MODULE.ACCOUNT.CREATE.PASSWORD'),
        //type: 'password',
        regType: 'nameString',
        required: 'true'
      },
      passwordHelper: {
        id: 'passwordHelper',
        validation: 'false',
        content: this.translate('MODULE.LOGIN.FORM.PASSWORD.HELP')
      },
      group:{
        'supergroup': false,
        'admingroup': false,
        'guestgroup': false
      },
      groupHelper: {
        validation: 'false',
        content: this.translate('MODULE.ACCOUNT.CREATE.GROUP.HELP')
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
      }
    };

    this.scope.cancel = (event) => {
      event && event.stopPropagation();
      this.di.$modalInstance.dismiss({
        canceled: true
      });
    };

    this.scope.save = (event) =>{
      let invalid = false;
      if (this.scope.userModel.userForm.$invalid) {
        return;
      }
      if (!this.scope.userModel.user_name) {
        this.scope.userModel.userNameHelper.validation = 'true';
        this.scope.userModel.userNameHelper.content = this.translate('MODULE.LOGIN.FORM.USERNAME.HELP');
        invalid = true;
      }
      else if (!this.di.regexService.excute('account', this.scope.userModel.user_name))  {
       this.scope.userModel.userNameHelper.validation = 'true';
       this.scope.userModel.userNameHelper.content = this.translate('MODULE.ACCOUNT.CREATE.NAME.HELP');
        invalid = true; 
      }
      else {
        this.scope.userModel.userNameHelper.validation = 'false';
      }
      if (!this.scope.userModel.password) {
        this.scope.userModel.passwordHelper.validation = 'true';
        invalid = true;
      }
      else {
        this.scope.userModel.passwordHelper.validation = 'false';
      }
      if (!this.scope.userModel.group.admingroup && !this.scope.userModel.group.guestgroup
        && !this.scope.userModel.group.supergroup) {
        this.scope.userModel.groupHelper.validation = 'true';
        invalid = true;
      }
      else {
        this.scope.userModel.groupHelper.validation = 'false';
      }
      if (invalid) {
        return;
      }
      if (this.scope.userModel.group.supergroup) {
        this.scope.userModel.groups.push('admingroup');
      }
      if (this.scope.userModel.group.admingroup) {
        this.scope.userModel.groups.push('managergroup');
      }
      if (this.scope.userModel.group.guestgroup) {
        this.scope.userModel.groups.push('guestgroup');
      }
      let data = {
        'user_name': this.scope.userModel.user_name,
        'groups': this.scope.userModel.groups,
        'password': this.scope.userModel.password
      };
      this.di.$modalInstance.close({
        canceled: false,
        result: data
      });
    };
  }
}
CreateUserAccountController.$inject = CreateUserAccountController.getDI();
CreateUserAccountController.$$ngIsClass = true;