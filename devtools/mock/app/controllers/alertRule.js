const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  {AlertRule} = require('../models/alert'),
  _ = require('lodash');

router.get('/threshold', function (req, res) {
  return res.json(formatRule(cloudModel.alert.rules, true));
});

router.get('/:from/:type/threshold', function (req, res) {
  if (!req.params.from) {
    return res.status(404).json("Controller's or switch's threshold is required");
  }
  
  if (!req.params.type) {
    return res.status(404).json('Threshold type is required');
  }
  
  let rules = cloudModel.alert.rules.filter((rule) => {
    return rule.from === req.params.from && rule.type === req.params.type;
  });
  
  if(rules.length) {
    return res.json(formatRule(rules));
  } else {
    return res.status(404).json("No data exists!");
  }
  
});

router.get('/:from/:type/threshold/:ruleName', function (req, res) {
  if (!req.params.from) {
    return res.status(404).json("Controller's or switch's threshold is required");
  }
  
  if (!req.params.type) {
    return res.status(404).json('Threshold type is required');
  }
  
  if (!req.params.ruleName) {
    return res.status(404).json('The rule name is required');
  }
  
  let rule = cloudModel.alert.rules.find((rule) => {
    return rule.from === req.params.from && rule.type === req.params.type && rule.name === req.params.ruleName;
  });
  
  if(rule) {
    return res.json(formatRule(rule));
  } else {
    return res.status(404).json("No data exists!");
  }
});

router.post('/:from/:type/threshold', function (req, res) {
  let rule = cloudModel.alert.rules.find((rule) => {
    return rule.from === req.params.from && rule.type === req.params.type && rule.name === req.params.ruleName;
  });
  
  if(rule) {
    return res.status(400).json("This rule name has existed!");
  }
  
  let query = getRuleQuery(req.body, req.params.type);
  if(!query) {
    return res.status(400).json("This rule params is invalid!");
  }
  
  rule = new AlertRule(
    req.body.name,
    req.body.status,
    req.body.alert_level,
    req.body.receive_group,
    req.body.query,
    req.params.from,
    req.params.type
  );
  
  cloudModel.alert.rules.push(rule);
  
  return res.status(200).json("This rule has been added!");
});

router.delete('/:from/:type/threshold/:ruleName', function (req, res) {
  if (!req.params.from) {
    return res.status(404).json("Controller's or switch's threshold is required");
  }
  
  if (!req.params.type) {
    return res.status(404).json('Threshold type is required');
  }
  
  if (!req.params.ruleName) {
    return res.status(404).json('The rule name is required');
  }
  
  let ruleIndex = cloudModel.alert.rules.findIndex((rule) => {
    return rule.from === req.params.from && rule.type === req.params.type && rule.name === req.params.ruleName;
  });
  
  if(ruleIndex !== -1) {
    cloudModel.alert.rules.splice(ruleIndex,1);
    return res.status(200).json("This rule has been deleted!");
  } else {
    return res.status(404).json("No data exists!");
  }
});

function formatRule(rules, isGetAll) {
  let tmpRules = _.cloneDeep(rules);
  
  if(_.isArray(tmpRules)) {
    tmpRules.forEach((rule) => {
      if (rule.type == 'port') {
        rule.query_rx = rule.query.query_rx;
        rule.query_tx = rule.query.query_tx;
        
        delete rule['query'];
      }
      
      if(!isGetAll) {
        delete rule['from'];
        delete rule['type'];
      } else {
        formatType(rule)
      }
    })
  } else {
    if (rule.type == 'port') {
      rule.query_rx = rule.query.query_rx;
      rule.query_tx = rule.query.query_tx;
  
      delete rule['query'];
    }
  
    if(!isGetAll) {
      delete rule['from'];
      delete rule['type'];
    } else {
      formatType(rule)
    }
  }
  
  return tmpRules;
}

function formatType(rule) {
  switch(rule.type){
    case 'cpu':
      rule.type = 'cpu_utilization';
      rule.query.value = rule.query.util
      delete rule.query.util;
      break;
      
    case 'ram':
      rule.type = 'ram_used_ratio';
      rule.query.value = rule.query.used_ratio
      delete rule.query.used_ratio
      break;
      
    case 'disk':
      rule.type = 'disk_root_used_ratio';
      rule.query.value = rule.query.root_used_ratio
      delete rule.query.root_used_ratio;
      break;
      
    case 'port':
      if(rule.query_rx){
        rule.type = 'rx_util';
        rule.query_rx.value = rule.query_rx.rx_util
        delete rule.query_rx.rx_util;
      }
      
      if(rule.query_tx) {
        rule.type = 'tx_util';
        rule.query_tx.value = rule.query_tx.tx_util
        delete rule.query_tx.tx_util;
      }
  }
}

function getRuleQuery(body, type){
  if(!body.name || !body.status || !body.alert_level || !body.receive_group) {
    return false;
  }
  
  switch(type) {
    case 'cpu':
      if(body.util && body.condition && body.continue) {
        return {util: body.util, condition: body.condition, continue: body.continue}
      }
      
      return false;
    case 'ram':
      if(body.used_ratio && body.condition && body.continue) {
        return {used_ratio: body.used_ratio, condition: body.condition, continue: body.continue}
      }
  
      return false;
    case 'disk':
      if(body.root_used_ratio && body.condition && body.continue) {
        return {root_used_ratio: body.root_used_ratio, condition: body.condition, continue: body.continue}
      }
  
      return false;
    case 'port':
      if(body.rx_util && body.tx_util && body.condition && body.continue) {
        return {
          query_rx: [{rx_util:body.rx_util, condition: body.condition, continue: body.continue}],
          query_tx: [{tx_util:body.tx_util, condition: body.condition, continue: body.continue}]
        }
      }
  
      return false;
  }
}

module.exports = router;