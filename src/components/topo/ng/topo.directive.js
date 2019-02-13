
export class Topo {
  static getDI () {
    return [
      '$rootScope',
      '$window',
      '$timeout',
      'localStoreService',
      '$document',
      '_',
      'easingService',
      'switchService'
    ];
  }

  constructor (...args) {
    this.di = [];
    Topo.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/topo');

    this.scope = {
      spines: '=',
      leafs: '=',
      others:'=',
      links:'=',
      logicalPorts:'=',
      topoSetting:'='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      let unsubscribers = [];

      let DI = this.di;

      this.di.$window.requestAnimFrame = (function(callback) {
        return this.di.$window.requestAnimationFrame
          || this.di.$window.webkitRequestAnimationFrame
          || this.di.$window.mozRequestAnimationFrame
          || this.di.$window.oRequestAnimationFrame
          || this.di.$window.msRequestAnimationFrame
          || (function(callback) {
            this.di.$window.setTimeout(callback, 1000 / 60);
          }).call(this);
      }).call(this);

      this.height = 0;
      this.width = 0;
      this.spineContainer = null;
      this.leafContainer = null;
      this.otherContainer = null;
      this.spineContainerLeftNode = null;
      this.spineContainerRightNode = null;
      this.spineContainerText = null;

      this.leafContainerLeftNode = null;
      this.leafContainerRightNode = null;
      this.leafContainerText = null;

      this.otherContainerLeftNode = null;
      this.otherContainerRightNode = null;
      this.otherContainerText = null;

      this.paths = [];
      this.pathNodes = {};

      this.hosts = [];
      this.hostNodes = {};


      scope.selectedDeviceId = null;

      let DeviceType = {
        'leaf':'leaf',
        'spine':'spine',
        'other':'other'
      };
      this.stage = null;
      this.scene = null;

      this.spines = {};
      this.leafs = {};
      this.others = {};

      this.links = {};
      this.switchLocation = {};

      this.switch_width = 16;
      this.switch_height = 108;
      this.leaf_group_interval = 15;
      this.leaf_group_str = 'leaf_group_name';
      // this.leaf_group_str = 'id';
      this.resizeTimeout = null;
      this.active_status = "ACTIVE";
      this.LINE_WIDTH = 1;
      this.LINE_SELECTED = '136,234,136';
      this.LINE_NORMAL = '240,240,240';
      this.LINE_ERROR = "255,0,0";
      this.oldWidth = null;


      this.host_width = 48;
      this.host_height = 48;
      this.host_min_interval = 10;
      this.PATH_LINE_WIDTH = 3;
      this.PATH_LINE_SELECTED = '236,234,136';

      const EDGE_TYPE = 'EDGE';
      const DIRECT_TYPE = 'DIRECT';
      const LINK_ACTIVE_STATE = 'ACTIVE';


      let easingService = this.di.easingService;
      let switchLocation = this.switchLocation;

      let initialize = () => {
        let canvas = document.getElementById('canvas');

        this.stage = new JTopo.Stage(canvas); // 创建一个舞台对象
        this.scene = new JTopo.Scene(this.stage);

        this.spineContainer = new JTopo.Container();
        this.leafContainer = new JTopo.Container();
        this.otherContainer = new JTopo.Container();
        //无法阻止事件不冒泡，所以不能通过点击scene事件来取消显示右侧的内容
        // this.scene.click(function (e) {
        //   console.log("scene click");
        // })

        this.spineContainer.click(function (e) {
          unSelectNode();
        });

        this.leafContainer.click(function (e) {
          unSelectNode();
        });

        this.otherContainer.click(function (e) {
          unSelectNode();
        });

        this.spineContainer.fillColor = this.getColor()['CONTAINER_FILL'];
        // this.leafContainer.fillColor = '239,239,239';
        this.leafContainer.fillColor = this.getColor()['CONTAINER_FILL'];
        this.otherContainer.fillColor = this.getColor()['CONTAINER_FILL'];

        this.spineContainer.alpha = 1;
        this.leafContainer.alpha = 1;
        this.otherContainer.alpha = 1;

        this.spineContainer.dragable = false;
        this.leafContainer.dragable = false;
        this.otherContainer.dragable = false;

        this.spineContainer.showSelected = false;
        this.leafContainer.showSelected = false;
        this.otherContainer.showSelected = false;

        this.scene.add(this.spineContainer);
        this.scene.add(this.leafContainer);
        this.scene.add(this.otherContainer);

        setTimeout(delayInit,200);
      };

      let delayInit = () =>{
        genSpine();
        genLeaf();
        genOther();

        // if(scope.topoSetting.show_links){
        //   genLinks()
        // }
        resize(true);
      };

      let genSpine = () =>{
        this.spineContainerLeftNode = genAnchorNode();
        this.spineContainerRightNode = genAnchorNode();
        this.spineContainerText = genTextNode("Spine Switch");

        this.spineContainer.add(this.spineContainerLeftNode);
        this.spineContainer.add(this.spineContainerRightNode);

        this.di._.forEach(scope.spines, (spine, key) => {
          this.spines[spine.id] = genNormalNode(spine.id, DeviceType.spine, spine.ports, spine.available);
        });

      };

      let genLeaf = () =>{
        this.leafContainerLeftNode = genAnchorNode();
        this.leafContainerRightNode = genAnchorNode();
        this.leafContainerText = genTextNode("Leaf Switch");

        this.leafContainer.add(this.leafContainerLeftNode);
        this.leafContainer.add(this.leafContainerRightNode);


        this.di._.forEach(scope.leafs, (leaf, key) => {
          this.leafs[leaf.id] = genNormalNode(leaf.id, DeviceType.leaf, leaf.ports, leaf.available);
        });


      };

      let genOther = () => {
        this.otherContainerLeftNode = genAnchorNode();
        this.otherContainerRightNode = genAnchorNode();
        this.otherContainerText = genTextNode("Other Switch");

        this.otherContainer.add(this.otherContainerLeftNode);
        this.otherContainer.add(this.otherContainerRightNode);


        this.di._.forEach(scope.others, (other, key) => {
          this.others[other.id] = genNormalNode(other.id, DeviceType.other, other.ports, other.available);
        });

      };

      let genLinks = () => {
          if(scope.topoSetting.show_links === 2){
            crushLinks();

            this.di._.forEach(scope.links, (link, key) => {
              let deviceIds = [link.src.device, link.dst.device];
              let ports = [link.src.port, link.dst.port];
              let linkId = getLinkId(deviceIds, ports);
              if(this.links[linkId]){
                return;
              }
              this.links[linkId] = genLinkNode(deviceIds, linkId);
              if(link.state != this.active_status){
                this.links[linkId].strokeColor = this.LINE_ERROR;
              }
            });

            // console.log(scope.links)

            genPeerLinks();
          }
      };

      let genPeerLink = (devices, linkId, isOk) =>{
        let nodeA = this.leafs[devices[0]] || this.spines[devices[0]] || this.others[devices[0]];
        let nodeB = this.leafs[devices[1]] || this.spines[devices[1]] || this.others[devices[1]];

        let link = new JTopo.Link(nodeA, nodeB);
        link.zIndex = 20;
        link.linkId = linkId;
        link.dashedPattern = 5;
        link.lineWidth = this.LINE_WIDTH;
        link.strokeColor = this.LINE_SELECTED;
        link.dragable = false;
        if(!isOk){
          link.strokeColor = this.LINE_ERROR;
        }
        // link.mouseover(linkMouseOverHandler);
        // link.mouseout(linkMouseOutHandler);

        this.scene.add(link);
        return link;
      };

      let crushLinks =()=>{
        this.di._.forEach(this.links, (link, key) => {
          this.scene.remove(link);
        });

        delete this.links;
        this.links = {};
      };

      let getLinkId = (deviceIds, ports) =>{
        let newDeviceIds = this.di._.sortBy(deviceIds);
        if(newDeviceIds[0] !== deviceIds[0]){
          let tmp = ports[0];
          ports[0] = ports[1];
          ports[1] = tmp;
        }
        return newDeviceIds[0] + ':' + ports[0] + '_' + newDeviceIds[1] + ':' + ports[1];
      };


      let _checkPortState = (device, port)=>{
        let state = false;
        this.di._.forEach(scope.links, (link)=>{
          if((link.src.device === device.id && link.src.port === String(port)) || (link.dst.device === device.id && link.dst.port === String(port))){
            if(link.state === 'ACTIVE'){
              state = true;
              return false;
            }
          }
        });
        return state
      };

      let _checkPeerLinksState = (memberDict) =>{
        let keys = this.di._.keys(memberDict);
        let isOk = true;
        this.di._.forEach(keys, (key)=>{
          // let device = this.leafs[key] || this.spines[key] || this.others[key];
          let device = this.di._.find(scope.leafs,{'id':key});
          if(device){
            // TODO 目前用的是交换机 leafgroup中的port， 后面如果switch port 不起作用，那么要用memberDict中的port
            isOk = _checkPortState(device, device.leafGroup.switch_port);
            if(isOk === false){
              return false;
            }
          } else {
            console.log('[topo.js > _checkPeerLinksState()] Device '+ key + ' 找不到');
          }

        });
        return isOk;
      };

      let genPeerLinks = ()=> {
        this.di._.forEach(scope.logicalPorts, (logicalPort)=>{
          if(logicalPort.is_mlag){
            let memberDict = this.di._.groupBy(logicalPort.members, 'device_id');
            let isPeerLinkOk = _checkPeerLinksState(memberDict);

            let keys = this.di._.keys(memberDict);
            let newKeys = this.di._.sortBy(keys);
            let linkId =  newKeys[0] + '__' + newKeys[1];
            console.log('genPeerLinks  ====== >' + linkId);
            this.links[linkId] = genPeerLink(newKeys,linkId, isPeerLinkOk)
          }
        })
      };


      let genLinkNode = (devices, linkId) => {
        let nodeA = this.leafs[devices[0]] || this.spines[devices[0]] || this.others[devices[0]];
        let nodeB = this.leafs[devices[1]] || this.spines[devices[1]] || this.others[devices[1]];

        let link = new JTopo.Link(nodeA, nodeB);
        link.zIndex = 20;
        link.linkId = linkId;
        link.lineWidth = this.LINE_WIDTH;
        link.strokeColor = this.LINE_SELECTED;
        link.dragable = false;

        link.mouseover(linkMouseOverHandler);
        link.mouseout(linkMouseOutHandler);

        this.scene.add(link);
        return link;
      };

      let draw = (width) =>{

        let avgHeight = this.height/3;
        let spineInterval = calcInterval(scope.spines, width);
        //leaf有分组，需要特殊处理
        let leafInterval = calcLeafInterval(scope.leafs, width);
        let otherInterval = calcInterval(scope.others, width);

        let spineKeys = this.di._.keys(this.spines);
        spineKeys = this.di._.sortBy(spineKeys);
        for(let i = 0; i< spineKeys.length; i++){
          let key = spineKeys[i];
          let node = this.spines[key];
          let x = (i + 1) * spineInterval + i * this.switch_width;
          let y =  (avgHeight - this.switch_height)/2;
          node.setLocation(x, y);
          this.switchLocation[key] = [x, y];
        }
        this.spineContainerText.setLocation(10, 10);


        let leaf_group_str = this.leaf_group_str;
        let non_leafs = this.di._.filter(scope.leafs, function (leaf) {
          return leaf[leaf_group_str] === null;
        });

        let leaf_groups_t = this.di._.filter(scope.leafs, function (leaf) {
          return leaf[leaf_group_str] !== null;
        });

        let leaf_groups = this.di._.groupBy(leaf_groups_t, leaf_group_str);
        let orderKeys = this.di._.keys(leaf_groups);
        let last_x = 0;
        for(let i = 0; i< orderKeys.length; i++){
          let key = orderKeys[i];
          let leaf_group = leaf_groups[key]; //arr
          for(let j = 0; j < leaf_group.length; j ++){
            let node = this.leafs[leaf_group[j].id];
            let y = (avgHeight - this.switch_height)/2 + avgHeight;
            let x = last_x + leafInterval + j * (this.switch_width + this.leaf_group_interval);
            node.setLocation(x, y);

            this.switchLocation[leaf_group[j].id] = [x, y];

          }
          // last_x = last_x + leafInterval +(this.switch_width + this.leaf_group_interval)* leaf_group.length;
          last_x = last_x + leafInterval + this.switch_width* leaf_group.length + this.leaf_group_interval * (leaf_group.length-1) ;
        }
        if(non_leafs instanceof Array){
          for(let j = 0; j< non_leafs.length; j ++){
            let node = this.leafs[non_leafs[j].id];
            let y = (avgHeight - this.switch_height)/2 + avgHeight;
            let x = last_x + leafInterval;
            node.setLocation(x, y);
            this.switchLocation[non_leafs[j].id] = [x, y];


            last_x = last_x + leafInterval + this.switch_width*1;
          }
        }

        this.leafContainerText.setLocation(10, 10 + avgHeight);

        let otherKeys = this.di._.keys(this.others);
        otherKeys = this.di._.sortBy(otherKeys);
        for(let i = 0; i< otherKeys.length; i++){
          let key = otherKeys[i];
          let node = this.others[key];
          let x = (i + 1) * otherInterval + i * this.switch_width;
          let y =  (avgHeight - this.switch_height)/2 + avgHeight * 2;
          node.setLocation(x, y);
          this.switchLocation[key] = [x, y];
        }
        this.otherContainerText.setLocation(10, 10 + avgHeight*2);

        relocateHost();
      };

      let calcInterval = (nodes, width) =>{
        return (width - this.switch_width * nodes.length)/(nodes.length + 1)
      };

      let calcLeafInterval = (leafs, width) =>{
        // let remainWidth = width - this.switch_width * leafs.length;
        // let null_length = 0;
        // let leaf_group_str = this.leaf_group_str;
        // let non_leafs = this.di._.filter(leafs, function (leaf) {
        //   return leaf[leaf_group_str] === null;
        // });
        //
        // if(non_leafs instanceof  Array) null_length = non_leafs.length;
        //
        // let c_leafs = this.di._.filter(leafs, function (leaf) {
        //   return leaf[leaf_group_str] !== null;
        // });

        // let group = this.di._.groupBy(c_leafs, this.leaf_group_str);
        // let groupLen = this.di._.keys(group).length + null_length;
        // remainWidth = remainWidth - groupLen * this.leaf_group_interval;
        // return remainWidth/ (groupLen + 1);
        return (width - this.switch_width * leafs.length)/(leafs.length + 1)
      };

      let genAnchorNode = () =>{
        let node = new JTopo.Node();
        node.dragable = false ;
        node.width = 0;
        node.showSelected =false;
        node.fillColor = "rgba(0,0,0,.2)";

        this.scene.add(node);
        return node;
      };

      let genTextNode = (text) =>{
        let node = new JTopo.Node(text);
        node.dragable = false ;
        node.showSelected =false;
        node.font = '16px 微软雅黑';
        node.fontColor = "255,255,255";
        node.fillColor = "rgba(0,0,0,.2)";
        node.textPosition = 'Middle_Center';
        node.borderRadius = 3;
        node.width = 100;
        node.height = 25;
        this.scene.add(node);
        return node;
      };

      let genNormalNode = (deviceId, type, ports, status) =>{
        let node = new JTopo.Node();
        node.dragable = true ;
        node.width = this.switch_width;
        node.height = this.switch_height;
        node.showSelected =true;
        node.deviceId = deviceId;
        node.deviceType = type;
        node.move = false;
        node.status = status;

        node.mouseup(mouseUpHandler);
        node.mousedrag(mouseDragHandler);
        node.mouseover(mouseOverHandler);
        node.mouseout(mouseOutHandler);
        node.click(clickHandler);

        //根据实际的端口数来
        // let count = ports.length;
        //超过48个端口len为2，根据实际情况来
        let len = 2.5;
        let height = this.switch_height;
        let width = this.switch_width;
        let status_normal = '#81FF1A';
        let status_error = 'rgb(255,0,0)';
        let top = 4;

        let self = this;
        node.paint = function(g){
          g.beginPath();
          g.rect(-width/2, -height/2, width, height);

          if(node.status === false){
            g.fillStyle ='rgb(255,0,0)';
          } else {
            g.fillStyle = self.getNodeColor();
          }
          g.fill();
          g.closePath();

          if(scope.topoSetting.show_ports && ports && ports instanceof Array && ports.length > 0){
            if(ports.length > 60){
              len = 1.8;
            }
            let padding = (width - len * 2)/3;
            let left = - width/2 + padding;
            let right = width/2 -padding - len;
            // top = 8;
            for(let i = 0; i< ports.length ; i++){
              let port = ports[i];
              g.beginPath();
              if(i % 2 === 0){
                g.rect(left, -height/2 +  top + parseInt(i/2) * (len + 1), len , len);
              } else {
                g.rect(right, -height/2 + top + parseInt(i/2) * (len + 1), len , len);
              }
              g.fillStyle = status_normal;
              if(!port.isEnabled){
                g.fillStyle = status_error;
              }
              g.fill();
              g.closePath();
            }
          }

          this.paintText(g);
        };

        this.scene.add(node);
        return node;
      };

      let genHostNode = (host) =>{
        let node = new JTopo.Node();
        node.dragable = true ;
        node.width = this.host_width;
        node.height = this.host_height;
        node.showSelected =true;
        // node.ip_address = ipAddresses;
        node.hostId = host['id'];
        node.connect_swt = host['connect_swt'];
        node.move = false;
        let hostImageUrl = require('../../../assets/images/compute.png');
        node.setImage(hostImageUrl, true);

        node.click(hostClickHandler);

        this.scene.add(node);

        return node;
      };

      let genHostSwitchLink = (hostId, deviceId,devicePort, isActive,isAgainst) =>{
        let swt = this.leafs[deviceId] || this.spines[deviceId] || this.others[deviceId];
        let host = this.hostNodes[hostId];
        let link;
        if(isAgainst){
          link = new JTopo.Link(swt, host);
          link.src_port = devicePort;
        } else {
          link = new JTopo.Link(host, swt);
          link.dst_port = devicePort;
        }
        link.arrowsRadius = 15;

        link.zIndex = 100;
        link.lineWidth = this.PATH_LINE_WIDTH;

        if(isActive)
          link.strokeColor = this.PATH_LINE_SELECTED;
        else
          link.strokeColor = this.LINE_ERROR;

        // link.strokeColor = this.PATH_LINE_SELECTED;
        link.dragable = false;

        // node.mouseover(pathMouseOverHandler);
        // node.mouseout(pathMouseOverHandler);
        link.click(pathClickHandler);

        this.scene.add(link);
        return link;
      };

      function pathClickHandler(evt) {
        let startNode = this.nodeA;
        let endNode = this.nodeZ;
        let param = {'start':{}, 'end':{}};
        if(startNode.hostId){
          param.start['type'] = 'HOST';
          param.start['id'] = startNode.hostId;
        } else {
          param.start['type'] = 'SWITCH';
          param.start['id'] = startNode.deviceId;
          param.start['port'] = this.src_port;
        }

        if(endNode.hostId){
          param.end['type'] = 'HOST';
          param.end['id'] = endNode.hostId;
        } else {
          param.end['type'] = 'SWITCH';
          param.end['id'] = endNode.deviceId;
          param.end['port'] = this.dst_port;
        }

        DI.$rootScope.$emit("path_select",{event:evt, value: param});
      }

      // let pathMouseOutHandler = (evt) => {
      //   // console.log('node mouse out');
      //     this.di.$rootScope.$emit("hide_path_tooltip");
      // };

      let relocateHost = () =>{
        let y = (this.height/3 - this.host_height)/2 + this.height/3 * 2;
        let lastX = -1;
        this.di._.forEach(this.hosts, (hostDict)=>{
          let hostNode = this.hostNodes[hostDict['id']];
          let swtId = hostNode.connect_swt;
          let swtX = this.switchLocation[swtId][0];
          if(lastX !== -1){
            if(swtX - lastX < this.host_width + this.host_min_interval){
              lastX = lastX + this.host_width + this.host_min_interval;
            } else {
              lastX = swtX + this.host_width;
            }
          } else {
            lastX = swtX - this.host_width;
          }
          hostNode.setLocation(lastX, y);
        })
      };

      let genAllHosts = () =>{

        this.di._.forEach(this.hosts, (host)=>{
          this.hostNodes[host['id']] = genHostNode(host);
        });
      };

      let genPathLinkNode = (devices, ports, isActive) => {
        let nodeA = this.leafs[devices[0]] || this.spines[devices[0]] || this.others[devices[0]];
        let nodeB = this.leafs[devices[1]] || this.spines[devices[1]] || this.others[devices[1]];

        let link = new JTopo.Link(nodeA, nodeB);
        link.arrowsRadius = 15;
        link.zIndex = 100;
        link.lineWidth = this.PATH_LINE_WIDTH;
        if(isActive)
          link.strokeColor = this.PATH_LINE_SELECTED;
        else
          link.strokeColor = this.LINE_ERROR;
        link.dragable = false;
        link.src_port =ports[0];
        link.dst_port =ports[1];

        link.click(pathClickHandler);

        // node.mouseover(pathMouseOverHandler);
        // node.mouseout(pathMouseOverHandler);
        this.scene.add(link);
        return link;
      };

      let genAllPathLinks = () =>{
        this.di._.forEach(this.paths, (path)=>{
          let src_arr = path['src'].split('/');
          let dst_arr = path['dst'].split('/');
          if(src_arr.length === 2 && dst_arr.length === 2){
            let deviceIds = [src_arr[0], dst_arr[0]];
            let ports = [src_arr[1], dst_arr[1]];
            let linkId = getLinkId(deviceIds, ports);
            this.pathNodes[linkId] = genPathLinkNode(deviceIds, ports, path['state'] === LINK_ACTIVE_STATE);
          } else {
            let hostId = null, deviceId = null, devicePort = null;
            let isAgainst = false;
            if(src_arr.length === 3){
              hostId = src_arr[0] + '/' +src_arr[1];
              deviceId = dst_arr[0];
              devicePort = dst_arr[1];
            }
            if(dst_arr.length === 3){
              isAgainst = true;
              hostId = dst_arr[0] + '/' +dst_arr[1];
              deviceId = src_arr[0];
              devicePort = src_arr[1];
            }
            this.pathNodes[hostId+'_'+deviceId] = genHostSwitchLink(hostId, deviceId,devicePort, path.state === LINK_ACTIVE_STATE, isAgainst)
          }
        });
      };

      let showPath = () =>{
        let hosts = [];
        this.di._.forEach(this.paths, (path)=>{
          if(path['type'] === EDGE_TYPE){
            let host = {};
            let src_arr = path['src'].split('/');
            let dst_arr = path['dst'].split('/');
            if(src_arr.length === 3){
              host['id'] =  src_arr[0] + '/' +src_arr[1];
              host['connect_swt'] = dst_arr[0];
              host['swt_x'] = this.switchLocation[dst_arr[0]]?this.switchLocation[dst_arr[0]][0]:0;
            }
            if(dst_arr.length === 3){
              host['id'] =  dst_arr[0] + '/' +dst_arr[1];
              host['connect_swt'] = src_arr[0];
              host['swt_x'] = this.switchLocation[src_arr[0]]?this.switchLocation[src_arr[0]][0]:0;
            }
            hosts.push(host);
          }
        });
        this.hosts = this.di._.sortBy(hosts, ['swt_x']);
        genAllHosts();
        genAllPathLinks();

        relocateHost()
      };

      let clearPath= ()=>{
        this.di._.forEach(this.hostNodes, (node, key)=>{
          this.scene.remove(node);
        });

        this.di._.forEach(this.pathNodes, (node, key)=>{
          this.scene.remove(node);
        });
        this.paths = [];
        this.pathNodes = {};

        this.hosts = [];
        this.hostNodes = {};

      };


      function hostClickHandler(evt){
        let hostId = this.hostId;
        DI.$rootScope.$emit("host_select",{event:evt, id: hostId});
      }

      function mouseUpHandler(evt){
        if(this.move){
          // console.log("move");
          let oldLocation = switchLocation[this.deviceId];
          let curLocation = this.getLocation();
          let node = this;
          let starttime = (new Date()).getTime();
          setTimeout(goBack_Animate(oldLocation, curLocation.x, curLocation.y,starttime, node))
        } else {
          // console.log("click");
          // console.log(this.deviceId);
          if(evt.button == 2){// 右键

            if(scope.topoSetting.show_tooltips){
              DI.$rootScope.$emit("hide_tooltip");
            }

            // unSelectNode();
            scope.selectedDeviceId  = null;
            if(scope.topoSetting.show_links !== 2){
              crushLinks();
            }

            DI.$rootScope.$emit("switch_opt",{event: evt, id: this.deviceId});
          }

        }
        this.move = false;
      }
      function goBack_Animate(oldLocation, nowX, nowY,starttime, node){
        let time = (new Date()).getTime() - starttime;
        if(time > 1000) {
          node.setLocation(oldLocation[0], oldLocation[1]);
          return;
        }
        let percentage = time/1000;
        let nP = easingService.easeInOutCubic(percentage);
        let curX = (oldLocation[0] - nowX) * nP + nowX;
        let curY = (oldLocation[1] - nowY) * nP+ nowY;
        node.setLocation(curX, curY);
        requestAnimFrame(function () {
          goBack_Animate(oldLocation, nowX, nowY, starttime, node);
        })
      }

      function mouseDragHandler(data){
        this.move = true;
      }

      function genHtml() {
        
      }

      function mouseOverHandler(evt) {
        let deviceId =  this.deviceId;
        let deviceType = this.deviceType;

        let showArray= [];

        if(deviceType == DeviceType.spine){
          let sw = DI._.find(scope.spines,{'id':deviceId});
          showArray = DI.switchService.getSpineShowInfo(sw);
        } else if(deviceType == DeviceType.leaf){
          let sw = DI._.find(scope.leafs,{'id':deviceId});
          showArray = DI.switchService.getLeafShowInfo(sw);
        } else if(deviceType == DeviceType.other){
          let sw = DI._.find(scope.others,{'id':deviceId});
          showArray = DI.switchService.getOtherShowInfo(sw);
        } else {
          return;
        }
        // console.log('node mouse over');
        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("show_tooltip",{event:evt, value: showArray});
        }
      }

      let mouseOutHandler = (evt) => {
        // console.log('node mouse out');
        if(scope.topoSetting.show_tooltips){
          this.di.$rootScope.$emit("hide_tooltip");
        }
      };

      let _completeDeviceName4FlowInfo = (detail) =>{
        let res = angular.copy(detail);
        let src = detail.src.device;
        let dst = detail.dst.device;

        let src_sw = DI._.find(scope.spines,{'id':src}) || DI._.find(scope.leafs,{'id':src})||DI._.find(scope.others,{'id':src});
        let dst_sw = DI._.find(scope.spines,{'id':dst}) || DI._.find(scope.leafs,{'id':dst})||DI._.find(scope.others,{'id':dst});
        res.src.device_name = src_sw.name;
        res.dst.device_name = dst_sw.name;
        return res;
      };

      function linkMouseOverHandler(evt) {
        if(scope.topoSetting.show_monitor){
          if(this._flow_detail){
            let res = _completeDeviceName4FlowInfo(this._flow_detail);
            DI.$rootScope.$emit("show_link_tooltip",{event:evt, value: res});
          }
        }
      }

      let  linkMouseOutHandler = (evt) => {
        // console.log('node mouse out');
        if(scope.topoSetting.show_monitor){
          this.di.$rootScope.$emit("hide_link_tooltip");
        }
      };

      function clickHandler(evt) {
        let deviceId =  this.deviceId;
        let deviceType = this.deviceType;
        let showArray= [];
        scope.selectedDeviceId  = deviceId;
        showDeviceLinks(deviceId);


        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("hide_tooltip");
        }


        if(deviceType == DeviceType.spine){
          let sw = DI._.find(scope.spines,{'id':deviceId});
          showArray = DI.switchService.getSpineShowInfo(sw);
        } else if(deviceType == DeviceType.leaf){
          let sw = DI._.find(scope.leafs,{'id':deviceId});
          showArray = DI.switchService.getLeafShowInfo(sw);
        } else if(deviceType == DeviceType.other){
          let sw = DI._.find(scope.others,{'id':deviceId});
          showArray = DI.switchService.getOtherShowInfo(sw);
        } else {
          return;
        }
        DI.$rootScope.$emit("switch_select",{event:evt, id: this.deviceId, type: deviceType, value: showArray});
      }

