export class AccountManageController {
  static getDI() {
    return [
      '$scope',
      '$filter',
      '$q',
      '$uibModal',
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
      if (event.$data){
        this.scope.accountModel.api.setSelectedRow(event.$data.id);
      }
    };

    this.scope.onAPIReady = ($api) => {
      this.scope.accountModel.api = $api;
    };

    this.scope.createUser = () => {

    };

    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        this.confirmDialog(this.translate('MODULES.SWITCHES.DIALOG.CONTENT.BATCH_DELETE_SWITCH'))
          .then((data) =>{
            this.batchDeleteUserAccounts($value);
          }, (res) =>{
            this.di.$log.debug('delete user account dialog cancel');
          });
      }
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

  confirmDialog(content) {
    let defer = this.di.$q.defer();
    this.di.$uibModal
      .open({
        template: require('../../../components/mdc/templates/dialog.html'),
        controller: 'dialogCtrl',
        backdrop: true,
        resolve: {
          dataModel: () => {
            return {
              type: 'warning',
              headerText: this.translate('MODULES.SWITCHES.DIALOG.HEADER'),
              contentText: content,
            };
          }
        }
      })
      .result.then((data) => {
      if(data) {
        defer.resolve(data);
      }
      else {
        defer.reject(null);
      }
    });

    return defer.promise;
  }

  batchDeleteUserAccounts(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.accountDataManager.deleteUser(item.user_name)
        .then(() => {
          defer.resolve();
        }, () => {
          defer.resolve();
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.accountModel.api.queryUpdate();
    });

    this.scope.$emit('batch-delete-endpoints');
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