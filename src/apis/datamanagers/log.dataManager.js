export class LogDataManager {
  static getDI() {
    return [
      '$q',
      '$http',
      'appService'
    ];
  }
  constructor(...args){
    this.di = {};
    LogDataManager.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
  }

  getLogs(params) {
    let defer = this.di.$q.defer();
    // this.di.$http.get(this.di.appService.getLogsUrl(), {'params': params}).then(
    //   (res) => {
    //     defer.resolve(res);
    //   },
    //   (error) => {
    //     defer.resolve({'data': {'devices': [], 'total': 0}});
    //   }
    // );
    
    setTimeout(() => {
      defer.resolve(
        {logs:
          [
            {
              'type': 'INFO ',
              'level': 'FelixStartLevel',
              'operation': 'fileinstall',
              'creator': '7 - org.apache.felix.fileinstall - 3.5.2',
              'content': 'Creating configuration from org.apache.karaf.command.acl.jaas.cfg',
              'created_time': '2018-07-19 15:10:21,110',
            }, {
              'type': 'INFO ',
              'level': 'FelixStartLevel',
              'operation': 'fileinstall',
              'creator': '7 - org.apache.felix.fileinstall - 3.5.2',
              'content': 'Creating configuration from org.ops4j.pax.url.mvn.cfg',
              'created_time': '2018-07-19 15:10:21,116',
            }, {
              'type': 'INFO ',
              'level': 'FelixStartLevel',
              'operation': 'fileinstall',
              'creator': '7 - org.apache.felix.fileinstall - 3.5.2',
              'content': 'Creating configuration from org.apache.felix.fileinstall-deploy.cfg',
              'created_time': '2018-07-19 15:10:21,121',
            }, {
              'type': 'INFO ',
              'level': 'FelixStartLevel',
              'operation': 'fileinstall',
              'creator': '7 - org.apache.felix.fileinstall - 3.5.2',
              'content': 'Creating configuration from jmx.acl.org.apache.karaf.bundle.cfg',
              'created_time': '2018-07-19 15:10:21,134',
            }, {
              'type': 'INFO ',
              'level': 'FelixStartLevel',
              'operation': 'fileinstall',
              'creator': '7 - org.apache.felix.fileinstall - 3.5.2',
              'content': 'Creating configuration from org.apache.karaf.webconsole.cfg',
              'created_time': '2018-07-19 15:10:21,139',
            }, {
              'type': 'INFO ',
              'level': 'FelixStartLevel',
              'operation': 'fileinstall',
              'creator': '7 - org.apache.felix.fileinstall - 3.5.2',
              'content': 'Creating configuration from org.ops4j.pax.url.mvn.Creating configuration from org.apache.karaf.features.cfg',
              'created_time': '2018-07-19 15:10:21,145',
            }
          ]
        });
    }, 1000);
    
    return defer.promise;
  }
}

LogDataManager.$inject = LogDataManager.getDI();
LogDataManager.$$ngIsClass = true;