      let showDeviceLinks = (deviceId) =>{
        if(scope.topoSetting.show_links === 1){
          crushLinks();
          this.di._.forEach(scope.links, (link, key) => {
            if(deviceId == link.src.device){
              let deviceIds = [link.src.device, link.dst.device];
              let ports = [link.src.port, link.dst.port];
              let linkId = getLinkId(deviceIds, ports);
              if(this.links[linkId]){
                return;
              }
              this.links[linkId] = genLinkNode(deviceIds, linkId);
              // this.links[linkId].lineWidth = 3;
              this.links[linkId].strokeColor = this.LINE_SELECTED;
              if(link.state != this.active_status){
                this.links[linkId].strokeColor = this.LINE_ERROR;
              }
            }
          });
        }
      };


      /*
      负责给container加上两个隐藏的node，用来固定整个容器
       */
      let layout = () =>{
        let avgHeight = this.height/3;

        this.spineContainerLeftNode.setLocation(0,0);
        this.spineContainerRightNode.setLocation(this.width,0);

        this.spineContainerLeftNode.height = avgHeight;
        this.spineContainerRightNode.height = avgHeight;

        this.leafContainerLeftNode.setLocation(0, avgHeight);
        this.leafContainerRightNode.setLocation(this.width, avgHeight);

        this.leafContainerLeftNode.height = avgHeight;
        this.leafContainerRightNode.height = avgHeight;

        this.otherContainerLeftNode.setLocation(0, avgHeight*2);
        this.otherContainerRightNode.setLocation(this.width, avgHeight*2);

        this.otherContainerLeftNode.height = avgHeight;
        this.otherContainerRightNode.height = avgHeight;
      };

