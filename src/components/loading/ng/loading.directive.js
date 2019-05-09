
export class Loading {
  static getDI () {
    return [
      '$rootScope',
      '$window',
      '$timeout',
      '$document',
      '_',
    ];
  }

  constructor (...args) {
    this.di = [];
    Loading.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);

    this.replace = true;
    this.restrict = 'E';
    this.template = require('../template/loading');

    this.scope = {
      defaultClosed: '@'
    };

    this.link = (...args) => this._link.apply(this, args);
  }

  _link (scope, element) {
    (function init () {

      let unSubscribes = [];
      this.imageCount = 11;
      let loading = element.find('canvas')[0];

      let imgs = [];
      imgs.push();
      for(let i = 1 ; i<= this.imageCount ; i++){
        let image = new Image();
        let imgUrl = require('../../../assets/images/Mars_loading_'+i+'.png');

        image.src = imgUrl;
        imgs.push(image)
      }

      let intervalTime = 100;
      let index = 0;
      let loading_interval = null;

      scope.isLoading = false;
      function  start(isOutCall) {
        return;
        if(scope.isLoading && isOutCall){
          console.log('Loading component has been called')
          return;
        }
        scope.isLoading = true;
        let arrIndex = index %11;
        let sleepTime = intervalTime;
        if(arrIndex === 0 && index !== 0){
          sleepTime = 600;
        }
        loading_interval = setTimeout(function () {
          let context = loading.getContext('2d');
          context.clearRect(0, 0, 60, 60);

          context.drawImage(imgs[arrIndex],0,0,60,60);
          context.restore();
          index = index + 1;
          start()
        }, sleepTime);
      }

      function stop() {
        clearTimeout(loading_interval);
        loading_interval = null;
        scope.isLoading = false;
        index = 0;
        let context = loading.getContext('2d');
        context.clearRect(0, 0, 60, 60);

        context.drawImage(imgs[0],0,0,60,60);
        context.restore();

      }

      unSubscribes.push(this.di.$rootScope.$on('start_loading',()=>{
        start(true);
      }));

      unSubscribes.push(this.di.$rootScope.$on('stop_loading',()=>{
        stop();
      }));


      scope.$on('$destroy', () => {
        this.di._.each(unSubscribes, (unSubscribe) => {
          unSubscribe();
        });
      });
  
      if(!scope.defaultClosed) {
        setTimeout(function () {
          start(true);
        });
      }

    }).call(this);
  }
}


Loading.$inject = Loading.getDI();
Loading.$$ngIsClass = true;