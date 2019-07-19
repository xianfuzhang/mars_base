/**
 * Created by wls on 2018/7/17.
 */
export class functionService {
  static getDI() {
    return [
      '$location',
      '$filter',
      '_'
    ];
  }

  constructor(...args) {
    this.di = {};
    functionService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    });
    this.translate = this.di.$filter('translate');
  }


  getPoeDeviceTableSchema(){
    return [
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.DEVICE_NAME'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      // 需要时放开
      // {
      //   'label': 'group',
      //   'field': 'group',
      //   'layout': {'visible': true, 'sortable': true, 'fixed': true}
      // },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.POWER'),
        'field': 'power',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.OPER_STATUS'),
        'field': 'operStatus',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.CONSUMPTION_POWER'),
        'field': 'consumptionPower',
        'layout': {'visible': true, 'sortable': true,}
      },
      {
        'label':  this.translate('MODULES.FUNCTIONS.POE.COLUMN.THRESHOLD'),
        'field': 'threshold',
        'layout': {'visible': true, 'sortable': true,}
      },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.NOTIFY_CTRL'),
        'field': 'notifyCtrl',
        'layout': {'visible': true, 'sortable': true,}
      },
      // 需要时放开
      // {
      //   'label': 'dllPowerType',
      //   'field': 'dllPowerType',
      //   'layout': {'visible': true, 'sortable': true,}
      // },
      // {
      //   'label': 'dllPowerSource',
      //   'field': 'dllPowerSource',
      //   'layout': {'visible': true, 'sortable': true,}
      // }
    ];
  }

  getPoePortTableSchema(){
    // 需要时放开
    return [
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.DEVICE_NAME'),
        'field': 'device_name',
        'layout': {'visible': true, 'sortable': true, 'fixed': true},
      },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.DEVICE_PORT'),
        'field': 'port',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      // {
      //   'label': 'group',
      //   'field': 'group',
      //   'layout': {'visible': true, 'sortable': true, 'fixed': true}
      // },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.STATUS'),
        'field': 'status',
        'layout': {'visible': true, 'sortable': true, 'fixed': true}
      },
      // {
      //   'label': 'powerPairsControlAbility',
      //   'field': 'powerPairsControlAbility',
      //   'layout': {'visible': true, 'sortable': true,}
      // },
      // {
      //   'label': 'powerPairs',
      //   'field': 'powerPairs',
      //   'layout': {'visible': true, 'sortable': true,}
      // },
      // {
      //   'label': 'detectionStatus',
      //   'field': 'detectionStatus',
      //   'layout': {'visible': true, 'sortable': true,}
      // },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.PRIORITY'),
        'field': 'priority',
        'layout': {'visible': true, 'sortable': true,}
      },
      // {
      //   'label': 'mpsAbsentCounter',
      //   'field': 'mpsAbsentCounter',
      //   'layout': {'visible': true, 'sortable': true,}
      // },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.POWER_CLASSIFICATIONS'),
        'field': 'powerClassifications',
        'layout': {'visible': true, 'sortable': true,}
      },
      // {
      //   'label': 'mirroredDllPdReqPower',
      //   'field': 'mirroredDllPdReqPower',
      //   'layout': {'visible': true, 'sortable': true,}
      // },
      // {
      //   'label': 'dllPseAllocatePower',
      //   'field': 'dllPseAllocatePower',
      //   'layout': {'visible': true, 'sortable': true,}
      // },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.MAX_POWER'),
        'field': 'maxPower',
        'layout': {'visible': true, 'sortable': true,}
      },
      {
        'label':  this.translate('MODULES.FUNCTIONS.POE.COLUMN.USED_POWER'),
        'field': 'usedPower',
        'layout': {'visible': true, 'sortable': true,}
      },
      {
        'label': this.translate('MODULES.FUNCTIONS.POE.COLUMN.TIME_RANGE'),
        'field': 'timeRange',
        'layout': {'visible': true, 'sortable': true,}
      },
      // {
      //   'label': 'timeRangeActive',
      //   'field': 'timeRangeActive',
      //   'layout': {'visible': true, 'sortable': true,}
      // }
    ];
  }

  getPoeActionsShow(){
    return {
      'menu': {'enable': false, 'role': 1},
      'add': {'enable': false, 'role': 2},
      'remove': {'enable': false, 'role': 2},
      'refresh': {'enable': true, 'role': 1},
      'search': {'enable': true, 'role': 2}
    };
  }

  getSwitchPoeTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.FABRIC.STORM.ROW.ACTION.EDIT'),
        'role': 2,
        'value': 'edit'
      }
    ];
  }

  getSwitchPortPoeTableRowActions() {
    return [
      {
        'label': this.translate('MODULES.FABRIC.STORM.ROW.ACTION.EDIT'),
        'role': 2,
        'value': 'edit'
      }
    ];
  }
  //
  //
  // getHcTypeSwtDisLabel(){
  //   return {
  //     options: [
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.CPU'), value: 'cpu'},
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.MEM'), value: 'ram'},
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.DISK'), value: 'disk'},
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.RX'), value: 'rx'},
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.TX'), value: 'tx'}
  //     ], hint : this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.TYPE')
  //   }
  // }
  //
  // getHcTypeCtrlDisLabel(){
  //   return {
  //     options: [
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.CPU'), value: 'cpu'},
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.MEM'), value: 'ram'},
  //       {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.TYPE.DISK'), value: 'disk'},
  //     ], hint : this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.TYPE')
  //   }
  // }
  //
  // getHcLevelDisLabel(){
  //   return {options: [
  //             {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.LEVEL.HIGHT'), value: 1},
  //             {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.LEVEL.LOW'), value: 0}
  //           ], hint: this.translate('MODULES.ALERT.HEALTHY_CHECK.TABLE.ALERT_LEVEL')}
  // }
  //
  // getHcConditionDisLabel(){
  //   return {options: [
  //             {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.QUERY.GT'), value: 'gt'} ,
  //             {label: this.translate('MODULES.ALERT.HEALTHY_CHECK.QUERY.LT'), value: 'lt'}],
  //           hint: this.translate('MODULES.ALERT.HEALTHY_CHECK.CONDITION')}
  // }
  //
  // getHcStatusDisLabel(){
  //   return {on: this.translate('MODULES.ALERT.HEALTHY_CHECK.STATUS.ENABLED'), off: this.translate('MODULES.ALERT.HEALTHY_CHECK.STATUS.DISABLED')}
  // }


}


functionService.$inject = functionService.getDI();
functionService.$$ngIsClass = true;