      let resize = (isInit) => {

        let parentNode = element[0].parentNode;
        this.width = parentNode.offsetWidth;
        this.height = parentNode.offsetHeight;

        let canvas = document.getElementById('canvas');

        if(this.oldWidth === null ||  this.oldWidth === undefined){
          this.oldWidth = canvas.width;
        }

        canvas.width = this.width;
        canvas.height = this.height;

        let context = canvas.getContext('2d');
        context.shadowColor = 'rgba(0, 0, 0, 0.2)';
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 5;
        context.shadowBlur = 5;
        layout();
        let starttime = (new Date()).getTime();
        if(this.resizeTimeout){
          // console.log(this.di.$timeout.cancel(this.resizeTimeout));
          this.di.$timeout.cancel(this.resizeTimeout);
        }
        if(isInit){
          delayDraw();
        } else{
          this.resizeTimeout = this.di.$timeout(function () {
            delayDraw()
          }, 200);
        }
      };

      let delayDraw =()=> {
        let oldWidth = this.oldWidth;
        this.oldWidth =  null;
        // console.log(oldWidth);
        let starttime = (new Date()).getTime();
        // console.log(":==" + oldWidth);
        dynamicDraw(starttime, oldWidth);
      };

      let dynamicDraw = (starttime, oldWidth) => {
        let testT = (new Date()).getTime();
        let time = (new Date()).getTime() - starttime;
        if(time > 1000) {
          draw(this.width);
          this.di.$rootScope.$emit('show_links');
          return;
        }
        let percentage = time/1000;
        let nP = easingService.easeInOutQuad(percentage);
        let width = (this.width - oldWidth) * nP + oldWidth;
        draw(width);
        requestAnimFrame(function () {
          dynamicDraw(starttime, oldWidth);
        });
      };

