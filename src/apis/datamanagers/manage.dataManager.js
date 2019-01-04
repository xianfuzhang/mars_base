/**
 * Created by wls on 2018/8/7.
 */
export class ManageDataManager{

  static getDI(){
    return [
      '$q',
      '$http',
      'appService',
      '$log'
    ];
  }

  constructor(...args){
    this.di = {};
    ManageDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getDHCP(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDhcpUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  postDHCP(param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDhcpPostUrl(), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteDHCP(){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDhcpUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getMacAndIpBindings() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDHCPServerUrl(true)).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getV6MacAndIpBindings() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDHCPV6ServerMappingUrl()).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  postMacAndIpBindings(param) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDHCPServerUrl(true),param).then(
      (res) => {
        defer.resolve(res.data);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteMacAndIpBindings(mac) {
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getDHCPServerMappingRemoveUrl(mac)).then(
      (res) => {
        defer.resolve({});
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }




  getDHCPV6(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getDhcpV6Url()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  postDHCPV6(param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getDhcpV6PostUrl(), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getNTP(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getNtpUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  putNTP(param){
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getNtpUrl(), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        this.di.$log.error(error);
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getElasticsearchDataByIndexAndQuery(index, param){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getElasticsearchDataIndexUrl(index), param).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve(error);
      }
    );
    return defer.promise;
  }
  
  getElasticsearcStatus() {
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getElasticsearchStatusUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve({data: {indices: [], nodes:[], snapshots:[]}});
      }
    );
    return defer.promise;
  }
  
  deleteElasticsearcIndexByTime(index, params) {
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getElasticsearchDeleteIndexUrl(index), params).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
  
  putBackupElasticsearch(filename) {
    let defer = this.di.$q.defer();
    this.di.$http.put(this.di.appService.getElasticsearchBackupUrl(filename)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.resolve(error);
      }
    );
    return defer.promise;
  }
  
  generateElasticsearchCSVFile(indice, query) {
    let defer = this.di.$q.defer();
    if(query) {
      this.di.$http.post(this.di.appService.getElasticsearchCSVFileUrl(indice, true), query).then(
        (res) => {
          defer.resolve(res);
        },
        (error) => {
          defer.reject(error);
        }
      );
    } else {
      this.di.$http.get(this.di.appService.getElasticsearchCSVFileUrl(indice)).then(
        (res) => {
          defer.resolve(res);
        },
        (error) => {
          defer.reject(error);
        }
      );
    }
    return defer.promise;
  }
  
  getElasticsearchCSVFile() {
    let defer = this.di.$q.defer();
    
    this.di.$http.get(this.di.appService.getElasticsearchCSVFileUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
  
  getSystemInfo(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getSystemVersionUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }


  getAllApplications(){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getApplicationUrl()).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  getApplication(app_name){
    let defer = this.di.$q.defer();
    this.di.$http.get(this.di.appService.getApplicationByNameUrl(app_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  activeApplication(app_name){
    let defer = this.di.$q.defer();
    this.di.$http.post(this.di.appService.getApplicationActionUrl(app_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deActiveApplication(app_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getApplicationActionUrl(app_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  deleteApplication(app_name){
    let defer = this.di.$q.defer();
    this.di.$http.delete(this.di.appService.getApplicationByNameUrl(app_name)).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }

  postApplication(activate, file){
    let defer = this.di.$q.defer();
    var form = new FormData();
    form.append('file', file);

    this.di.$http({
      url: 'http://localhost/mars/v1/applications?activate=' + activate,
      method: 'POST',
      headers: {'Content-Type': 'application/octet-stream'},
      data: new Uint8Array(file),
      transformRequest: []
    }).then(
      (res) => {
        defer.resolve(res);
      },
      (error) => {
        defer.reject(error);
      }
    );
    return defer.promise;
  }
	
	getLicense(){
		let defer = this.di.$q.defer();
		this.di.$http.get(this.di.appService.getLicenseUrl()).then(
			(res) => {
				defer.resolve(res);
			},
			(error) => {
				defer.reject(error);
			}
		);
		return defer.promise;
	}
	
	postLicense(file){
		let defer = this.di.$q.defer();
		const form = new FormData();
		form.append('file', file);
		
		let url = this.di.appService.getLicenseUploadUrl();
		this.di.$http({
			url: url,
			method: 'POST',
			// headers: {'Content-Type': 'application/raw'},
			data: new Uint8Array(file),
			transformRequest: []
		}).then(
			(res) => {
				defer.resolve(res);
			},
			(error) => {
				defer.reject(error);
			}
		);
		return defer.promise;
	}

}

ManageDataManager.$inject = ManageDataManager.getDI();
ManageDataManager.$$ngIsClass = true;