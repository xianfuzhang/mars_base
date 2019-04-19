export class Language{
	static getDI() {
		return [
			'$translate',
			'localStoreService'
		];
	}
	constructor(...args) {
		this.di = {};
		Language.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/language');
    this.link = (...args) => this._link.apply(this, args);
	}

	_link(scope, element, attr) {
		const CONST_LOCAL_STORAGE_KEY = 'userPrefs__', 
					CONST_LANGUAGE = 'language', 
					LANGUAGE_CN = 'cn', LANGUAGE_EN = 'en';

		let storage = this.di.localStoreService.getSyncStorage(CONST_LOCAL_STORAGE_KEY);
		scope.selection = storage.get(CONST_LANGUAGE) || LANGUAGE_CN;

		scope.setLanguage = () => {
      if (scope.selection === LANGUAGE_EN) {
        this.di.$translate.use(LANGUAGE_CN);
        storage.set(CONST_LANGUAGE, LANGUAGE_CN);
      } else {
        this.di.$translate.use(LANGUAGE_EN);
        storage.set(CONST_LANGUAGE, LANGUAGE_EN);
      }
      scope.selection = storage.get(CONST_LANGUAGE) || LANGUAGE_CN;
    };
	}
}
Language.$inject = Language.getDI();
Language.$$ngIsClass = true;