      initialize();

      let unSelectNode = () => {
        this.di.$rootScope.$emit("topo_unselect");
        scope.selectedDeviceId  = null;

        // this.di._.forEach(scope.links, (link, key) => {
        //   if(this.selectedDeviceId == link.src.device){
        //     let deviceIds = [link.src.device, link.dst.device];
        //     let linkId = getLinkId(deviceIds);
        //     if(!this.links[linkId]){
        //       return;
        //     }
        //     this.links[linkId].lineWidth = 1;
        //     this.links[linkId].strokeColor = this.LINE_NORMAL;
        //   }
        // });
        // this.selectedDeviceId  = null;
        if(scope.topoSetting.show_links !== 2){
          crushLinks();
        }
      };

      let crushAllPorts = () =>{
        this.di._.forEach(scope.spines, (spine, key) => {
          crushPorts(this.spines[spine.id])
        });

        this.di._.forEach(scope.leafs, (leaf, key) => {
          crushPorts(this.leafs[leaf.id])
        });

        this.di._.forEach(scope.others, (other, key) => {
          crushPorts(this.others[other.id])
        });
      };

      let genAllPorts = () =>{
        this.di._.forEach(scope.spines, (spine, key) => {
          genPorts(this.spines[spine.id], spine.ports)
        });

        this.di._.forEach(scope.leafs, (leaf, key) => {
          genPorts(this.leafs[leaf.id], leaf.ports)
        });

        this.di._.forEach(scope.others, (other, key) => {
          genPorts(this.others[other.id], other.ports)
        });
      };

