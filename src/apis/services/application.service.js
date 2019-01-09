export class applicationService {
  static getDI() {
    return [
      '$q',
      'appService',
      'manageDataManager'
    ];
  }

  constructor(...args) {
    this.di = {};
    applicationService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.nocsysApps = [];
    this.appsState = {};
  }

  getNocsysAppsState() {
    let defer = this.di.$q.defer();
    if (this.nocsysApps.length) {
      defer.resolve();
    }
    else {
      this.di.manageDataManager.getAllApplications().then((res) => {
        let apps = res.data.applications;
        let reg = new RegExp(this.di.appService.CONST.NOCSYS_APP, 'i');
        this.nocsysApps = apps.filter((app) => {
          return reg.test(app.name);
        });
        this.nocsysApps.forEach((app) => {
          this.appsState[app.name] = app.state;
        });
        defer.resolve();
      }, () => {
        this.nocsysApps = [];
        this.appsState = {};
        defer.resolve();
      });  
    }
    return defer.promise;
  }

  getNocsysApps() {
    return this.nocsysApps;
  }

  getAppsState() {
    return this.appsState;
  }

  updateNocsysAppState(app_name, state) {
    this.appsState[app_name] = state;
  }
}

applicationService.$inject = applicationService.getDI();
applicationService.$$ngIsClass = true;