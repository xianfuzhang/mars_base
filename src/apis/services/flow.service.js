export class FlowService {
	static getDI() {
		return [
			'_'
		];
	}

	constructor(...args) {
		this.di = {};
		FlowService.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		//http://www.networksorcery.com/enp/protocol/802/ethertypes.htm
		this.ethTypeObj = {
			'0x800': 'IPv4',
			'0x806': 'ARP',
			'0x86dd': 'IPv6',
			'0x8847': 'MPLS',
			'0x8848': 'MPLS',
			'0x8863': 'PPPoE',
			'0x8864': 'PPPoE',
			'0x88cc': 'LLDP',
			'0x8942': 'BDDP',
		};
	}

	selectorHandler(selector) {
		let ethTypes = [];
		selector.criteria.forEach((value, index) => {
			let eth_type;
			if (value.type === 'ETH_TYPE') {
				eth_type = value.type + ':' + (this.ethTypeObj[value.ethType] || value.ethType);
			}
			else if (value.type === 'ODU_SIGID') {
				eth_type = value.type + ':' + value.oduSignalId;
			}
			else {
				eth_type = value.type + ':' + Object.values(value).pop();
			}
			 
			ethTypes.push(eth_type);
		});
		return ethTypes.toString();
	}

	treatmentHander(treatment) {
		let instructions = [];
		treatment.instructions.forEach((instr, index) => {
			let keys = this.di._.keys(instr);
			let s1, s2;
			this.di._.forEach(keys, (key)=>{
        if(key === 'type'){
          s1 = instr[key];
				} else {
					s2 = instr[key];
				}
			});
			let instruction = s1 + ':' + s2;
			instructions.push(instruction);
		});

    treatment.deferred.forEach((instr, index) => {
      let keys = this.di._.keys(instr);
      let s1, s2;
      this.di._.forEach(keys, (key)=>{
        if(key === 'type'){
          s1 = instr[key];
        } else {
          s2 = instr[key];
        }
      });
      let instruction = s1 + ':' + s2;
      instructions.push(instruction);
    });


		return instructions.toString();
	}
}
FlowService.$inject = FlowService.getDI();
FlowService.$$ngIsClass = true;