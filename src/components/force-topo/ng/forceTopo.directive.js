export class ForceTopo {
  static getDI() {
    return [
      '$rootScope',
      '$window',
      '$timeout',
      'localStoreService',
      '$document',
      '_',
      'd3',
      'd3-force',
      'easingService',
      'switchService'
    ];
  }

  constructor(...args) {
    this.di = [];
    ForceTopo.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/forceTopo');

    this.scope = {
      links: '=',
      devices: '=',
      topoSetting: '='
    };

    this.link = (...args) => this._link.apply(this, args);
  }


  _link(scope, element) {
    (function init() {
      let unsubscribers = [];

      let DI = this.di;
      let d3 = this.di.d3;

      this.height = 0;
      this.width = 0;

      this.paths = [];
      this.pathNodes = {};

      this.hosts = [];
      this.hostNodes = {};
      // scope.selectedDeviceId = null;

      this.source_devices = scope.devices;
      this.formated_devices = scope.devices;


      this.source_links = scope.links;
      this.formated_links = [];
      this.linkIds = [];


      let getLinkId = (deviceIds, ports) =>{
        let newDeviceIds = this.di._.sortBy(deviceIds);
        if(newDeviceIds[0] !== deviceIds[0]){
          let tmp = ports[0];
          ports[0] = ports[1];
          ports[1] = tmp;
        }
        return newDeviceIds[0] + ':' + ports[0] + '_' + newDeviceIds[1] + ':' + ports[1];
      };
      
      let formatLinks = (links) => {
        this.formated_links = [];
        this.di._.forEach(links, (link) => {
          // let newDeviceIds = this.di._.sortBy([link.src.device, link.dst.device]);
          // let linkId = newDeviceIds.join('-');
          
          let linkId = getLinkId([link.src.device, link.dst.device], [link.src.port, link.dst.port]);
          if (this.di._.findIndex(this.linkIds, linkId) === -1) {
            this.linkIds.push(linkId);
            this.formated_links.push({'source': link.src.device, 'target': link.dst.device, 'id': linkId,'value':1, 'link': link});
          }
        })
      };

      let formatDevice = (devices) => {

      }

      let getDeviceName = (deviceId) => {
        let device = this.di._.find(scope.devices, {"id": deviceId});
        if (device) return device['name'];
        else return '';
      };


      this.active_status = "ACTIVE";
      this.LINE_WIDTH = 1;
      this.LINE_SELECTED = '136,234,136';
      this.LINE_NORMAL = '240,240,240';
      this.LINE_ERROR = "255,0,0";
      this.oldWidth = null;

      let BOUNDARY_SIZE = 36;
      let NODE_SIZE = 36;
      let ICON_SIZE = 24;
      let SVG_LINE_LENGTH = 120;


      this.PATH_LINE_WIDTH = 3;
      this.PATH_LINE_SELECTED = '236,234,136';


      let easingService = this.di.easingService;
      let switchLocation = this.switchLocation;

      let initialize = () => {
        formatLinks(this.source_links);
        formatDevice(this.source_devices);
        genTopo();
      };

      this.simulation = null;
      this.linkNode = null;
      this.deviceNode = null;

      let svg = null;
      let color = (d) => {
        const scale = DI.d3.scaleOrdinal(DI.d3.schemeCategory10);
        return scale(d.group);
      };

      let isDrag = false;
      let drag = (simulation) => {
        let self = this;

        function dragstarted(d) {
          isDrag = true;
          if (scope.topoSetting.show_tooltips) {
            DI.$rootScope.$emit("hide_tooltip");
          }

          if (!DI.d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }


        function dragged(d) {
          if (d3.event.x >= 36 && d3.event.x <= self.width - 36) {
            d.fx = d3.event.x;
          }
          if (d3.event.y >= 36 && d3.event.y <= self.height - 36) {
            d.fy = d3.event.y;
          }
        }

        function dragended(d) {
          isDrag = false;
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
      };


      let reCenter = () => {
        let parentNode = element[0].parentNode;
        this.width = parentNode.offsetWidth;
        this.height = parentNode.offsetHeight;


        this.simulation
          .force("center", DI.d3.forceCenter(this.width / 2, this.height / 2))
      };

      let genTopo = () => {


        let parentNode = element[0].parentNode;
        this.width = parentNode.offsetWidth;
        this.height = parentNode.offsetHeight;


        const links = this.formated_links.map(d => Object.create(d));
        const nodes = this.formated_devices.map(d => Object.create(d));


        this.simulation = DI.d3.forceSimulation(nodes)
          .force("link", DI.d3.forceLink(links).id(d => d.id).distance(d => {return SVG_LINE_LENGTH}))
          .force("charge", DI.d3.forceManyBody().strength(-30))
          .force("collide", DI.d3.forceCollide(30).strength(0.2).iterations(3));

        reCenter();


        svg = this.di.d3.select('svg')
          .on('click', function () {
            DI.$rootScope.$emit('topo_unselect')
          });
        // .on('resize',reCenter);

        // let simulation = this.simulation;
        // setTimeout(function () {
        //   simulation
        //     .force("center", DI.d3.forceCenter(100, 200))
        // },2000)

        this.linkNode = svg.append("g")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .join("line").attr('linkid', d=>d.id)
          .attr("stroke-width", d => Math.sqrt(d.value));

        let mouseOutHandler = (evt) => {
          if (scope.topoSetting.show_tooltips) {
            this.di.$rootScope.$emit("hide_tooltip");
          }
        };

        function mouseOverHandler(d, i) {
          if (isDrag) {
            return;
          }
          let deviceId = this.getAttribute('deviceId');
          let sw = DI._.find(scope.devices, {'id': deviceId});
          let showArray = DI.switchService.getNormalShowInfo(sw);

          if (scope.topoSetting.show_tooltips) {
            let evt = {
              'clientX': this.getBoundingClientRect().left + NODE_SIZE / 2,
              'clientY': this.getBoundingClientRect().top + NODE_SIZE / 2
            };
            DI.$rootScope.$emit("show_tooltip", {event: evt, value: showArray});
          }
          // DI.d3.select(this)
          //   .append('text')
          //   .attr('x', '-6')
          //   .attr('y', '-10')
          //   .attr('stroke','black')
          //   .attr('stroke-width','1')
          //   .html(deviceId)
          //
          // DI.d3.select(this).select('text').remove('text');
        }

        function clickHandler() {
          DI.d3.event.stopPropagation();
          if (scope.topoSetting.show_tooltips) {
            DI.$rootScope.$emit("hide_tooltip");
          }
          let deviceId = this.getAttribute('deviceId');
          let sw = DI._.find(scope.devices, {'id': deviceId});
          let showArray = DI.switchService.getNormalShowInfo(sw);
          DI.$rootScope.$emit("switch_select", {event: null, id: deviceId, type: null, value: showArray});
        };

        this.deviceNode = svg.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .selectAll("g")
          .data(nodes)
          .join('g').attr("width", ICON_SIZE).attr("height", ICON_SIZE).attr('fill', 'gray').attr('deviceId', d => d.id)
          .html('<rect x="-6" y="-6" width="36" height="36"/><path style="pointer-events: none" d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>')
          .call(drag(this.simulation))
          .on('click', clickHandler);
          // .on('mouseover', mouseOverHandler)
          // .on('mouseout', mouseOutHandler)


        this.simulation.on("tick", () => {
          this.linkNode
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

          this.deviceNode.attr('transform', d => {
            let x, y;
            if (d.x > this.width - BOUNDARY_SIZE) {
              x = this.width - BOUNDARY_SIZE;
            } else if (d.x < BOUNDARY_SIZE) {
              x = BOUNDARY_SIZE;
            } else x = d.x;

            if (d.y > this.height - BOUNDARY_SIZE) {
              y = this.height - BOUNDARY_SIZE;
            } else if (d.y < BOUNDARY_SIZE) {
              y = BOUNDARY_SIZE;
            } else y = d.y;

            return 'translate(' + (x - ICON_SIZE / 2) + ',' + (y - ICON_SIZE / 2) + ')'
          });
        });


        // this.simulation.start();
        // let simulation = this.simulation;
        // setTimeout(function () {
        //   simulation.stop();
        // }, 10000)
      };

      // let getLinkId = (deviceIds, ports) => {
      //   let newDeviceIds = this.di._.sortBy(deviceIds);
      //   if (newDeviceIds[0] !== deviceIds[0]) {
      //     let tmp = ports[0];
      //     ports[0] = ports[1];
      //     ports[1] = tmp;
      //   }
      //   return newDeviceIds[0] + ':' + ports[0] + '_' + newDeviceIds[1] + ':' + ports[1];
      // };


      let _checkPeerLinksState = (memberDict) => {
        let keys = this.di._.keys(memberDict);
        let isOk = true;
        this.di._.forEach(keys, (key) => {
          // let device = this.leafs[key] || this.spines[key] || this.others[key];
          let device = this.di._.find(scope.leafs, {'id': key});
          if (device) {
            // TODO 目前用的是交换机 leafgroup中的port， 后面如果switch port 不起作用，那么要用memberDict中的port
            isOk = _checkPortState(device, device.leafGroup.switch_port);
            if (isOk === false) {
              return false;
            }
          } else {
            console.log('[topo.js > _checkPeerLinksState()] Device ' + key + ' 找不到');
          }

        });
        return isOk;
      };

      let genPeerLinks = () => {
        this.di._.forEach(scope.logicalPorts, (logicalPort) => {
          if (logicalPort.is_mlag) {
            let memberDict = this.di._.groupBy(logicalPort.members, 'device_id');
            let isPeerLinkOk = _checkPeerLinksState(memberDict);

            let keys = this.di._.keys(memberDict);
            let newKeys = this.di._.sortBy(keys);
            let linkId = newKeys[0] + '__' + newKeys[1];
            console.log('genPeerLinks  ====== >' + linkId);
            this.links[linkId] = genPeerLink(newKeys, linkId, isPeerLinkOk)
          }
        })
      };

      angular.element(this.di.$window).bind('resize', () => {
        console.log('exec resize');
        reCenter();
        this.simulation.restart();
      });

      unsubscribers.push(this.di.$rootScope.$on('resize_canvas', () => {
        console.log('receive resize_canvas');
        reCenter();
        this.simulation.restart();
      }));

      // unsubscribers.push(this.di.$rootScope.$on('show_links', () => {
      //   if (scope.topoSetting.show_links === 2) {
      //     genLinks()
      //   } else if (scope.topoSetting.show_links === 0) {
      //     crushLinks();
      //   } else {
      //     crushLinks();
      //     if (scope.selectedDeviceId) {
      //       showDeviceLinks(scope.selectedDeviceId);
      //     }
      //   }
      //
      // }));

      unsubscribers.push(this.di.$rootScope.$on('show_path', ($event, params) => {
        clearPath();
        this.paths = params;
        showPath();

      }));


      let _completeDeviceName4FlowInfo = (detail) =>{
        let res = angular.copy(detail);
        let src = detail.src.device;
        let dst = detail.dst.device;

        let src_sw = DI._.find(scope.devices,{'id':src});
        let dst_sw = DI._.find(scope.devices,{'id':dst});
        res.src.device_name = src_sw.name;
        res.dst.device_name = dst_sw.name;
        return res;
      };

      unsubscribers.push(this.di.$rootScope.$on('changeLinksColor', ($event, params) => {

        let links_color = params;
        this.linkNode
          .attr('stroke-width',2)
          .attr('stroke', d=>{
              let _link = d.link;
              let linkId = getLinkId([_link.src.device, _link.dst.device], [_link.src.port, _link.dst.port]);
              return 'rgb(' + links_color[linkId].color + ')';
            })
          .on('mouseover', function () {
              let linkid = this.getAttribute('linkid');
              if(scope.topoSetting.show_monitor){
                let res = _completeDeviceName4FlowInfo(links_color[linkid]);
                let mouseEvent = DI.d3.mouse(this);

                let x = element[0].getBoundingClientRect();

                let evt = {
                  'clientX': mouseEvent[0] + x.left,
                  'clientY':  mouseEvent[1] + x.top
                };
                DI.$rootScope.$emit("show_link_tooltip",{event:evt, value: res});
              }
            })
          .on('mouseout', function () {
            DI.$rootScope.$emit("hide_link_tooltip");
          });
      }));


      unsubscribers.push(this.di.$rootScope.$on('clearLinksColor',($event)=>{
        this.linkNode.attr('stroke', '#999').attr('stroke-width',1);
      }));

      unsubscribers.push(scope.$watch('topoSetting.show_tooltips', (newValue, oldValue) => {
        if (newValue === true) {
          this.deviceNode
            .append('text')
            .attr('x', '-6')
            .attr('y', '-10')
            .attr('stroke','black')
            .attr('stroke-width','1')
            .text(d=> {return getDeviceName(d.id)})
        } else {
          this.deviceNode
            .select('text').remove();
        }
      }));


      unsubscribers.push(this.di.$rootScope.$on('hide_path', () => {
        clearPath();
      }));

      unsubscribers.push(this.di.$rootScope.$on('show_ports', () => {
        if (scope.topoSetting.show_ports) {
          genAllPorts()
        } else {
          crushAllPorts()
        }
      }));

      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });

        angular.element(this.di.$window).off('resize');

      });

      initialize();

    }).call(this);


    /*const data = {
     "nodes": [
     {
     "group": 1,
     "id": "Myriel"
     },
     {
     "group": 1,
     "id": "Napoleon"
     },
     {
     "group": 2,
     "id": "Labarre"
     },
     {
     "group": 2,
     "id": "Valjean"
     },
     {
     "group": 3,
     "id": "Marguerite"
     },

     {
     "group": 3,
     "id": "Zephine"
     },
     {
     "group": 3,
     "id": "Fantine"
     }
     ],
     "links": [
     {
     "source": "Myriel",
     "target": "Napoleon",
     "value": 2
     },
     {
     "source": "Myriel",
     "target": "Zephine",
     "value": 2
     },
     {
     "source": "Marguerite",
     "target": "Zephine",
     "value": 5
     },
     {
     "source": "Fantine",
     "target": "Zephine",
     "value": 2
     },
     {
     "source": "Fantine",
     "target": "Valjean",
     "value": 5
     },
     {
     "source": "Labarre",
     "target": "Valjean",
     "value": 5
     }
     ]
     }

     let d3 = DI.d3;
     let color = (d) =>{
     const scale = DI.d3.scaleOrdinal(DI.d3.schemeCategory10);
     return scale(d.group);
     };

     let drag = (simulation) => {

     function dragstarted(d) {
     if (!DI.d3.event.active) simulation.alphaTarget(0.3).restart();
     d.fx = d.x;
     d.fy = d.y;
     }

     function dragged(d) {
     if(d3.event.x>= 0 && d3.event.x <= 750){
     d.fx = d3.event.x;
     }
     if(d3.event.y>= 0 && d3.event.y <= 700){
     d.fy = d3.event.y;
     }


     }

     function dragended(d) {
     if (!d3.event.active) simulation.alphaTarget(0);
     d.fx = null;
     d.fy = null;
     }

     return d3.drag()
     .on("start", dragstarted)
     .on("drag", dragged)
     .on("end", dragended);
     }

     let mouseover = (simulation) => {


     return d3.drag()
     .on("start", dragstarted)
     .on("drag", dragged)
     .on("end", dragended);
     }

     const links = data.links.map(d => Object.create(d));
     const nodes = data.nodes.map(d => Object.create(d));

     var simulation = DI.d3.forceSimulation(nodes)
     .force("link", DI.d3.forceLink(links).id(d => d.id).distance(d=> 1*120))
     .force("charge", DI.d3.forceManyBody().strength(-60))
     .force("center", DI.d3.forceCenter(1400 / 2, 700 / 2));



     const svg = DI.d3.select('svg');
     // d3.select(document.sv.svg(width, height));

     const link = svg.append("g")
     .attr("stroke", "#999")
     .attr("stroke-opacity", 0.6)
     .selectAll("line")
     .data(links)
     .join("line")
     .attr("stroke-width", d => Math.sqrt(d.value));

     // const node = svg.append("g")
     //   .attr("stroke", "#fff")
     //   .attr("stroke-width", 1.5)
     //   .selectAll("circle")
     //   .data(nodes)
     //   .join("circle")
     //   .attr("r", 10)
     //   .attr("fill", color)
     //   .call(drag(simulation));

     // <path fill="none" d="M0 0h24v24H0z"/>
     // <circle cx="12" cy="4" r="2"/>
     // <path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/>



     var node = svg.append("g")
     .attr("stroke", "#fff")
     .attr("stroke-width", 1.5)
     .selectAll("g")
     .data(nodes)
     .join('g').attr("width", 36).attr("height", 36).attr('fill','gray').attr('deviceId', d=>d.id)
     .html('<rect x="-6" y="-6" width="36" height="36"/><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>')
     .call(drag(simulation))
     .on('mouseover', handleMouseOut);

     setTimeout(function () {
     // simulation = DI.d3.forceSimulation(nodes)
     //   .force("link", DI.d3.forceLink(links).id(d => d.id).distance(d=> d.value*40))
     //   .force("charge", DI.d3.forceManyBody())
     //   .for ce("center", DI.d3.forceCenter(750 / 2, 700 / 2));
     // node.remove();
     node.join('g').html(d=> '<text x="-6" y="-10" fill="red" stroke="black" stroke-width="1">' + d.id + '</text> <rect x="-6" y="-6" width="36" height="36"/><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>')
     // node = svg.append("g")
     //   .attr("stroke", "#fff")
     //   .attr("stroke-width", 1.5)
     //   .selectAll("g")
     //   .data(nodes)
     //   .join('g').attr("width", 36).attr("height", 36).attr('fill','gray').attr('deviceId', d=>d.id)
     //   .html(d=> '<text x="-6" y="-10" fill="red" stroke="black" stroke-width="1">' + d.id + '</text> <rect x="-6" y="-6" width="36" height="36"/><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>')
     //   .call(drag(simulation))
     //   .on('mouseover', handleMouseOut);
     }, 2000);


     setTimeout(function () {
     // simulation = DI.d3.forceSimulation(nodes)
     //   .force("link", DI.d3.forceLink(links).id(d => d.id).distance(d=> d.value*40))
     //   .force("charge", DI.d3.forceManyBody())
     //   .for ce("center", DI.d3.forceCenter(750 / 2, 700 / 2));
     // node.remove();
     node.join('g').html('<rect x="-6" y="-6" width="36" height="36"/><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>')
     // node = svg.append("g")
     //   .attr("stroke", "#fff")
     //   .attr("stroke-width", 1.5)
     //   .selectAll("g")
     //   .data(nodes)
     //   .join('g').attr("width", 36).attr("height", 36).attr('fill','gray').attr('deviceId', d=>d.id)
     //   .html(d=> '<text x="-6" y="-10" fill="red" stroke="black" stroke-width="1">' + d.id + '</text> <rect x="-6" y="-6" width="36" height="36"/><path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"/>')
     //   .call(drag(simulation))
     //   .on('mouseover', handleMouseOut);
     }, 7000);

     function handleMouseOut(d, i) {
     // Use D3 to select element, change color back to normal
     // alert(this.getAttribute('deviceId'));
     // alert(this)
     // d3.select(this).attr({
     //   fill: "black",
     //   r: radius
     // });

     // Select text by id and then remove
     // d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
     }
     // .('path').attr('fill', 'none').attr('d',"M0 0h24v24H0z")
     // .append('circle').attr('cx', '12').attr('cy',"4").attr('r','2')
     // .append('path')
     // .call(drag(simulation));
     // .attr("width", "24")
     // .attr("height", "24")
     // .attr("fill","#dfafaf")
     // .call(drag(simulation));
     // .attr("fill","url(#image)")
     // <defs>
     // <pattern id="image" x="-32" y="-32" patternUnits="userSpaceOnUse" height="64" width="64">
     //   <image x="0" y="0" height="64" width="64" xlink:href="http://0.gravatar.com/avatar/902a4faaa4de6f6aebd6fd7a9fbab46a?s=64"/>
     //   </pattern>
     //   </defs>
     // node.append("title")
     //   .text(d => d.id);

     simulation.on("tick", () => {
     link
     .attr("x1", d => d.source.x)
     .attr("y1", d => d.source.y)
     .attr("x2", d => d.target.x)
     .attr("y2", d => d.target.y);

     // node
     //   .attr("cx", d => d.x)
     //   .attr("cy", d => d.y);

     node.attr('transform', d=> 'translate('+ (d.x -12) +',' + (d.y -12) + ')');
     });

     svg.node();
     */

  }

  getColor() {
    let theme = window.localStorage['userPrefs__theme'];
    if (theme && theme === 'theme_dark') {
      return {
        "CONTAINER_FILL": "40,40,40",
      };
    } else {
      return {
        "CONTAINER_FILL": "255,255,255",
      }
    }

  }

  getNodeColor() {
    let theme = window.localStorage['userPrefs__theme'];
    if (theme && theme === 'theme_dark') {
      return 'rgb(100,100,100)';
    } else {
      return 'rgb(0,0,0)';
    }
  }
}


ForceTopo.$inject = ForceTopo.getDI();
ForceTopo.$$ngIsClass = true;