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
    this.defer = this.di.$q.defer();
    this.nocsysApps = [];
    this.appsState = {};

    this.di.manageDataManager.getAllApplications().then((res) => {
      this.nocsysApps = res.data.applications;
      this.nocsysApps.forEach((app) => {
        this.appsState[app.name] = app.state;
      });
      this.defer.resolve();
    }, () => {
      this.nocsysApps = [];
      this.appsState = {};
      this.defer.resolve();
    });
  }

  getNocsysAppsState() {
    return this.defer.promise;
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