export class DonutTopo {
	static getDI () {
		return [
			'$window',
			'$templateCache',
			'$timeout',
			'd3'
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
		    switchObject[sw.id]['ports'] = [];
		  });
		  while (i < scope.links.length) {
		  	if (switchObject[scope.links[i]['src']['device']] && !switchObject[scope.links[i]['src']['device']]['ports'].includes(scope.links[i]['src']['port'])) {
		  		switchObject[scope.links[i]['src']['device']]['ports'].push(scope.links[i]['src']['port']);
		  	}
		    if (switchObject[scope.links[i]['dst']['device']] && !switchObject[scope.links[i]['dst']['device']]['ports'].includes(scope.links[i]['dst']['port'])) {
		    	switchObject[scope.links[i]['dst']['device']]['ports'].push(scope.links[i]['dst']['port']);	
		    }
		    i++;
		  }
		  for(let key in switchObject) {
		  	let switchArc, startArc = 0, endArc = 0, t = 0, portLen = 0;
		  	switchObject[key]['ports'].sort(function(a, b){ return a - b ;});
		  	for(let s = 0; s < scope.switchArcData.length; s++){
		      if (key === scope.switchArcData[s]['data']['id']) {
		        switchArc = scope.switchArcData[s];
		        break;
		      }
		    }
				startArc = switchArc.startAngle + OUTER_ARC_PADDING * 3 / 4; //此处由于outer arc padding存在，需要手动微调
		    endArc = switchArc.endAngle - OUTER_ARC_PADDING * 3 / 4;
		    portLen = switchObject[key]['ports'].length;
		    if (portLen > 0) t = (endArc - startArc) / portLen;
		    switchObject[key]['ports'].forEach((port, i) => {
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
	      .on('click', function(d){
	      	_this.di.d3.select('g.links')
	      		.selectAll('path')
	      		.attr('stroke', function(ld){
	      			return ld.source.device === d.data.id || ld.target.device === d.data.id ? 'red' : '#006EA4';
	      		});
	      });
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
	      .on('click', function(d){
	      	_this.di.d3.select('g.links')
	      		.selectAll('path')
	      		.attr('stroke', function(ld){
	      			return (ld.source.device === d.data.device && ld.source.port === d.data.port) 
	      				|| (ld.target.device === d.data.device && ld.target.port === d.data.port) 
	      				? 'red' : '#006EA4';
	      		});
	      });
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
		    .attr('stroke', '#006EA4')
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

    getDonutTopo();

    let clickOuterTopoHandler = (event) => {
    	if (event.target.tagName !== 'path') {
    		this.di.d3.select('g.links')
	      	.selectAll('path')
	      	.attr('stroke', '#006EA4');
    		return;
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
		scope.$on('$destroy', () => {
			document.removeEventListener('click', clickOuterTopoHandler);
			angular.element(this.di.$window).unbind('resize', onResize);
		});	
	}
}
DonutTopo.$inject = DonutTopo.getDI();
DonutTopo.$$ngIsClass = true;