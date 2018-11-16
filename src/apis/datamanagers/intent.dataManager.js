export class IntentDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
	}
	constructor(...args) {
		this.di = {};
    IntentDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
	}

	getIntents(params) {
		let defer = this.di.$q.defer();
    
    this.di.$http.get(this.di.appService.getIntentsConfigUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'intents': [], 'count': 0}});
      }
    );
    return defer.promise;
	}

	createIntent(params) {
		let defer = this.di.$q.defer();
    
    this.di.$http.post(this.di.appService.getIntentsUrl(), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error.data.message);
      }
    );
    return defer.promise;

	}

	deleteIntent(appId, key) {
		let defer = this.di.$q.defer();
    
    this.di.$http.delete(this.di.appService.getDeleteIntentUrl(appId, key)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(eror.data.message);
      }
    );
    return defer.promise;
	}
}
IntentDataManager.$inject = IntentDataManager.getDI();
IntentDataManager.$$ngIsClass = true;