      let crushPorts = (node) =>{
        let height = this.switch_height;
        let width = this.switch_width;

        let self = this;
        node.paint = function(g) {
          g.beginPath();
          g.rect(-width / 2, -height / 2, width, height);
          if(node.status === false){
            g.fillStyle ='rgb(255,0,0)';
          } else {
            g.fillStyle = self.getNodeColor();
          }
          g.fill();
          g.closePath();
          this.paintText(g);
        }
      };


      let genPorts = (node, ports) => {
        //根据实际的端口数来
        //超过48个端口len为2，根据实际情况来
        let len = 2.5;
        let height = this.switch_height;
        let width = this.switch_width;
        let status_normal = '#81FF1A';
        let status_error = 'rgb(255,0,0)';
        let top = 4;

        let self = this;
        node.paint = function(g){
          g.beginPath();
          g.rect(-width/2, -height/2, width, height);
          if(node.status === false){
            g.fillStyle ='rgb(255,0,0)';
          } else {
            g.fillStyle = self.getNodeColor();
          }
          g.fill();
          g.closePath();

          if(scope.topoSetting.show_ports && ports && ports instanceof Array && ports.length > 0) {
            if(ports.length > 60){
              len = 1.8;
            }

            let padding = (width - len * 2) / 3;
            let left = -width / 2 + padding;
            let right = width / 2 - padding - len;
            // top = 8;
            for (let i = 0; i < ports.length; i++) {
              let port = ports[i];
              g.beginPath();
              if (i % 2 === 0) {
                g.rect(left, -height / 2 + top + parseInt(i / 2) * (len + 1), len, len);
              } else {
                g.rect(right, -height / 2 + top + parseInt(i / 2) * (len + 1), len, len);
              }
              g.fillStyle = status_normal;
              if (!port.isEnabled) {
                g.fillStyle = status_error;
              }
              g.fill();
              g.closePath();
            }
          }
          this.paintText(g);
          // g.save();
          // g.restore();
        }
      };

