
export class Topo {
  static getDI () {
    return [
      '$rootScope',
      '$window',
      '$timeout',
      '$document',
      '_',
      'easingService'
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

      let DeviceType = {
        'leaf':'leaf',
        'spine':'spine',
        'other':'other'
      }
      this.stage = null;
      this.scene = null;

      this.spines = {};
      this.leafs = {};
      this.others = {};

      this.links = {};
      this.switchLocation = {};

      this.switch_width = 16;
      this.switch_height = 108;
      this.leaf_group_interval = 2;
      this.leaf_group_str = 'leaf_group';
      this.resizeTimeout = null;
      this.active_status = "ACTIVE";
      this.LINE_WIDTH = 3;
      this.LINE_NORMAL = '136,234,136';
      this.LINE_ERROR = "255,0,0";
      this.oldWidth = null;

      let easingService = this.di.easingService;
      let switchLocation = this.switchLocation;

      let initialize = () => {
        let canvas = document.getElementById('canvas');

        this.stage = new JTopo.Stage(canvas); // 创建一个舞台对象
        this.scene = new JTopo.Scene(this.stage);

        this.spineContainer = new JTopo.Container();
        this.leafContainer = new JTopo.Container();
        this.otherContainer = new JTopo.Container();

        this.spineContainer.fillColor = '255,255,255';
        // this.leafContainer.fillColor = '239,239,239';
        this.leafContainer.fillColor = '255,255,255';
        this.otherContainer.fillColor = '255,255,255';

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
        genLinks();
        resize(true);
      };

      let genSpine = () =>{
        this.spineContainerLeftNode = genAnchorNode();
        this.spineContainerRightNode = genAnchorNode();
        this.spineContainerText = genTextNode("Spine Switch");

        this.spineContainer.add(this.spineContainerLeftNode);
        this.spineContainer.add(this.spineContainerRightNode);

        this.di._.forEach(scope.spines, (spine, key) => {
          this.spines[spine.id] = genNormalNode(spine.id, DeviceType.spine);
        });

      };

      let genLeaf = () =>{
        this.leafContainerLeftNode = genAnchorNode();
        this.leafContainerRightNode = genAnchorNode();
        this.leafContainerText = genTextNode("Leaf Switch");

        this.leafContainer.add(this.leafContainerLeftNode);
        this.leafContainer.add(this.leafContainerRightNode);


        this.di._.forEach(scope.leafs, (leaf, key) => {
          this.leafs[leaf.id] = genNormalNode(leaf.id, DeviceType.leaf);
        });


      };

      let genOther = () => {
        this.otherContainerLeftNode = genAnchorNode();
        this.otherContainerRightNode = genAnchorNode();
        this.otherContainerText = genTextNode("Other Switch");

        this.otherContainer.add(this.otherContainerLeftNode);
        this.otherContainer.add(this.otherContainerRightNode);


        this.di._.forEach(scope.others, (other, key) => {
          this.others[other.id] = genNormalNode(other.id, DeviceType.other);
        });

      };

      let genLinks = () => {
          if(scope.topoSetting.show_links){
            this.di._.forEach(scope.links, (link, key) => {
              let deviceIds = [link.src.device, link.dst.device];
              let linkId = getLinkId(deviceIds);
              this.links[linkId] = genLinkNode(deviceIds);
              if(link.state != this.active_status){
                this.links[linkId].strokeColor = this.LINE_ERROR;
              }
            });
          }
      };

      let crushLinks =()=>{
        this.di._.forEach(this.links, (link, key) => {
          this.scene.remove(link);
        });

        delete this.links;
        this.links = {};
      };

      let getLinkId = (deviceIds) =>{
        deviceIds = this.di._.sortBy(deviceIds);
        return deviceIds[0] + '_' + deviceIds[1];
      };

      let genLinkNode = (devices) => {
        let nodeA = this.leafs[devices[0]] || this.spines[devices[0]];
        let nodeB = this.leafs[devices[1]] || this.spines[devices[1]];

        let link = new JTopo.Link(nodeA, nodeB);
        link.zIndex = 20;
        link.lineWidth = this.LINE_WIDTH;
        link.strokeColor = this.LINE_NORMAL;
        link.dragable = false;

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

        let leaf_groups = this.di._.groupBy(scope.leafs, this.leaf_group_str);
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
          last_x = last_x + leafInterval +(this.switch_width + this.leaf_group_interval)* leaf_group.length;
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
      };

      let calcInterval = (nodes, width) =>{
        return (width - this.switch_width * nodes.length)/(nodes.length + 1)
      };

      let calcLeafInterval = (leafs, width) =>{
        let remainWidth = width - this.switch_width * leafs.length;
        let group = this.di._.groupBy(leafs, this.leaf_group_str);
        return remainWidth/ (this.di._.keys(group).length + 1);
      };

      let genAnchorNode = () =>{
        let node = new JTopo.Node();
        node.dragable = false ;
        node.width = 0;
        node.showSelected =false;
        node.fillColor = "255.255.255";

        this.scene.add(node);
        return node;
      };

      let genTextNode = (text) =>{
        let node = new JTopo.Node(text);
        node.dragable = false ;
        node.showSelected =false;
        node.font = '16px 微软雅黑';
        node.fontColor = "255,255,255";
        node.fillColor = '200,200,200';
        node.textPosition = 'Middle_Center';
        node.borderRadius = 3;
        node.width = 100;
        node.height = 25;
        this.scene.add(node);
        return node;
      };

      let genNormalNode = (deviceId, type) =>{
        let node = new JTopo.Node();
        node.dragable = true ;
        node.width = this.switch_width;
        node.height = this.switch_height;
        node.showSelected =true;
        node.deviceId = deviceId;
        node.deviceType = type;
        node.move = false;

        node.mouseup(mouseUpHandler);
        node.mousedrag(mouseDragHandler);
        node.mouseover(mouseOverHandler);
        node.mouseout(mouseOutHandler);
        //根据实际的端口数来
        let count = 36;
        //超过48个端口len为2，根据实际情况来
        let len = 3;
        let height = this.switch_height;
        let width = this.switch_width;
        let status_normal = '#81FF1A';
        let status_error = 'rgb(255,0,0)';
        let top = 8;

        node.paint = function(g){
          g.beginPath();
          g.rect(-width/2, -height/2, width, height);
          g.fillStyle = 'rgba(0,0,0)';
          g.fill();
          g.closePath();

          if(scope.topoSetting.show_ports){
            let padding = (width - len * 2)/3;
            let left = - width/2 + padding;
            let right = width/2 -padding - len;
            // top = 8;
            for(let i = 0; i< count ; i++){
              g.beginPath();
              if(i % 2 === 0){
                g.rect(left, -height/2 +  top + parseInt(i/2) * (len + 1), len , len);
              } else {
                g.rect(right, -height/2 + top + parseInt(i/2) * (len + 1), len , len);
              }
              g.fillStyle = status_normal;
              if(i%10 === 0){
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

      function mouseUpHandler(data){
        if(this.move){
          console.log("move");
          let oldLocation = switchLocation[this.deviceId];
          let curLocation = this.getLocation();
          let node = this;
          let starttime = (new Date()).getTime();
          setTimeout(goBack_Animate(oldLocation, curLocation.x, curLocation.y,starttime, node))
        } else {
          console.log("click");
          console.log(this.deviceId);

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
        let nP = easingService.easeOutElastic(percentage);
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

        let innerHtml = '';
        let showArray= [];
        if(deviceType == DeviceType.spine){
          let sw = DI._.find(scope.spines,{'id':deviceId});

          showArray.push({'label': 'id', 'value': sw.id})
          showArray.push({'label': 'type', 'value': sw.type})
          showArray.push({'label': 'available', 'value': sw.available})
          showArray.push({'label': 'MAC', 'value': sw.mac})
          showArray.push({'label': 'connect since', 'value': sw.lastUpdate})
          showArray.push({'label': 'Management Address', 'value': sw.managementAddress})
          showArray.push({'label': 'rack_id', 'value': sw.rack_id})

        } else if(deviceType == DeviceType.leaf){

        } else if(deviceType == DeviceType.other){

        } else {

        }

        console.log('node mouse over');
        if(scope.topoSetting.show_tooltips){
          DI.$rootScope.$emit("show_tooltip",{event:evt, value: showArray});
        }
      }


      let mouseOutHandler = (evt) => {
        console.log('node mouse out');
        if(scope.topoSetting.show_tooltips){
          this.di.$rootScope.$emit("hide_tooltip");
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
          console.log(this.di.$timeout.cancel(this.resizeTimeout));
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
        console.log(":==" + oldWidth);
        dynamicDraw(starttime, oldWidth);
      };

      let dynamicDraw = (starttime, oldWidth) => {
        let testT = (new Date()).getTime();
        let time = (new Date()).getTime() - starttime;
        if(time > 1000) {
          draw(this.width);
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
          genPorts(this.spines[spine.id])
        });

        this.di._.forEach(scope.leafs, (leaf, key) => {
          genPorts(this.leafs[leaf.id])
        });

        this.di._.forEach(scope.others, (other, key) => {
          genPorts(this.others[other.id])
        });
      };

      let crushPorts = (node) =>{
        let height = this.switch_height;
        let width = this.switch_width;
        node.paint = function(g) {
          g.beginPath();
          g.rect(-width / 2, -height / 2, width, height);
          g.fillStyle = 'rgba(0,0,0)';
          g.fill();
          g.closePath();
          this.paintText(g);
        }
      };


      let genPorts = (node) => {
        //根据实际的端口数来
        let count = 36;
        //超过48个端口len为2，根据实际情况来
        let len = 3;
        let height = this.switch_height;
        let width = this.switch_width;
        let status_normal = '#81FF1A';
        let status_error = 'rgb(255,0,0)';
        let top = 8;
        node.paint = function(g){
          g.beginPath();
          g.rect(-width/2, -height/2, width, height);
          g.fillStyle = 'rgba(0,0,0)';
          g.fill();
          g.closePath();

          let padding = (width - len * 2)/3;
          let left = - width/2 + padding;
          let right = width/2 -padding - len;
          // top = 8;
          for(let i = 0; i< count ; i++){
            g.beginPath();
            if(i % 2 === 0){
              g.rect(left, -height/2 +  top + parseInt(i/2) * (len + 1), len , len);
            } else {
              g.rect(right, -height/2 + top + parseInt(i/2) * (len + 1), len , len);
            }
            g.fillStyle = status_normal;
            if(i%10 === 0){
              g.fillStyle = status_error;
            }
            g.fill();
            g.closePath();
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
        if(scope.topoSetting.show_links){
          genLinks()
        } else {
          crushLinks()
        }
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
  }
}


Topo.$inject = Topo.getDI();
Topo.$$ngIsClass = true;