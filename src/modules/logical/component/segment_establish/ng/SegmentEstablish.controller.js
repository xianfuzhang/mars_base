/**
 * Created by wls on 2018/6/7.
 */

export class SegmentEstablishController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$timeout',
      '$filter',
      '_',
      'logicalDataManager',
    ];
  }

  constructor(...args) {
    this.di = {};
    SegmentEstablishController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });

    let unsubscribes = [];
    const scope = this.di.$scope;
    const logicalDataManager = this.di.logicalDataManager;
    const rootScope = this.di.$rootScope;
    const translate = this.di.$filter('translate');

    // regex expression
    scope.ip_regex = '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$';
    scope.num_regex = '^\d$|^[1-9]+[0-9]*$';
  
    // wizard params
    scope.showWizard = false;
    scope.title = '添加Segment';
    scope.steps = [
      {
        id: 'step1',
        title: '',
        content: require('../template/segment_establish.html')
      }
    ];
  
    scope.tenantNameDisLab = {
      options: [
        {
          label: '——请选择——',
          value: ''
        }
      ]
    };
    
    let initSegment = {
      selectedTenant: {},
      name: '',
      type: 'vlan',
      ip_address: '',
      ip_addresses: [],
      value: ''
    }
  
    const init = () => {
      // init group
      scope.segmentModel = this.di._.cloneDeep(initSegment)
    }
  
    init();
  
    let inValidJson = {
      valid: false,
      errorMessage: ''
    };
  
    let validJson = {
      valid: true,
      errorMessage: ''
    };
    
    scope.open = (tenantName, segmentName) => {
      if(scope.showWizard) return;
  
      init();
      
      scope.defaultTenant = tenantName ? tenantName : '';
      logicalDataManager.getTenants().then(
        (res) => {
          scope.tenantNameDisLab.options = [];
          res.data.tenants.forEach((tenant) => {
            let option = {
              label: tenant.name,
              value: tenant.name
            }
            scope.tenantNameDisLab.options.push(option)
            
            if(scope.defaultTenant == tenant.name) {
              scope.segmentModel.selectedTenant = option;
            }
          });
          
          if(!scope.segmentModel.selectedTenant.value) {
            scope.segmentModel.selectedTenant = scope.tenantNameDisLab.options[0]
          }
        },
        (error) => {
          console.error(error)
        })
      
      if(segmentName) {
        logicalDataManager.getSegment(tenantName, segmentName).then(
          (res) => {
            let segment = res.data;
            scope.segmentModel.name = segment.name;
            scope.segmentModel.type = segment.type;
            scope.segmentModel.value = segment.value;
            scope.segmentModel.ip_addresses = segment.ip_address;
            scope.segmentModel.ip_address = segment.ip_address[segment.ip_address.length - 1]
          }, (error) => {
          console.error(error)
        })
      }
      
      this.di.$timeout(() => {
        scope.showWizard = true;
      });
    };
  
    scope.addIPAddress = () => {
      let regexp = new RegExp(scope.ip_regex)
      
      if(!regexp.test(scope.segmentModel.ip_address)
        || scope.segmentModel.ip_addresses.indexOf(scope.segmentModel.ip_address) > -1)
        return;
    
      scope.segmentModel.ip_addresses.push(scope.segmentModel.ip_address);
    }
  
    scope.removeSelectedIP = (ip) => {
      let index = scope.segmentModel.ip_addresses.indexOf(ip);
      if(index > -1) {
        scope.segmentModel.ip_addresses.splice(index, 1);
      }
      
      const length = scope.segmentModel.ip_addresses.length;
      if(length == 0) {
        scope.segmentModel.ip_address = '';
      } else {
        scope.segmentModel.ip_address = scope.segmentModel.ip_addresses[length - 1];
      }
    }
    
    scope.cancel = function(){
      return new Promise((resolve, reject) => {
        resolve({valid: true, errorMessage: ''});
      });
    };

    scope.submit = function() {
      let params = {};
      params.name = scope.segmentModel.name;
      params.type = scope.segmentModel.type;
      params.value = scope.segmentModel.value;
      params.ip_address = scope.segmentModel.ip_addresses.length ? scope.segmentModel.ip_addresses : [scope.segmentModel.ip_address];

      return new Promise((resolve, reject) => {
        logicalDataManager.postSegment(scope.segmentModel.selectedTenant.value, params)
          .then(() => {
            init()
            rootScope.$emit('segment-list-refresh');
            resolve({valid: true, errorMessage: ''});
          }, (err) => {
            // scope.switch = _.cloneDeep(initSwitch);
            resolve({valid: false, errorMessage: err});
          });
      });
    };
  
    unsubscribes.push(this.di.$rootScope.$on('segment-wizard-show', ($event, tenantName, segmentName) => {
      scope.open(tenantName, segmentName);
    }));

    scope.$on('$destroy', () => {
      unsubscribes.forEach((cb) => {
        cb();
      })
    })
  }
  
}

SegmentEstablishController.$inject = SegmentEstablishController.getDI();
SegmentEstablishController.$$ngIsClass = true;