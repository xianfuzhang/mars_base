export class tableProvider {
  static getDI () {
    return [
      '$q',
      'spec'
    ];
  }

  static instance (...args) {
    return new tableProvider(args);
  }

  constructor (...args) {
    this.di = [];
    tableProvider.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    let readyDefer = this.di.$q ? this.di.$q.defer() : {};
    let spec = this.di.spec;

    /*this.init = () => {
      spec.init().then(
        function (params) {
          readyDefer.resolve(params);
        },
        function (params) {
          readyDefer.reject(params);
        }
      );
    };*/

    /*this.ready = () => {
      return readyDefer.promise;
    };*/

    this.query = (params) => {
      return spec.query(params);
    };

    /*this.getFilterDict = () => {
      return spec.getFilterDict ? spec.getFilterDict() || {} : {};
    };*/

    this.getSchema = () => {
      return spec.getSchema();
    };

   /* this.getLayout = () => {
      return spec.getLayout ? spec.getLayout() : {};
    };*/
  }

  getProvider ($q, spec) {
    return new tableProvider($q, spec);
  };
}

tableProvider.instance.$inject = tableProvider.getDI();
tableProvider.$$ngIsClass = true;
