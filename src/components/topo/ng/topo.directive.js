
export class Topo {
  static getDI () {
    return [
      '$rootScope',
      '$window',
      '$document',
      '_'
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
      others:'='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {
      this.height = 0;
      this.width = 0;
      this.spineContainer = null;
      this.leafContainer = null;
      this.otherContainer = null;
      this.spineContainerLeftNode = null;
      this.spineContainerRightNode = null;

      this.leafContainerLeftNode = null;
      this.leafContainerRightNode = null;

      this.otherContainerLeftNode = null;
      this.otherContainerRightNode = null;

      this.stage = null;
      this.scene = null;

      this.spines = {};
      this.leafs = {};
      this.others = {};

      this.switch_width = 16;
      this.switch_height = 104;
      this.leaf_group_interval = 2;
      this.leaf_group_str = 'leaf_group';


      let initialize = () => {


        this.stage = new JTopo.Stage(canvas); // 创建一个舞台对象
        this.scene = new JTopo.Scene(this.stage);
        this.spineContainer = new JTopo.Container();
        this.leafContainer = new JTopo.Container();
        this.otherContainer = new JTopo.Container();

        this.spineContainer.fillColor = '255,0,0';
        this.leafContainer.fillColor = '0,255,0';
        this.otherContainer.fillColor = '0,0,255';


        this.spineContainer.dragable = false;
        this.leafContainer.dragable = false;
        this.otherContainer.dragable = false;

        this.spineContainer.showSelected = false;
        this.leafContainer.showSelected = false;
        this.otherContainer.showSelected = false;

        this.scene.add(this.spineContainer);
        this.scene.add(this.leafContainer);
        this.scene.add(this.otherContainer);

        genSpine();
        genLeaf();
        genOther();
        genLinks();

        resize();
      };

      let genSpine = () =>{
        this.spineContainerLeftNode = genAnchorNode();
        this.spineContainerRightNode = genAnchorNode();

        this.spineContainer.add(this.spineContainerLeftNode);
        this.spineContainer.add(this.spineContainerRightNode);

        for(let index in scope.spines){
          let spine = scope.spines[index];
          this.spines[spine.id] = genNormalNode(spine.id);
        }

      };

      let genLeaf = () =>{
        this.leafContainerLeftNode = genAnchorNode();
        this.leafContainerRightNode = genAnchorNode();

        this.leafContainer.add(this.leafContainerLeftNode);
        this.leafContainer.add(this.leafContainerRightNode);

        for(let index in scope.leafs){
          let leaf = scope.leafs[index];
          this.leafs[leaf.id] = genNormalNode(leaf.id);
        }
      };

      let genOther = () => {
        this.otherContainerLeftNode = genAnchorNode();
        this.otherContainerRightNode = genAnchorNode();

        this.otherContainer.add(this.otherContainerLeftNode);
        this.otherContainer.add(this.otherContainerRightNode);

        for(let index in scope.others){
          let other = scope.others[index];

          this.others[other.id] = genNormalNode(other.id);
        }
      };

      let genLinks = () => {

      };

      let draw = () =>{

        let avgHeight = this.height/3;
        let spineInterval = calcInterval(scope.spines, this.width);
        //leaf有分组，需要特殊处理
        let leafInterval = calcLeafInterval(scope.leafs, this.width);
        let otherInterval = calcInterval(scope.others, this.width);

        let spineKeys = this.di._.keys(this.spines);
        spineKeys = this.di._.sortBy(spineKeys);
        for(let i = 0; i< spineKeys.length; i++){
          let key = spineKeys[i];
          let node = this.spines[key];
          let x = (i + 1) * spineInterval + i * this.switch_width;
          let y =  (avgHeight - this.switch_height)/2;
          node.setLocation(x, y);
        }

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
          }
          last_x = last_x + leafInterval +(this.switch_width + this.leaf_group_interval)* leaf_group.length;

          // let node = this.leafs[key];
          // let x = (i + 1) * leafInterval + i * 16;
          // let y =  (avgHeight - 104)/2 + avgHeight;
          // node.setLocation(x, y);
        }

        let otherKeys = this.di._.keys(this.others);
        otherKeys = this.di._.sortBy(otherKeys);
        for(let i = 0; i< otherKeys.length; i++){
          let key = otherKeys[i];
          let node = this.others[key];
          let x = (i + 1) * otherInterval + i * this.switch_width;
          let y =  (avgHeight - this.switch_height)/2 + avgHeight * 2;
          node.setLocation(x, y);
        }
      };

      let calcInterval = (nodes, width) =>{
        return (width - this.switch_width * nodes.length)/(nodes.length + 1)
      };

      let calcLeafInterval = (leafs, width) =>{
        let remainWidth = width - this.switch_width * leafs.length;
        let group = this.di._.groupBy(leafs, this.leaf_group_str);
        return remainWidth/ (this.di._.keys(group).length + 1);
      }

      let genAnchorNode = () =>{
        let node = new JTopo.Node();
        node.dragable = false ;
        node.width = 1;
        node.showSelected =false;
        node.fillColor = "98,98,255";

        this.scene.add(node);
        return node;
      };

      let genNormalNode = (deviceId) =>{
        let node = new JTopo.Node();
        node.dragable = false ;
        node.width = this.switch_width;
        node.height = this.switch_height;
        node.showSelected =true;
        node.deviceId = deviceId;
        node.click(function(event){
          alert(this.deviceId);
        });
        this.scene.add(node);
        return node;
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

      let resize = () => {
        let parentNode = element[0].parentNode;
        this.width = parentNode.offsetWidth;
        this.height = parentNode.offsetHeight;

        let canvas = this.di.$document[0].getElementById('canvas');
        canvas.width = this.width;
        canvas.height = this.height;

        layout();
        draw();
      };

      initialize();

      angular.element(this.di.$window).bind('resize', function () {
        resize();
      });



    }).call(this);
  }
}


Topo.$inject = Topo.getDI();
Topo.$$ngIsClass = true;