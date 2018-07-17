export class localStoreService {
  static getDI () {
    return [
      '$q',
      '$window'
    ];
  }

  constructor (...args) {
    this.di = [];
    localStoreService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
  }

  /**
   * @description Local Storage Functionality
   */
  getStorage (ns) {
    ns = ns || '';
    return {
      set: (k, v) => {
        let defer = this.di.$q.defer();
        this.di.$window.localStorage[ns + k] = JSON.stringify(v);
        defer.resolve();
        return defer.promise;
      },
      get: (k) => {
        let defer = this.di.$q.defer();
        let val;
        val = this.di.$window.localStorage[ns + k];
        if (angular.isUndefined(val)) {
          defer.resolve(undefined);
        } else {
          defer.resolve(JSON.parse(this.di.$window.localStorage[ns + k]));
        }
        return defer.promise;
      },
      del: (k) => {
        let defer = this.di.$q.defer();
        delete this.di.$window.localStorage[ns + k];
        defer.resolve();
        return defer.promise;
      }
    };
  }


  getSyncStorage (ns) {
    ns = ns || '';
    return {
      set: (k, v) => {
        this.di.$window.localStorage[ns + k] = JSON.stringify(v);
      },
      get: (k) => {
        let val;
        val = this.di.$window.localStorage[ns + k];
        if (angular.isUndefined(val)) {
          return undefined;
        } else {
          return JSON.parse(this.di.$window.localStorage[ns + k]);
        }
      },
      del: (k) => {
        delete this.di.$window.localStorage[ns + k];
      }
    };
  }


}

localStoreService.$inject = localStoreService.getDI();
localStoreService.$$ngIsClass = true;
