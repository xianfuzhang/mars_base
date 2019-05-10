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
		scope.monitorLinkColors =  {}; // 通过事件changeLinksColor更新
		scope.monitorState = false; //开始监控
		scope.switches = scope.spines.concat(scope.leafs, scope.others);
		scope.topo_width = element[0].clientWidth;
		scope.topo_height = element[0].clientHeight;
		scope.outerRadius = Math.min(scope.topo_width, scope.topo_height) * 0.35;
		const OUTER_ARC_PADDING = 0.02;
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
    	g.selectAll('path').remove();

    	drawOuterDonut();
    	drawInnerDonut();
    	drawPortLinks();
    	displayOuterLabels();
    };
	
		let prepareDataHandle = () => {
			const pie = this.di.d3.pie()
	      .padAngle(OUTER_ARC_PADDING)
	      //默认根据pie value大小排序，可通过null取消排序,默认降序排列
	     //sort仅影响arc显示顺序，arcData顺序不变
	      .sort(null)
	      //value值须为数字
	      .value(function(d) {return  d.ports && d.ports.length ||1; });
	    scope.switchArcData = pie(scope.switches);

	    scope.portArcData = [];
			let switchObject = {}, i = 0;
			scope.switches.forEach(function(sw) {
		    switchObject[sw.id] = sw;
		    switchObject[sw.id]['linkPorts'] = [];
		  });
		  while (i < scope.links.length) {
		  	if (switchObject[scope.links[i]['src']['device']] && !switchObject[scope.links[i]['src']['device']]['linkPorts'].includes(scope.links[i]['src']['port'])) {
		  		switchObject[scope.links[i]['src']['device']]['linkPorts'].push(scope.links[i]['src']['port']);
		  	}
		    if (switchObject[scope.links[i]['dst']['device']] && !switchObject[scope.links[i]['dst']['device']]['linkPorts'].includes(scope.links[i]['dst']['port'])) {
		    	switchObject[scope.links[i]['dst']['device']]['linkPorts'].push(scope.links[i]['dst']['port']);	
		    }
		    i++;
		  }
		  for(let key in switchObject) {
		  	let switchArc, startArc = 0, endArc = 0, t = 0, portLen = 0;
		  	switchObject[key]['linkPorts'].sort(function(a, b){ return a - b ;});
		  	for(let s = 0; s < scope.switchArcData.length; s++){
		      if (key === scope.switchArcData[s]['data']['id']) {
		        switchArc = scope.switchArcData[s];
		        break;
		      }
		    }
				startArc = switchArc.startAngle + OUTER_ARC_PADDING * 3 / 4; //此处由于outer arc padding存在，需要手动微调
		    endArc = switchArc.endAngle - OUTER_ARC_PADDING * 3 / 4;
		    portLen = switchObject[key]['linkPorts'].length;
		    if (portLen > 0) t = (endArc - startArc) / portLen;
		    switchObject[key]['linkPorts'].forEach((port, i) => {
		      let arc = {
		        'data': {'port': port, 'device': switchObject[key]['id']},
		        'index': '' + key + i,
		        'value': 1,
		        'startAngle': startArc + i * t,
		        'endAngle': startArc + (i + 1) * t
		      };
		      scope.portArcData.push(arc);
		    });
		  }
		};

    let drawOuterDonut = () => {
    	let _this = this;
	    const outerPaths = g.append("g")
	    	.classed('outer', true)
	      .selectAll('path')
	      .data(scope.switchArcData)
	      .enter()
	      .append('path')
	      .attr('d', this.di.d3.arc()
	        .innerRadius(scope.outerRadius - 30)
	        .outerRadius(scope.outerRadius))
	      .attr('stroke', '#1B4A78') // 弧边颜色
	      .attr('fill', '#388FB8')
	      //each在这里主要处理arc path，arc的path会影响text沿着arc显示，通过each处理arc，截取外层arc段绘制一个新的path给text使用
	      .each(function(d, i){
	        const firstArcSection = /(^.+?)L/;
	        let newArc = firstArcSection.exec(_this.di.d3.select(this).attr("d") )[1];
	        newArc = newArc.replace(/,/g , " ");
	        g.append("path")
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
    	scope.portArcArr = [];
    	const portArc = this.di.d3.arc()
        .innerRadius(scope.outerRadius - 40)
        .outerRadius(scope.outerRadius - 30);

      const innerPaths = g.append('g')
      	.classed('inner', true)
	      .selectAll('path')
	      .data(scope.portArcData)
	      .enter()
	      .append('path')
	      .attr('d', portArc)
	      .attr('stroke', '#1B4A78')
	      .attr('fill', '#51A7CD')
	      .each(function(d){
	        //获取所有port arc中心点
	        let centroid = portArc.centroid(d);
	        centroid[0] = centroid[0] * 0.98;
	        centroid[1] = centroid[1] * 0.98;
	        d.data['x'] = centroid[0];
	        d.data['y'] = centroid[1];
	        scope.portArcArr.push(d);
	      })
	      .on('click', clickInnerDonut)
	      .on('mouseover', mouseoverInnerDonut)
	      .on('mouseout', mouseoutInnerDonut);
    };

    let drawPortLinks = () => {
		  let linkMapData = [], portCoordinateMap = new Map();
		  scope.portArcArr.forEach((port) => {
		    portCoordinateMap.set(port.data.device + port.data.port, 
		    	{x: port.data.x, y: port.data.y, device: port.data.device, port: port.data.port});
		  });
		  scope.links.forEach((link) => {
		    linkMapData.push({
		      source: portCoordinateMap.get(link.src.device + link.src.port),
		      target: portCoordinateMap.get(link.dst.device + link.dst.port)
		    });
		  });

		  function drawDPath(d) {
		    let drawing = '';
		    drawing += 'M' + d.source.x + ',' + d.source.y;
		    drawing += 'Q 0,0 ' + d.target.x + ',' + d.target.y;
		    return drawing;
		  };

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
		    .on('click', function(d){
	      	console.log(d);
	      });
    };

    let displayOuterLabels = () => {
    	const texts = g.append('g')
    		.classed('outerLabels', true)
	      .selectAll("text")
	      .data(scope.switchArcData)
	      .enter()
	      .append('text')
	        .attr('dy', '-10')
	        .append("textPath")
            .attr("xlink:href",function(d){return '#' + d.data.id;}) //link的地址就是arc的唯一id
            //在上面each回调函数中定义了新的path，text绑定到path，通过text-anchor,startOffset实现居中展示
            .style("text-anchor","middle")
            .attr('startOffset', '50%')
            .text(function(d) { return d.data.name;});
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
    	this.di.d3.select('g.links')
    		.selectAll('path')
    		.each((ld) => {
    			if ((ld.source.device === d.data.device && ld.source.port === d.data.port) || 
    					(ld.target.device === d.data.device && ld.target.port === d.data.port)) {
    				let locations = [ld.source, ld.target];
    				g.append('g')
    					.classed('tooltips', true)
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
    	g.selectAll('g.tooltips').remove();
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

    getDonutTopo();

    let clickOuterTopoHandler = (event) => {
    	if (event.target.tagName !== 'path') {
    		if (scope.topoSetting.show_monitor && scope.monitorState) {
    			updateLinksByMonitorColor();
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

		scope.$on('$destroy', () => {
			document.removeEventListener('click', clickOuterTopoHandler);
			angular.element(this.di.$window).unbind('resize', onResize);
			unsubscribers.forEach((cb) => cb());
		});	
	}
}
DonutTopo.$inject = DonutTopo.getDI();
DonutTopo.$$ngIsClass = true;