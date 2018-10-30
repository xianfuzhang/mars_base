/**
 * Created by wls on 2018/8/7.
 */
export class ConfigurationDataManager{

  static getDI(){
    return [
      '$q',
      '$http',
      'appService'
    ];
  }

  constructor(...args){
    this.di = {};
    ConfigurationDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getConfiguration(subjectClass, subject){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getConfigurationUrl(subjectClass, subject)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {}});
      }
    );
    return defer.promise;
    // return this.getConfigurationByFileName(this.di.appService.CONST.DEFAULT_FILENAME)
  }

  updateConfiguration(subjectClass, subject, value){
    // let defer = this.di.$q.defer();
    // this.di.$http.post(this.di.appService.getConfigurationUrl(subjectClass, subject), value).then(
    //   (res) => {
    //     defer.resolve(res);
    //   },
    //   (error) => {
    //     defer.reject({'error': error});
    //   }
    // );
    // return defer.promise;
    return this.setConfigurationFile(this.di.appService.CONST.DEFAULT_FILENAME, value)
  }

  deleteConfiguration(subjectClass, subject){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getConfigurationUrl(subjectClass, subject)).then(
      (res) => {
        // defer.resolve(res);
      },
      (error) => {
        // defer.resolve({'data': {'devices': []}});
      }
    );
    return defer.promise;
  }


  getConfigurationFileList(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getConfigurationFileListUrl()).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.resolve({'data': []});
      }
    );
    return defer.promise;
  }

  getConfigurationByFileName(filename){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getConfigurationFileUrl(filename)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {}});
      }
    );
    return defer.promise;
  }

  setConfigurationFile(filename, config){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getConfigurationFileUrl(filename), config).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;

  }
  
  getConfigurationHistory(params){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getConfigurationHistoryUrl(), {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'configs': [], 'count':0}});
      }
    );
    return defer.promise;
  }
  
  getConfigurationHistoryFiles(params) {
    let defer = this.di.$q.defer();
    let url = this.di.appService.getConfigurationHistoryFilesUrl();
  
    this.di.$http.get(url, {'params': params}).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({'data': {'files': [], 'total': 0}});
      }
    );
  
    return defer.promise;
  }
}

ConfigurationDataManager.$inject = ConfigurationDataManager.getDI();
ConfigurationDataManager.$$ngIsClass = true;