      angular.element(this.di.$window).bind('resize', () => {
        console.log('exec resize');
        resize(false);
        // if(this.resizeTimeout){
        //   this.di.$timeout.cancel(this.resizeTimeout);
        // }
        // self.resizeTimeout = this.di.$timeout(resize, 500);
      });

      unsubscribers.push(this.di.$rootScope.$on('resize_canvas',() =>{
        console.log('receive resize_canvas');
        resize(false)
      }));

      // unsubscribers.push(this.di.$rootScope.$on('show_tooltips',()=>{
      //   if(scope.topoSetting.show_tooltips){
      //   } else {
      //   }
      // }));

      unsubscribers.push(this.di.$rootScope.$on('show_links',()=>{
        if(scope.topoSetting.show_links === 2){
          genLinks()
        } else if(scope.topoSetting.show_links === 0) {
          crushLinks();
        } else {
          crushLinks();
          if(scope.selectedDeviceId){
            showDeviceLinks(scope.selectedDeviceId);
          }
        }

      }));

      unsubscribers.push(this.di.$rootScope.$on('show_path',($event, params)=>{
        clearPath();
        this.paths = params;
        showPath();

      }));

      unsubscribers.push(this.di.$rootScope.$on('changeLinksColor',($event, params)=>{
        let links_color = params;
        let keys = this.di._.keys(links_color);
        this.di._.forEach(keys, (key)=>{
          if(this.links[key]){
            this.links[key].strokeColor =  links_color[key].color;
            this.links[key]._flow_detail = links_color[key];
          }
        });
      }));

