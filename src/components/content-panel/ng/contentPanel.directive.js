/**
 * Created by wls on 2018/6/7.
 */

export class contentPanel {
  static getDI () {
    return [
      '$rootScope',
      'easingService'
    ];
  }

  constructor (...args) {
    this.di = [];
    contentPanel.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.transclude = true;
    this.template = require('../template/content_panel.html');

    this.scope = {
      // refresh: '=',
      isLoad: '='
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {

      this.currentContent = null;
      this.currentNode = null;


      let timeoutHandler = null;

      let unSubscribes = [];
      let contentLength = 0;
      let isMouseEnter = false;

      scope.contentPanelModel = {
        contents : []
      };

      let load =()=> {
        this.contents = element.find('ng-transclude').children();
        contentLength = this.contents.length;
        for(var n = 0; n < contentLength; n++) scope.contentPanelModel.contents[n] = {};
      };

      load();
      // this.contents = element.find('ng-transclude').children();
      // let contentLength = this.contents.length;
      let currentIndex = 0;
      let lastIndex = -1;
      let max_z_index = 3;
      let middle_z_index = 2;
      let min_z_index = 1;
      let intervalTime = 8000;
      let easingTime = 1000;
      let easingService = this.di.easingService;
      let isNodeChange = false;

      let parentWidth = element[0].clientWidth;
      let parentHeight = element[0].clientHeight;
      let circleLength = Math.sqrt(Math.pow(element[0].offsetWidth, 2)  + Math.pow(element[0].offsetHeight,2));


      function reload() {
        load();
      }
      angular.element(element.find('ng-transclude').children()[0]).css({'z-index': max_z_index, 'display':'block'});

      // for(var n = 0; n < contentLength; n++) scope.contentPanelModel.contents[n] = {};

      function addSelectNodeClass() {
        let nodesDom = element[0].querySelector('.content_panel__markers');
        let selectedNodeDom = angular.element(nodesDom).children()[currentIndex];
        let selectNodeJQ = angular.element(selectedNodeDom);
        selectNodeJQ.addClass('currentSelected');
      }

      function removeSelectNodeClass() {
        let nodesDom = element[0].querySelector('.content_panel__markers');
        let selectedNodeDom = angular.element(nodesDom).children()[currentIndex];
        let selectNodeJQ = angular.element(selectedNodeDom);
        selectNodeJQ.removeClass('currentSelected');
      }

      let setNextDiv = (index) =>{
        lastIndex = currentIndex;
        if(index !== undefined && index !== null){
          currentIndex = index;
        } else {
          currentIndex = currentIndex === contentLength - 1? 0: currentIndex + 1;
        }

        let nextContentDiv = angular.element(element.find('ng-transclude').children()[currentIndex]);
        nextContentDiv.css({"z-index": max_z_index,"width":"0px", 'height':'0px','display':'block','background-color':'#f1f1f1' });

        let starttime = new Date().getTime();
        addSelectNodeClass();

        dynamicGrow(starttime, nextContentDiv);

      };

      let setCurrentDiv = () =>{
        let currContentDiv = angular.element(element.find('ng-transclude').children()[currentIndex]);
        currContentDiv.css({'z-index': middle_z_index,'display':'none'});
        // currContentDiv.removeClass("animate_content");

        removeSelectNodeClass();

        let selectNodeDiv = angular.element(angular.element(element[0].querySelector('.content_panel__markers')).children()[currentIndex]);
        selectNodeDiv.removeClass('currentSelected');
      };

      let setLastDiv = () =>{
        if(lastIndex === -1){
          lastIndex = currentIndex === 0?contentLength -1 :currentIndex - 1;
        }
        let lastContentDiv = angular.element(element.find('ng-transclude').children()[lastIndex]);
        lastContentDiv.css({'z-index': min_z_index});
      };

      let changeContent = (index) =>{
        parentWidth = element[0].clientWidth;
        parentHeight = element[0].clientHeight;

        isNodeChange = true;
        setLastDiv();
        setCurrentDiv();
        setNextDiv(index);

        if(!isMouseEnter){
          timeoutHandler = setTimeout(function () {
            changeContent();
          }, intervalTime)
        }
      };


      // if()
      if(scope.contentPanelModel.contents.length > 1){
        timeoutHandler = setTimeout(function () {
          changeContent();
        },intervalTime);
      }


      let dynamicGrow = (starttime, contentJQ) => {
        let time = (new Date()).getTime() - starttime;
        if(time > easingTime) {
          finishGrow(contentJQ);
          return;
        }
        let percentage = time/easingTime;
        let nP = easingService.easeInOutQuad(percentage);
        let width = circleLength * nP;
        let height = circleLength * nP;

        setLocation(contentJQ, width, height);

        requestAnimFrame(function () {
          dynamicGrow(starttime, contentJQ);
        });
      };

      function setLocation(nodeJq, width, height){
        nodeJq.css({'width': width + 'px',
          'height': height + 'px',
          'top': (parentHeight - height)/2 + 'px',
          'left':(parentWidth - width)/2 + 'px',
          // 'background-color':'lightgray',
          'border-radius': '50%'
        });

        nodeJq.children().css({'margin-top': (height - parentHeight)/2+'px',
          'margin-left': (width - parentWidth)/2+'px',
        'opacity':"0.7"});

      }
      
      function finishGrow(nodeJq) {
        nodeJq.css({'width': parentWidth + 'px',
          'height': parentHeight + 'px',
          'top': '0px',
          'left':'0px',
          'border-radius': '0',
          'background-color':'',
        });

        nodeJq.children().css({'margin-top': '0px',
          'margin-left': '0px',
          'opacity':"1"});




        isNodeChange = false;
      }

      scope.mouseenter = () =>{
        if(scope.contentPanelModel.contents.length > 1) {
          if (timeoutHandler) {
            clearTimeout(timeoutHandler);
          }
          isMouseEnter = true;
        }
      };

      scope.mouseleave = () =>{
        if(scope.contentPanelModel.contents.length > 1) {
          isMouseEnter = false;
          if (timeoutHandler) {
            clearTimeout(timeoutHandler);
          }
          timeoutHandler = setTimeout(function () {
            changeContent();
          }, intervalTime);
        }
      };


      scope.clickNode = (index)=>{
        if( index === currentIndex || isNodeChange){
          return;
        }
        if(timeoutHandler){
          clearTimeout(timeoutHandler);
        }
        changeContent(index);
      }

      // unSubscribes.push(scope.$watch('refresh',(newValue)=>{
      //   // console.log('*****' + newValue);
      //   if(newValue === true){
      //     console.log('refresh');
      //     reload();
      //     scope.refresh = false;
      //   }
      // }));


      unSubscribes.push(scope.$watch('isLoad',(newValue)=>{
        if(newValue === true){

        } else {
          reload();
        }
      }));


      scope.$on('$destroy', () => {
        unSubscribes.forEach((cb) => {
          cb();
        });

        if(timeoutHandler){
          clearTimeout(timeoutHandler);
        }
      });


    }).call(this);
  }
}

contentPanel.$inject = contentPanel.getDI();
contentPanel.$$ngIsClass = true;