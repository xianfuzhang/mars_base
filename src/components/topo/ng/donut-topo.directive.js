export class DonutTopo {
	static getDI () {
		return [
			'$rootScope',
			'$window',
			'$templateCache',
			'$timeout',
			'_',
			'd3',
			'switchService'
		];
	}
	constructor(...args) {
		this.di = {};
		DonutTopo.getDI().forEach((value, index) => {
			this.di[value] = args[index];
		});
		this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/donut-topo');

    this.scope = {
      spines: '=',
      leafs: '=',
      others:'=',
      links:'=',
      topoSetting:'='
    };
    this.link = (...args) => this._link.apply(this, args);
	}

	_link(scope, element, attr) {
		scope.spines = scope.spines || [];
		scope.leafs = scope.leafs || [];
		scope.others = scope.others || [];
		scope.links = scope.links || [];
		/*  //大批量数据测试 8spine + 60 leaf
			scope.spines = this.di._.times(8, (index) => {
				let ip = 220 + index;
				return {'id': 'rest:192.168.40.' + ip + ':80', 'name': 'spine' + index, type: "spine"}
			});
			 
			scope.leafs = this.di._.times(60, (index) => {
				let ip = 100 + index;
				return {'id': 'rest:192.168.40.' + ip + ':80', 'name': 'leaf' + index, type: "leaf"}
			});
			
			scope.links = this.di._.times(239, (index) => {
				let src_device, src_port, dst_device, dst_port;
				const i = index + 1, s_i = parseInt(i / 30), p_i = i % 30;
				let l_i = index > 119 ? p_i - 1 + 30 : p_i -1;
				if (l_i < 0) l_i = 0;
				src_device = scope.spines[s_i]['id'];
				src_port = p_i;
				dst_device = scope.leafs[l_i]['id'];
				dst_port = s_i + 1;
				return {'src': {'device': src_device, 'port': src_port}, 'dst': {'device': dst_device, 'port': dst_port}};	
			});
		*/
		scope.monitorLinkColors =  {}; // 通过事件changeLinksColor更新
		scope.monitorState = false; //开始监控
		scope.searchState = false;
		scope.searchPaths = []; //保存路径搜索时返回的路径
    scope.edgeSwitches = []; //保存路径搜索时主机连接的交换机和端口号
		scope.switches = scope.spines.concat(scope.leafs, scope.others);
		scope.topo_width = element[0].clientWidth;
		scope.topo_height = element[0].clientHeight;
		scope.outerRadius = Math.min(scope.topo_width, scope.topo_height) * 0.35;
		const OUTER_ARC_PADDING = scope.switches.length < 15 ? 0.02 : 0.005;
		const svg = this.di.d3.select('svg.topo_area')
			.attr("width", scope.topo_width)
      .attr("height", scope.topo_height);
  	const g = svg.select("g.drawArea")
    	.attr("transform", `translate(${scope.topo_width/ 2},${scope.topo_height / 2})`); //设置g中心点

    let getDonutTopo = () => {
    	prepareDataHandle();
    	drawOuterDonut();
    	drawInnerDonut();
    	drawPortLinks();
    	displayOuterLabels();
    };

    let redrawDonutTopo = () => {
    	svg.attr("width", scope.topo_width)
    		 .attr("height", scope.topo_height);
    	g.attr("transform", `translate(${scope.topo_width/ 2},${scope.topo_height / 2})`);
    	g.selectAll('g').remove();

    	updatePortArcData();
    	drawOuterDonut();
    	drawInnerDonut();
    	drawPortLinks();
    	displayOuterLabels();
    	if (scope.searchState && scope.searchPaths.length > 0)  showPathSearchResult(scope.searchPaths);
    };
	
		let prepareDataHandle = () => {
			if (scope.switches.length === 0) {
				g.append('text')
					.classed('center', true)
					.text('当前环境暂无交换机信息');
			}
			const pie = this.di.d3.pie()
	      .padAngle(OUTER_ARC_PADDING)
	      //默认根据pie value大小排序，可通过null取消排序,默认降序排列
	     //sort仅影响arc显示顺序，arcData顺序不变
	      .sort(null)
	      //value值须为数字
	      .value(function(d) {return  d.ports && d.ports.length ||10; });
	    scope.switchArcData = pie(scope.switches);

	    scope.switchObject = {};
			scope.switches.forEach(function(sw) {
		    scope.switchObject[sw.id] = sw;
		    scope.switchObject[sw.id]['linkPorts'] = [];
		  });
		  let i = 0;
		  while (i < scope.links.length) {
		  	if (scope.switchObject[scope.links[i]['src']['device']] && !scope.switchObject[scope.links[i]['src']['device']]['linkPorts'].includes(scope.links[i]['src']['port'])) {
		  		scope.switchObject[scope.links[i]['src']['device']]['linkPorts'].push(scope.links[i]['src']['port']);
		  	}
		    if (scope.switchObject[scope.links[i]['dst']['device']] && !scope.switchObject[scope.links[i]['dst']['device']]['linkPorts'].includes(scope.links[i]['dst']['port'])) {
		    	scope.switchObject[scope.links[i]['dst']['device']]['linkPorts'].push(scope.links[i]['dst']['port']);	
		    }
		    i++;
		  }
		  updatePortArcData();
		};

		let updatePortArcData = () => {
			scope.portArcData = [];
			for(let key in scope.switchObject) {
		  	let switchArc, startArc = 0, endArc = 0, t = 0, portLen = 0;
		  	scope.switchObject[key]['linkPorts'].sort(function(a, b){ return a - b ;});
		  	for(let s = 0; s < scope.switchArcData.length; s++){
		      if (key === scope.switchArcData[s]['data']['id']) {
		        switchArc = scope.switchArcData[s];
		        break;
		      }
		    }
				startArc = switchArc.startAngle + OUTER_ARC_PADDING * 3 / 4; //此处由于outer arc padding存在，需要手动微调
		    endArc = switchArc.endAngle - OUTER_ARC_PADDING * 3 / 4;
		    portLen = scope.switchObject[key]['linkPorts'].length;
		    if (portLen > 0) t = (endArc - startArc) / portLen;
		    scope.switchObject[key]['linkPorts'].forEach((port, i) => {
		      let arc = {
		        'data': {'port': port, 'device': scope.switchObject[key]['id']},
		        'index': '' + key + i,
		        'value': 1,
		        'startAngle': startArc + i * t,
		        'endAngle': startArc + (i + 1) * t
		      };
		      scope.portArcData.push(arc);
		    });
		  }

		  scope.portCoordinateMap = new Map();
		  scope.portArcData.forEach((port) => {
		  	let centerAngle = (port.startAngle + port.endAngle) / 2;
		    scope.portCoordinateMap.set(port.data.device + port.data.port, 
		    	{
		    		x: (scope.outerRadius - 40) * Math.sin(centerAngle), 
		    		y: -(scope.outerRadius - 40) * Math.cos(centerAngle), 
		    		device: port.data.device, 
		    		port: port.data.port
		    	}
		    );
		  });
		};

    let drawOuterDonut = () => {
    	let _this = this;
    	const switchArc = this.di.d3.arc()
	        .innerRadius(scope.outerRadius - 30)
	        .outerRadius(scope.outerRadius);
	    g.select('g.outer').remove();
	    g.select('g.labelPaths').remove();
	    let label_g = g.append('g').classed('labelPaths', true);
	    const outerPaths = g.append("g")
	    	.classed('outer', true)
	      .selectAll('path')
	      .data(scope.switchArcData)
	      .enter()
	      .append('path')
	      .attr('d', switchArc)
	      //each在这里主要处理arc path，arc的path会影响text沿着arc显示，通过each处理arc，截取外层arc段绘制一个新的path给text使用
	      .each(function(d, i){
	      	if (scope.switches.length > 15) return;
	      	let centroid = switchArc.centroid(d);
	      	centroid[0] = centroid[0] * 1.28;
	        centroid[1] = centroid[1] * 1.28;
	        d['centr_x'] = centroid[0];
	        d['centr_y'] = centroid[1];

	        const firstArcSection = /(^.+?)L/;
	        let newArc = firstArcSection.exec(_this.di.d3.select(this).attr("d") )[1];
	        newArc = newArc.replace(/,/g , " ");
	        label_g.append("path")
	          .attr("class", "hiddenArc")
	          .attr("id", d.data.id)
	          .attr("d", newArc)
	          .style("fill", "none");
	      })
	      .on('click', clickOuterDonut)
	      .on('mouseover', mouseoverOuterDonut)
	      .on('mouseout', mouseoutOuterDonut);
    };
    	
    let drawInnerDonut = () => {
    	let _this = this;
    	//scope.portArcArr = [];
    	const portArc = this.di.d3.arc()
        .innerRadius(scope.outerRadius - 40)
        .outerRadius(scope.outerRadius - 30);

       g.select('g.inner').remove();
      const innerPaths = g.append('g')
      	.classed('inner', true)
	      .selectAll('path')
	      .data(scope.portArcData)
	      .enter()
	      .append('path')
	      .attr('d', portArc)
	      /*.each(function(d){
	        //获取所有port arc中心点
	        let centroid = portArc.centroid(d);
	        centroid[0] = centroid[0] * 0.98;
	        centroid[1] = centroid[1] * 0.98;
	        d.data['x'] = centroid[0];
	        d.data['y'] = centroid[1];
	        scope.portArcArr.push(d);
	      })*/
	      .on('click', clickInnerDonut)
	      .on('mouseover', mouseoverInnerDonut)
	      .on('mouseout', mouseoutInnerDonut);
    };

    let drawPortLinks = () => {
		  let linkMapData = [];
		  scope.links.forEach((link) => {
		    linkMapData.push({
		      source: scope.portCoordinateMap.get(link.src.device + link.src.port)
		      			 || {'x': 0, 'y': 0, 'device': link.src.device, 'port': link.src.port},
		      target: scope.portCoordinateMap.get(link.dst.device + link.dst.port)
		      			 || {'x': 0, 'y': 0, 'device': link.dst.device, 'port': link.dst.port}
		    });
		  });

		  function drawDPath(d) {
		    let drawing = '';
		    drawing += 'M' + d.source.x + ',' + d.source.y;
		    drawing += 'Q 0,0 ' + d.target.x + ',' + d.target.y;
		    return drawing;
		  };

		  g.select('g.links').remove();
		  const linkPaths = g.append('g')
		  	.classed('links', true)
		    .selectAll('path')
		    .data(linkMapData)
		    .enter()
		    .append('path')
		    .attr('class', 'link')
		    .attr('d', drawDPath)
		    .attr('stroke', (d) => {
		    	return scope.topoSetting.show_links === 2 ? '#51A7CD' : 'none';
		    })
		    .attr('stroke-width', 2)
		    .attr('fill', 'none')
		    ;
    };

    let displayOuterLabels = () => {
    	g.select('g.outerLabels').remove();
    	const texts = g.append('g')
    		.classed('outerLabels', true)
	      .selectAll("text")
	      .data(scope.switchArcData);

	    if (scope.switches.length > 15) {
	    	texts.enter()
	    		.append('text')
	    			.attr('dx', (d) =>{
	    				return (d.startAngle + d.endAngle) / 2 * 180 / Math.PI < 180 ? '2em' : '-2em';
	    			})
	    			.attr("transform", (d) => {
	    				let x = (d.startAngle + d.endAngle) / 2 * 180 / Math.PI,
	    						  x0 = scope.outerRadius * Math.sin((d.startAngle + d.endAngle) / 2),
	    							y0 = -scope.outerRadius * Math.cos((d.startAngle + d.endAngle) / 2);
	    				return `rotate(${x - 90}, ${x0}, ${y0}) translate(${x0}, ${y0}) rotate(${x < 180 ? 0 : 180})`;
	    			})
	    			.text(function(d) { return d.data.name;});
	    }
	    else {
	    	texts.enter()
	      .append('text')
	        .attr('dy', '-10')
	        .append("textPath")
            .attr("xlink:href",function(d){return '#' + d.data.id;}) //link的地址就是arc的唯一id
            //在上面each回调函数中定义了新的path，text绑定到path，通过text-anchor,startOffset实现居中展示
            .attr('startOffset', '50%')
            .text(function(d) { return d.data.name;});
	    }  
    };

    let clickOuterDonut = (d) => {
    	this.di.d3.select('g.links')
    		.selectAll('path')
    		.attr('stroke', function(ld){
    			if (scope.topoSetting.show_links === 2) {
    				return ld.source.device === d.data.id || ld.target.device === d.data.id ? '#1B4A78' : '#51A7CD';	
    			}
    			else if (scope.topoSetting.show_links === 1) {
    				return ld.source.device === d.data.id || ld.target.device === d.data.id ? '#51A7CD' : 'none';		
    			}
    			else if (scope.topoSetting.show_links === 0) {
    				return 'none';
    			}
    		});
    	let showArray = [];
      let sw = this.di._.find(scope.switches, {'id': d.data.id});
      showArray = this.di.switchService.getSpineShowInfo(sw);	
    	scope.$emit("switch_select",{event:this.di.d3.event, id: d.data.id, type: sw.type, value: showArray});	
    };

    let mouseoverOuterDonut = (d) => {
    	if(scope.topoSetting.show_tooltips){
    		let showArray = [];
        let sw = this.di._.find(scope.switches, {'id': d.data.id});
        showArray = this.di.switchService.getSpineShowInfo(sw);
        scope.$emit("show_tooltip",{event:this.di.d3.event, value: showArray});
      }
    };

    let mouseoutOuterDonut = (d) => {
    	if(scope.topoSetting.show_tooltips){
        scope.$emit("hide_tooltip");
      }
    };

    let clickInnerDonut = (d) => {
    	this.di.d3.select('g.links')
    		.selectAll('path')
    		.attr('stroke', function(ld){
    			if (scope.topoSetting.show_links === 2) {
    				return (ld.source.device === d.data.device && ld.source.port === d.data.port) 
	    				|| (ld.target.device === d.data.device && ld.target.port === d.data.port) 
	    				? '#1B4A78' : '#51A7CD';	
    			}
    			else if (scope.topoSetting.show_links === 1) {
    				return (ld.source.device === d.data.device && ld.source.port === d.data.port) 
	    				|| (ld.target.device === d.data.device && ld.target.port === d.data.port) 
	    				? '#51A7CD' : 'none';	
    			}
    			else if (scope.topoSetting.show_links === 0) {
    				return 'none';
    			}
    		});
    };

    let mouseoverInnerDonut = (d) => {
    	let tooltips = g.append('g').attr('class', 'tooltips');
    	g.select('g.links')
    		.selectAll('path')
    		.each((ld) => {
    			if ((ld.source.device === d.data.device && ld.source.port === d.data.port) || 
    					(ld.target.device === d.data.device && ld.target.port === d.data.port)) {
    				let locations = [ld.source, ld.target];
    				tooltips
    					.selectAll('text')
    					.data(locations)
    					.enter()
    					.append('text')
	    					.attr('x', d => d.x)
	    					.attr('y', d => d.y)
	    					.text(d => d.port);
    			}
    		});
    };

    let mouseoutInnerDonut = (d) => {
    	g.select('g.tooltips').remove();
    };

    let updateLinksByMonitorColor = () => {
    	let _this = this;
    	this.di.d3.select('g.links')
    		.selectAll('path')
    		.each(function(d){
    			let linkId = d.source.device + ':' + d.source.port + '_' + d.target.device + ':' + d.target.port,
    				linkId1 = d.target.device + ':' + d.target.port + '_' + d.source.device + ':' + d.source.port;
    			if (scope.monitorLinkColors[linkId]) {
    				_this.di.d3.select(this).attr('stroke', 'rgb(' + scope.monitorLinkColors[linkId]['color'] + ')');
    			}
    			else if (scope.monitorLinkColors[linkId1]) {
    				_this.di.d3.select(this).attr('stroke', 'rgb(' + scope.monitorLinkColors[linkId1]['color'] + ')');
    			}
    			else {
    				_this.di.d3.select(this).attr('stroke',() => {
		      		return scope.topoSetting.show_links === 2 ? '#51A7CD' : 'none';
		      	});	
    			}
    		});
    };

    let showPathSearchResult = (paths) => {
    	let search_g = g.append('g')
    		.classed('searchPaths', true);
    	
    	let hosts = [];
    	scope.edgeSwitches = [], scope.search = [];
    	paths.forEach((p) =>{
    		let srcArr = p.src.split('/'), dstArr = p.dst.split('/');
    		if (p.type === 'EDGE') {
    			srcArr.length === 2 ? scope.edgeSwitches.push({'device': srcArr[0], 'port': srcArr[1]})
    													: hosts.push({'mac': srcArr[0], 'vlan': srcArr[1]});
    			dstArr.length === 2 ? scope.edgeSwitches.push({'device': dstArr[0], 'port': dstArr[1]}) 
    													: hosts.push({'mac': dstArr[0], 'vlan': dstArr[1]});
    		}
    	});
    	if (paths.length === 2) {
    		let srcArr = paths[0]['dst'].split('/'), dstArr = paths[1]['src'].split('/');
    		//防止后端异常数据影响前端显示
    		if (srcArr[0] === dstArr[0] && srcArr[1] !== dstArr[1]) {
    			scope.search.push({
	  				'source': {
	  					'device': srcArr[0],
	  					'port': srcArr[1]
	  				},
	  				'target': {
	  					'device': dstArr[0],
	  					'port': dstArr[1]
	  				}
	  			});
    		}
    	}	
    	else if (paths.length > 2) {
    		//根据paths返回数据结构，第一条数据是src host连接switch，最后一条数据是switch连接dst host
    		paths.forEach((p) => {
    			let srcArr = p.src.split('/'), dstArr = p.dst.split('/');
	  			if (p.type === 'DIRECT') {
	  				scope.search.push({
		  				'source': {
		  					'device': srcArr[0],
		  					'port': srcArr[1]
		  				},
		  				'target': {
		  					'device': dstArr[0],
		  					'port': dstArr[1]
		  				},
		  				'type': 'switchLink'
		  			});
		  			scope.search.push({
		  				'source': {
		  					'device': dstArr[0],
		  					'port': dstArr[1]
		  				},
		  				'type': 'trafficForwarding'
		  			})
	  			}
    		});
    		//forwarding target补缺
    		for (let i = 0; i < scope.search.length; i++) {
    			if (scope.search[i]['type'] === 'trafficForwarding') {
    				for (let j = 0;  j < scope.search.length; j++) {
    					if (scope.search[j]['type'] === 'switchLink' && scope.search[j]['source']['device'] === scope.search[i]['source']['device']) {
    						scope.search[i]['target'] = {
    							'device': scope.search[j]['source']['device'],
    							'port': scope.search[j]['source']['port']
    						};
    						break;
    					}
    				}
    			}
    		}
    		//src host, dst host forwarding补缺
    		let src = paths[0]['dst'].split('/'), dst = paths[paths.length - 1]['src'].split('/');
    		scope.search.unshift({
    			'source': {
    				'device': src[0],
    				'port': src[1]
    			},
    			'target': {
    				'device': scope.search[0]['source']['device'],
    				'port': scope.search[0]['source']['port']
    			},
    			'type': 'trafficForwarding'
    		});
    		scope.search[scope.search.length - 1]['target'] = {
    			'device': dst[0],
    			'port': dst[1]
    		};
    	}
    	//portArcData加入host port
    	if (scope.edgeSwitches.length === 2) {
    		//源、目的交换机、端口都一致表明路径搜索的主机有问题，不作处理
    		if (scope.edgeSwitches[0]['device'] === scope.edgeSwitches[1]['device'] 
    				&& scope.edgeSwitches[0]['port'] === scope.edgeSwitches[1]['port']) return;
    		for(let key in scope.switchObject) {
    			if (key === scope.edgeSwitches[0]['device']) {
    				scope.switchObject[key]['linkPorts'].includes(scope.edgeSwitches[0]['port']) ? null :
    					scope.switchObject[key]['linkPorts'].push(scope.edgeSwitches[0]['port']);
    			}
    			if (key === scope.edgeSwitches[1]['device']) {
    				scope.switchObject[key]['linkPorts'].includes(scope.edgeSwitches[1]['port']) ? null :
    					scope.switchObject[key]['linkPorts'].push(scope.edgeSwitches[1]['port']);
    			}
    		}
    		updatePortArcData();
    		drawInnerDonut();
    		drawPortLinks();
    	}
    	scope.portArcData.forEach((arc) => {
    		//src host
    		if (arc.data.device === scope.edgeSwitches[0]['device'] && arc.data.port === scope.edgeSwitches[0]['port']) {
    			hosts[0]['angle'] = (arc.startAngle + arc.endAngle) / 2;
    			hosts[0]['x'] = scope.outerRadius * Math.sin(hosts[0]['angle']) * 1.2;
    			hosts[0]['y'] = -scope.outerRadius * Math.cos(hosts[0]['angle']) * 1.2;
    		}
    		//dst host
    		else if (arc.data.device === scope.edgeSwitches[1]['device'] && arc.data.port === scope.edgeSwitches[1]['port']) {
    			hosts[1]['angle'] = (arc.startAngle + arc.endAngle) / 2;
    			hosts[1]['x'] = scope.outerRadius * Math.sin(hosts[1]['angle']) * 1.2;
    			hosts[1]['y'] = -scope.outerRadius * Math.cos(hosts[1]['angle']) * 1.2;
    		}
    	})

    	search_g.selectAll('use')
    		.data(hosts)
    		.enter()
    		.append('use')
	    		.attr('class', 'host')
	    		.attr('xlink:href', '#host')
	    		.attr('id', (d) => d.mac)
					.attr('width', 32)
					.attr('height', 32)
					.attr('transform-origin', 'right bottom')
					.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');
			
			search_g.selectAll('text')
				.data(hosts)
				.enter()
				.append('text')
					.attr('transform-origin', 'right bottom')
					.attr('transform', (d) => {
						return `
							translate(${d.angle > Math.PI ? d.x - 80 : d.x - 30}, ${d.y + 40})
						`;
					})
					.text((d) => d.mac);

		  let drawDPath = () => {
		  	let drawing = '';
		  	scope.search.forEach((link) => {
		  		let source = scope.portCoordinateMap.get(link.source.device + link.source.port)
		  							|| {'x': 0, 'y': 0, 'device': link.source.device, 'port': link.source.port};
		  		let target = scope.portCoordinateMap.get(link.target.device + link.target.port)
		  							|| {'x': 0, 'y': 0, 'device': link.target.device, 'port': link.target.port};
		  		drawing += 'M' + source.x + ',' + source.y;
		    	drawing += 'Q 0,0 ' + target.x + ',' + target.y;
		  	});
		    return drawing;
		  }  
			search_g.append('path')
				.attr('class', 'link')
		    .attr('d', drawDPath)
		    .attr('stroke', '#1B4A78')
		    .attr('stroke-width', 4)
		    .attr('fill', 'none')
		    .on('mouseover', mouseoverSearchPaths)
	      .on('mouseout', mouseoutSearchPaths);

		  updateLinksBySearchPaths();
    };

    let mouseoverSearchPaths = () => {
    	let tooltips = g.append('g').attr('class', 'tooltips');
    	let ports = new Map(), locations = [];
    	scope.search.forEach((path) => {
    		ports.set(path.source.device + path.source.port, scope.portCoordinateMap.get(path.source.device + path.source.port));
    		ports.set(path.target.device + path.target.port, scope.portCoordinateMap.get(path.target.device + path.target.port));
    	});
    	for(let port of ports) {
    		locations.push(port[1]);
    	}
    	tooltips
    		.selectAll('text')
				.data(locations)
				.enter()
				.append('text')
					.attr('x', d => d.x)
					.attr('y', d => d.y)
					.text(d => d.port);
    };

    let mouseoutSearchPaths = () => {
    	g.select('g.tooltips').remove();
    };

    let clearPathSearch = () => {
    	if (scope.edgeSwitches.length === 2) {
    		for(let key in scope.switchObject) {
	  			if (key === scope.edgeSwitches[0]['device']) {
	  				let index = scope.switchObject[key]['linkPorts'].indexOf(scope.edgeSwitches[0]['port']);
	  				if (index > -1) scope.switchObject[key]['linkPorts'].splice(index, 1);
	  			}
	  			else if (key === scope.edgeSwitches[1]['device']) {
	  				let index = scope.switchObject[key]['linkPorts'].indexOf(scope.edgeSwitches[1]['port']);
	  				if (index > -1) scope.switchObject[key]['linkPorts'].splice(index, 1);
	  			}
	  		}
	  		updatePortArcData();
	  		drawInnerDonut();
	  		drawPortLinks();
    	}
    	g.selectAll('g.searchPaths').remove();
    };

    let updateLinksBySearchPaths = () => {
    	//防止port link背景色影响search path  
		  g.selectAll('g.links path')
			  .filter((d) => {
			  	let status = false;
			  	for (let i = 0; i< scope.search.length; i++) {
			  		if (scope.search[i].type === "switchLink" && ((scope.search[i]['source']['device'] === d.source.device && 
					  			scope.search[i]['source']['port'] === d.source.port && scope.search[i]['target']['device'] === d.target.device && 
					  			scope.search[i]['target']['port'] === d.target.port)
			  		 	|| (scope.search[i]['source']['device'] === d.target.device && 
					  			scope.search[i]['source']['port'] === d.target.port && scope.search[i]['target']['device'] === d.source.device && 
					  			scope.search[i]['target']['port'] === d.source.port))) {
			  			status = true;
			  			break;
			  		}
			  	}
			  	return status;
			  })
			  .attr('stroke', 'none');
    };

    //init topo
    getDonutTopo();

    let clickOuterTopoHandler = (event) => {
    	if (event.target.tagName !== 'path') {
    		if (scope.topoSetting.show_monitor && scope.monitorState) {
    			updateLinksByMonitorColor();
    		}
    		else if (scope.topoSetting.show_path && scope.searchState) {
    			updateLinksBySearchPaths();
    		}
    		else {
    			this.di.d3.select('g.links')
	      	.selectAll('path')
	      	.attr('stroke', () => {
	      		return scope.topoSetting.show_links === 2 ? '#51A7CD' : 'none';
	      	});	
    		}
    	}
    };
    document.addEventListener('click', clickOuterTopoHandler, false);
    let onResize = (e) => {
    	this.di.$timeout(()  => {
    		scope.topo_width = element[0].clientWidth;
				scope.topo_height = element[0].clientHeight;
				scope.outerRadius = Math.min(scope.topo_width, scope.topo_height) * 0.35;
				
				redrawDonutTopo();	
    	}, 500);
    };
    angular.element(this.di.$window).bind('resize', onResize);

    scope.$watch('topoSetting.show_links', (newVal, oldVal) => {
    	this.di.d3.select('g.links')
    		.selectAll('path')
    			.attr('stroke', () => {
    				return scope.topoSetting.show_links === 2 ? '#51A7CD' : 'none';
    			});
    }, false);

    let unsubscribers = [];
    unsubscribers.push(this.di.$rootScope.$on('changeLinksColor', (event, param) => {
    	scope.monitorState = true;
    	scope.monitorLinkColors = param;
    	updateLinksByMonitorColor();
    }));
    unsubscribers.push(this.di.$rootScope.$on('clearLinksColor', (event) => {
    	scope.monitorState = false;
    	this.di.d3.select('g.links')
    		.selectAll('path')
    		.attr('stroke', () => {
  				return scope.topoSetting.show_links === 2 ? '#51A7CD' : 'none';
  			});
    }));
    unsubscribers.push(this.di.$rootScope.$on('show_path',($event, param)=>{
    	scope.searchState = true;
    	clearPathSearch();
    	scope.searchPaths = param;
    	showPathSearchResult(param);
    }));
    unsubscribers.push(this.di.$rootScope.$on('hide_path',()=>{
    	scope.searchState = false;
    	clearPathSearch();
    }));

		scope.$on('$destroy', () => {
			document.removeEventListener('click', clickOuterTopoHandler);
			angular.element(this.di.$window).unbind('resize', onResize);
			unsubscribers.forEach((cb) => cb());
		});	
	}
}
DonutTopo.$inject = DonutTopo.getDI();
DonutTopo.$$ngIsClass = true;