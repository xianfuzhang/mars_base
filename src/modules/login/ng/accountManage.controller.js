export class AccountManageController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$q',
      'accountService',
      'accountDataManager',
      'tableProviderFactory'
    ];
  }
  constructor(...args) {
    this.di = {};
    AccountManageController.getDI().forEach((value, index) => {
     this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.page_title = this.translate('MODULE.ACCOUNT.MANAGE.TITLE');

    this.scope.accountModel = {
      provider: null,
      actionsShow: this.di.accountService.getActionsShow(),
      //rowActions: null,
      api: null
    };

    this.scope.onTableRowClick = (event) => {

    };

    this.scope.onAPIReady = ($api) => {
      this.scope.accountModel.api = $api;
    };

    this.scope.createUser = () => {

    };

    this.scope.batchRemove = () => {

    };

    this.init();
  }

  init() {
    this.scope.accountModel.provider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        params.pagination = {};
        this.di.accountDataManager.getUsers(params).then((res) => {
          this.scope.entities = this.getEntities(res.data.users);
          defer.resolve({
            data: this.scope.entities,
            //count: res.data.total
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.accountService.getTableSchema(),
          index_name: 'id',
          rowCheckboxSupport: true
        };
      }
    });
  }

  getEntities(users) {
    let entities = [];
    users.forEach((user) => {
      let obj = {};
      obj['id'] = user['user_name'];
      obj['user_name'] = user['user_name'];
      obj['group'] = user['groups'];
      entities.push(obj);
    });
    return entities;
  }
}
AccountManageController.$inject = AccountManageController.getDI();
AccountManageController.$$ngIsClass = true;