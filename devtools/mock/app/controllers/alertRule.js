const express = require('express'),
  router = express.Router(),
  config = require('../config'),
  {AlertRule} = require('../models/alert'),
  _ = require('lodash');

router.get('/threshold', function (req, res) {
  return res.json({healthycheck:formatRule(cloudModel.alert.rules, true)});
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
    query,
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
      
      if(!isGetAll) {
        delete rule['from'];
        delete rule['type'];
      } else {
        formatType(rule)
      }
    })
  } else {
  
    if(!isGetAll) {
      delete tmpRules['from'];
      delete tmpRules['type'];
    } else {
      formatType(tmpRules)
    }
  }
  
  return tmpRules;
}

function formatType(rule) {
  switch(rule.type){
    case 'cpu':
      rule.query.forEach((query) => {
        query.type = 'cpu_utilization';
        query.value = query.util;
        delete query.util;
      })
      break;
      
    case 'ram':
      rule.query.forEach((query) => {
        query.type = 'ram_used_ratio';
        query.value = query.used_ratio;
        delete query.used_ratio;
      })
      break;
      
    case 'disk':
      rule.query.forEach((query) => {
        query.type = 'disk_root_used_ratio';
        query.value = query.root_used_ratio
        delete query.root_used_ratio;
      })
      
      break;
      
    case 'port':
      if(rule.query.query_rx){
        let queryArr = _.cloneDeep(rule.query.query_rx);
        delete rule.query
  
        queryArr.forEach((query) => {
          query.type = 'rx_util';
          query.value = query.rx_util;
          delete query.rx_util
        })
        
        rule.query = queryArr;
      }
  
      if(rule.query.query_tx){
        let queryArr = _.cloneDeep(rule.query.query_tx);
        delete rule.query
  
        queryArr.forEach((query) => {
          query.type = 'tx_util';
          query.value = query.tx_util;
          delete query.tx_util
        })
  
        rule.query = queryArr;
      }
  }
  
  delete rule.type;
}

function getRuleQuery(body, type){
  if(!body.name || !body.status || !body.alert_level || !body.receive_group) {
    return false;
  }

  let queryArr = []
  switch(type) {
    case 'cpu':
      body.query.forEach((query) => {
        if(query.util && query.condition && query.continue) {
          queryArr.push({util: query.util, condition: query.condition, continue: query.continue})
        } else {
          return false;
        }
      })

      return queryArr;
    case 'ram':
      body.query.forEach((query) => {
        if(query.used_ratio && query.condition && query.continue) {
          queryArr.push({used_ratio: query.used_ratio, condition: query.condition, continue: query.continue})
        } else {
          return false;
        }
      })

      return queryArr;
    case 'disk':
      body.query.forEach((query) => {
        if(query.root_used_ratio && query.condition && query.continue) {
          queryArr.push({root_used_ratio: body.query.root_used_ratio, condition: body.query.condition, continue: body.query.continue});
        } else {
          return false;
        }
      })

      return queryArr;
    case 'port':
      if(body.query_rx){
        body.query_rx.forEach((query) => {
          queryArr.push({rx_util: query.rx_util, condition: query.condition, continue: query.continue})
        })
        return {query_rx: queryArr};
      } else if(body.query_tx){
        body.query_tx.forEach((query) => {
          queryArr.push({tx_util: query.tx_util, condition: query.condition, continue: query.continue})
        })
  
        return {query_tx: queryArr};
      } else {
        return false;
      }
  }
}

module.exports = router;