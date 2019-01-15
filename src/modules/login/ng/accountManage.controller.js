export class AccountManageController {
  static getDI() {
    return [
      '$log',
      '$scope',
      '$filter',
      '$q',
      //'$uibModal',
      'dialogService',
      'roleService',
      'accountService',
      'notificationService',
      'accountDataManager',
      'tableProviderFactory',
      'modalManager'
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
    this.scope.role = this.di.roleService.getRole();
    this.scope.accountModel = {
      provider: null,
      actionsShow: this.di.accountService.getActionsShow(),
      rowActions: this.di.accountService.getRowActions(),
      api: null
    };

    this.scope.onTableRowSelectAction = (event) => {
      if (event.action.value === 'edit') {
        this.di.modalManager.open({
          template: require('../template/updateUserAccount.html'),
          controller: 'updateUserAccountController',
          windowClass: 'update-user-modal',
          resolve: {
            dataModel: () => {
              return {
                user: event.data
              };
            }
          }
        })
        .result.then((data) => {
          if (data && !data.canceled) {
            this.di.accountDataManager.createUser(data.result)
            .then(() => {
              this.scope.alert = {
                type: 'success',
                msg: this.translate('MODULE.ACCOUNT.UPDATE.SUCCESS')
              }
              this.di.notificationService.render(this.scope);
              this.scope.accountModel.api.queryUpdate();
            }, (msg) => {
              this.scope.alert = {
                type: 'warning',
                msg: msg
              }
              this.di.notificationService.render(this.scope);
            });
          }
        });
      }
      else if (event.action.value === 'delete') {
        this.di.dialogService.createDialog('warning', this.translate('MODULE.ACCOUNT.DIALOG.CONTENT.DELETE_ACCOUNT'))
        .then(() => {
          this.di.accountDataManager.deleteUser(event.data.user_name)
          .then(() => {
            this.scope.alert = {
              type: 'success',
              msg: this.translate('MODULES.LOGICAL.EGP.TAB.GROUP.DELETE.SUCCESS')
            }
            this.di.notificationService.render(this.scope);
          }, (msg) => {
            this.scope.alert = {
              type: 'warning',
              msg: msg
            }
            this.di.notificationService.render(this.scope);
          })
          .finally(() => {
            this.scope.accountModel.api.queryUpdate();
          });;
        }, () => {
          this.di.$log.debug('delete EGP group dialog cancel');
        });
      }
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
      this.di.modalManager.open({
          template: require('../template/createUserAccount.html'),
          controller: 'createUserAccountController',
          windowClass: 'create-user-account-modal',
        })
        .result.then((data) => {
        if (data && !data.canceled) {
          this.di.accountDataManager.createUser(data.result)
            .then(() => {
              this.scope.alert = {
                type: 'success',
                msg: this.translate('MODULE.ACCOUNT.CREATE.SUCCESS')
              }
              this.di.notificationService.render(this.scope);
              this.scope.accountModel.api.queryUpdate();
            }, (msg) => {
              this.scope.alert = {
                type: 'warning',
                msg: msg
              }
              this.di.notificationService.render(this.scope);
            });
        }
      });
    };

    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULE.ACCOUNT.DIALOG.CONTENT.BATCH_DELETE_ACCOUNT'))
          .then((data) =>{
            this.batchDeleteUserAccounts($value);
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
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.di.$scope.role
          }
        };
      }
    });
  }

  batchDeleteUserAccounts(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      this.di.accountDataManager.deleteUser(item.user_name)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.ACCOUNT.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.accountModel.api.queryUpdate();
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
      this.scope.accountModel.api.queryUpdate();
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