      unsubscribers.push(this.di.$rootScope.$on('clearLinksColor',($event)=>{
        this.di._.forEach(this.links, (linkNode)=>{
          linkNode.strokeColor = this.LINE_SELECTED;
          linkNode._flow_detail = null;
        });
      }));



      unsubscribers.push(this.di.$rootScope.$on('hide_path',()=>{
        clearPath();
      }));

      unsubscribers.push(this.di.$rootScope.$on('show_ports',()=>{
        if(scope.topoSetting.show_ports){
          genAllPorts()
        } else {
          crushAllPorts()
        }
      }));

      scope.$on('$destroy', () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe();
        });
      });

    }).call(this);

    scope.$on('$destroy', ()=>{
      angular.element(this.di.$window).off('resize');
    });
  }



  getColor(){
    let theme = window.localStorage['userPrefs__theme'];
    if(theme && theme === 'theme_dark'){
      return {
        "CONTAINER_FILL": "40,40,40",
      };
    } else {
      return {
        "CONTAINER_FILL": "255,255,255",
      }
    }

  }


  getNodeColor(){
    let theme = window.localStorage['userPrefs__theme'];
    if(theme && theme === 'theme_dark'){
      return 'rgb(100,100,100)';
    } else {
      return 'rgb(0,0,0)';
    }
  }
}


Topo.$inject = Topo.getDI();
Topo.$$ngIsClass = true;