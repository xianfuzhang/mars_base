const router = require('express').Router(),
  cloudLib = require('../lib/cloud'),
  Chance = require('chance'),
  _ = require('lodash');

const chance = new Chance();

router.get('/', function (req, res) {
  let tenants = _.cloneDeep(cloudModel.tenants).map((tenant, index) => {
    return tenant.toJson();
  });

  return res.json({tenants: tenants});
});

router.get('/segments', function(req, res) {
<<<<<<< HEAD
	let segments = _.cloneDeep(cloudModel.segments).map((segment, index) => {
=======
  let segments = _.cloneDeep(cloudModel.segments).map((segment, index) => {
>>>>>>> temp_master
    return segment.toJson();
  });

  return res.json({segments: segments});
});

router.get('/:tenantName/segments', function (req, res) {
<<<<<<< HEAD
	if (!req.params.tenantName) {
    return res.status(404).json('tenant name is required!');
  }
  let segments = _.filter(cloudModel.segments, (segment) =>{
  	return segment.toJson().tenant_name === req.params.tenantName; 
=======
  if (!req.params.tenantName) {
    return res.status(404).json('tenant name is required!');
  }
  let segments = _.filter(cloudModel.segments, (segment) =>{
    return segment.toJson().tenant_name === req.params.tenantName; 
>>>>>>> temp_master
  });

  let arr = [];
  segments.forEach((item) =>{
<<<<<<< HEAD
  	let obj = item.toJson();
  	arr.push({
  		'name': obj.segment_name,
  		'type': obj.segment_type,
  		'ip_address': obj.ip_address,
  		'value': obj.value
  	});
=======
    let obj = item.toJson();
    arr.push({
      'name': obj.segment_name,
      'type': obj.segment_type,
      'ip_address': obj.ip_address,
      'value': obj.value
    });
>>>>>>> temp_master
  })

  return res.json({tenantSegments: arr});
});

router.get('/:tenantName/segments/:segmentName/vlan', function(req, res) {
  if (!req.params.tenantName || !req.params.segmentName) {
    return res.status(404).json('request params is required!');
  }
  let result = mockSegmentVlans();
  return res.json({'segment_members': result});
});

router.get('/:tenantName/segments/:segmentName/vxlan', function(req, res) {
  if (!req.params.tenantName || !req.params.segmentName) {
    return res.status(404).json('request params is required!');
  }
  let result = mockSegmentVxlans();
  return res.json(result);
});

function mockSegmentVlans() {
  let result = [];
  _.times(chance.natural({ min: 0, max: 2}), () => {
    let deviceId = chance.pickone(cloudModel.devices).id;
    let ports = [], mac_based_vlans = [], logical_ports = [];
    _.times(chance.natural({min: 0, max:3}), () => {
      ports.push(chance.natural({min: 1, max:24}) +'/'+chance.pickone(['tag', 'untag']))
    });
    _.times(chance.natural({min: 0, max:3}), () => {
      mac_based_vlans.push(
        chance.pickone(['XX-XX-XX-XX-00-00', 'XX-XX-XX-XX-00-01', 'XX-XX-XX-XX-00-02']) +'/'+chance.pickone(['24', '32']))
    });
    
    _.times(chance.natural({min: 0, max:3}), () => {
      logical_ports.push(
        chance.pickone(['trunk1', 'trunk2', 'trunk3', 'trunk4',  'trunk5',  'trunk6']) +'/'+chance.pickone(['tag', 'untag']))
    });

    let member = {'device_id': deviceId};
    if (ports.length >0) {
      member['ports'] = ports;
    }
    if (mac_based_vlans.length >0) {
      member['mac_based_vlans'] = mac_based_vlans;
    }
    if (logical_ports.length >0) {
      member['logical_ports'] = logical_ports;
    }
    result.push(member);
  });

  return result;
}

function mockSegmentVxlans() {
  let result = {'access_port': [], 'network_port': []};
  _.times(chance.natural({ min: 0, max: 3}), () => {
    result.access_port.push({
      'name':  chance.word(),
      'type': 'normal',
      'switch': chance.pickone(cloudModel.devices).id,
      'port': chance.natural({ min: 1, max: 9}),
      'vlan': chance.natural({ min: 2, max: 10})
    });
  });
  _.times(chance.natural({ min: 0, max: 3}), () => {
    result.access_port.push({
      'name':  chance.word(),
      'type': 'openstack',
      'server_mac': 'XX:XX:XX:XX:XX:XX',
      'vlan': chance.natural({ min: 2, max: 10})
    });
  });
  _.times(chance.natural({ min: 0, max: 3}), () => {
    result.network_port.push({
      'name':  chance.word(),
      'ip_addresses': [chance.ip()]
    });
  });
  return result;
}

module.exports = router;  