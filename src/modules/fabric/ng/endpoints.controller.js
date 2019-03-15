export class EndPointController {
  static getDI() {
    return [
      '$scope',
      '$rootScope',
      '$q',
      '$filter',
      '$log',
      '_',
      'roleService',
      'deviceService',
      'dialogService',
      'notificationService',
      'deviceDataManager',
      'logicalDataManager',
      'intentDataManager',
      'modalManager',
      'tableProviderFactory'
    ];
  }

  constructor(...args){
    this.di = {};
    EndPointController.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.scope = this.di.$scope;
    this.translate = this.di.$filter('translate');
    this.scope.page_title = this.translate('MODULES.SWITCHES.TAB.SCHEMA.ENDPOINT');
    this.scope.deviceObjects = {}; //id: name
    this.scope.role = this.di.roleService.getRole();
    this.scope.entities = [];
    this.scope.endpointModel = {
      actionsShow: this.di.deviceService.getEndpointActionsShow(),
      rowActions: this.di.deviceService.getEndpointTableRowActions(),
      endpointProvider: null,
      API: null
    };

    this.scope.onTableRowClick = (event) => {
      if (event.$data){
        this.scope.endpointModel.API.setSelectedRow(event.$data.mac);
      }
    };

    this.scope.onEndpointApiReady = ($api) => {
      this.scope.endpointModel.API = $api;
    };
    
    this.scope.onTableRowSelectAction = (event) => {
      if (!event.action) return;
      if (event.action.value === 'intent') {
        if (this.scope.entities.length < 2) {
          this.scope.alert = {
            type: 'warning',
            msg: this.translate('MODULES.INTENT.CREATE.RESOURCE.INVALID')
          }
          this.di.notificationService.render(this.scope);
          return;
        }
        this.di.modalManager.open({
          template: require('../components/createIntent/template/createIntent.html'),
          controller: 'createIntentCtrl',
          windowClass: 'create-intent-modal',
          resolve: {
            dataModel: () => {
              return {
                srcHost: event.data,
                endpoints: this.scope.entities,
                from: 'endpoint'
              };
            }
          }
        })
        .result.then((data) => {
          if (data && !data.canceled) {
            this.di.intentDataManager.createIntent(data.result).then(
              () => {
                this.scope.alert = {
                  type: 'success',
                  msg: this.translate('MODULES.INTENT.CREATE.SUCCESS')
                }
                this.di.notificationService.render(this.scope);
              },
              (msg) => {
                this.scope.alert = {
                  type: 'warning',
                  msg: msg
                }
                this.di.notificationService.render(this.scope);
              }
            )
          }
        });
      }
      else if (event.action.value === 'delete') {
        let params = {
          'tenant': event.data.tenant_name,
          'segment': event.data.segment_name,
          'mac': event.data.mac
        };
        this.di.deviceDataManager.deleteEndpoint(params).then(
          () => {
            this.scope.alert = {
              type: 'success',
              msg: this.translate('MODULES.ENDPOINT.DELETE.SUCCESS')
            }
            this.di.notificationService.render(this.scope);
            this.scope.endpointModel.API.queryUpdate();
          },
          (msg) => {
            this.scope.alert = {
              type: 'warning',
              msg: msg
            }
            this.di.notificationService.render(this.scope);
          }
        );
      }
    };

    this.scope.batchRemove = ($value) => {
      if ($value.length) {
        this.di.dialogService.createDialog('warning', this.translate('MODULES.ENDPOINT.DIALOG.CONTENT.BATCH_DELETE'))
          .then(() =>{
            this.batchDeleteEndpoints($value);
          }, () =>{
            this.di.$log.debug('delete switch dialog cancel');
        });
      }    
    };

    this.scope.addEndpoint = () => {
     /* let devices = [];
      this.di._.forEach(this.scope.deviceObjects, (value, key) => {
        devices.push({'label': value, 'value': key});
      });*/
      if (Object.keys(this.scope.deviceObjects).length === 0) {
        this.scope.alert = {
          type: 'warning',
          msg: this.translate('MODULES.ENDPOINT.CREATE.WARNING.NO_DEVICE')
        }
        this.di.notificationService.render(this.scope);
        return;
      }
      this.getSegmentsAndDevicesInfo().then((result) => {
        let segmentArr = [];
        for(let key in result.segments) {
          segmentArr.push({
            'label': key,
            'value': result.segments[key]
          });
        } 
        this.di.modalManager.open({
          template: require('../components/createEndpoint/template/createEndpoint.html'),
          controller: 'createEndpointCtrl',
          windowClass: 'create-endpoint-modal',
          resolve: {
            dataModel: () => {
              return {
                devices: this.scope.deviceObjects,
                segments: segmentArr,
                locations: result.locations
              };
            }
          }
        })
        .result.then((data) => {
          if (data && !data.canceled) {
            this.di.deviceDataManager.createEndpoint(data.result).then(
              () => {
                this.scope.alert = {
                  type: 'success',
                  msg: this.translate('MODULES.ENDPOINT.CREATE.SUCCESS')
                }
                this.di.notificationService.render(this.scope);
                this.scope.endpointModel.API.queryUpdate();
              },
              (msg) => {
                this.scope.alert = {
                  type: 'warning',
                  msg: msg
                }
                this.di.notificationService.render(this.scope);
              }
            )
          }
        });
      }, (msg) => {
        this.scope.alert = {
          type: 'warning',
          msg: msg
        }
        this.di.notificationService.render(this.scope);
      });
    };

    this.init();

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('intent-list-refresh', (event) => {
      this.scope.endpointModel.API.queryUpdate();
    }));

    this.scope.$on('$destroy', () => {
      unsubscribers.forEach((cb) => {
        cb();
      });
    });
  }

  init() {
    this.scope.endpointModel.endpointProvider = this.di.tableProviderFactory.createProvider({
      query: (params) => {
        let defer = this.di.$q.defer();
        this.scope.deviceObjects = {};
        this.di.deviceDataManager.getDeviceConfigs().then((devices)=> {
          if (devices) {
            devices.forEach((device) => {
              this.scope.deviceObjects[device.id] = device.name;
            });
          }
          this.di.deviceDataManager.getEndpoints(params).then((res) => {
            this.scope.entities = this.getEntities(res.data.hosts);
            defer.resolve({
              data: this.scope.entities,
              count: res.data.total
            });
          });
        });
        return defer.promise;
      },
      getSchema: () => {
        return {
          schema: this.di.deviceService.getEndpointTableSchema(),
          index_name: 'mac',
          rowCheckboxSupport: true,
          rowActionsSupport: true,
          authManage: {
            support: true,
            currentRole: this.scope.role
          }
        };
      }
    });
  }

  getEntities(origins) {
    let entities = [];
    if(!Array.isArray(origins)) return entities;
    origins.forEach((endpoint) => {
      let obj = {};
      obj.id = endpoint.id;
      obj.mac = endpoint.mac;
      obj.tenant_name = endpoint.tenant;
      obj.segment_name = endpoint.segment || endpoint.vlan;
      obj.ip = (endpoint.ip_addresses && endpoint.ip_addresses.join(" | ")) 
              || (endpoint.ipAddresses && endpoint.ipAddresses.join(" | "));
      let locals = [];
      endpoint.locations.forEach((location) => {
        let device_name = (location.device_id && this.scope.deviceObjects[location.device_id]) 
                        || (location.elementId && this.scope.deviceObjects[location.elementId]);
        locals.push(device_name + '/' + location.port);
      });
      obj.location = locals.join(" | ");
        entities.push(obj);
    });
    return entities;
  }

  batchDeleteEndpoints(arr) {
    let deferredArr = [];
    arr.forEach((item) => {
      let defer = this.di.$q.defer();
      let params = {
        'tenant': item.tenant_name,
        'segment': item.segment_name,
        'mac': item.mac
      };
      this.di.deviceDataManager.deleteEndpoint(params)
        .then(() => {
          defer.resolve();
        }, (msg) => {
          defer.reject(msg);
        });
      deferredArr.push(defer.promise);
    });

    this.di.$q.all(deferredArr).then(() => {
      this.scope.alert = {
        type: 'success',
        msg: this.translate('MODULES.ENDPOINT.BATCH.DELETE.SUCCESS')
      }
      this.di.notificationService.render(this.scope);
      this.scope.endpointModel.API.queryUpdate();
    }, (msg) => {
      this.scope.alert = {
        type: 'warning',
        msg: msg
      }
      this.di.notificationService.render(this.scope);
    });
  }

  getSegmentsAndDevicesInfo() {
    let resultDefer = this.di.$q.defer(), segmentDefer = this.di.$q.defer();
    this.di.logicalDataManager.getSegments().then((res) => {
      let data = res.data.segments.filter((segment) => {
        return segment.segment_type === 'vlan';
      });
      data.length === 0 ? segmentDefer.reject() : segmentDefer.resolve(data);
    });

    segmentDefer.promise.then((result) => {
      let deferArr = [];
      result.forEach((segment) => {
        let defer = this.di.$q.defer();
        this.di.logicalDataManager.getSegmentVlanMember(segment.tenant_name, segment.segment_name)
        .then((res) => {
          let members = res.data.segment_members.filter((member) => {
            return member.hasOwnProperty('ports');
          })
          members.forEach((member) => {
            member['tenant_name'] = segment.tenant_name;
            member['segment_name'] = segment.segment_name;
          });
          defer.resolve(members);
        });
        deferArr.push(defer.promise);
      });
      this.di.$q.all(deferArr).then((arr) => {
        let segments = {}, switchPorts = {};
        arr.forEach((item) => {
          item.forEach((segment) => {
            let label = segment.tenant_name + '/' + segment.segment_name;
            if (!segments.hasOwnProperty(label)) {
              segments[label] = {
                'tenant': segment.tenant_name,
                'segment': segment.segment_name
              }
            }
            if (!switchPorts.hasOwnProperty(label)) {
              switchPorts[label] = {};
            }
            if (!switchPorts[label].hasOwnProperty(segment.device_id)) {
              switchPorts[label][segment.device_id] = segment.ports.map((port) => {
                return port.split('/')[0];
              });
            }
          });
        });
        Object.keys(switchPorts).length === 0 ? resultDefer.reject(this.translate('MODULES.ENDPOINT.CREATE.WARNING.NO_SEGMENT_PORTS')) :
          resultDefer.resolve({'segments': segments, 'locations': switchPorts});
      });
    }, () => {
      resultDefer.reject(this.translate('MODULES.ENDPOINT.CREATE.WARNING.NO_SEGMENT'));
    });
    return resultDefer.promise;
  }
}

EndPointController.$inject = EndPointController.getDI();
EndPointController.$$ngIsClass = true;