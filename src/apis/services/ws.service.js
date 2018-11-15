export class WebsocketService {
  static getDI () {
    return [
      '$log',
      '$window',
      'eventEmitter',
      'appService'
    ];
  }

  constructor (...args) {
    this.di = [];
    WebsocketService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    var EventEmitter = this.di.eventEmitter;
    var service = {},
      SOCKET_STATES = {
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3
      },
      ws,
      ee = new EventEmitter(),
      reconnectInterval = null,
      heartbeatInterval = null,
      subscribedChannels = [],
      reconnectChannels = {},
      unVisCount = 0,
      stopCommunication = false,
      maxVisCount = 180,
      channelsToSubscribeOnOpen = [];
    var $log = this.di.$log;
    var $window = this.di.$window;
    var appService  = this.di.appService;
    function kill () {
      $log.log('[marsWebsockets] killing socket service');
      try {
        if (ws) {
          ws.close();
        }
      } finally {
        ws = null;
        subscribedChannels.forEach(function (channel) {
                    // remove listeners since the socket is closed,
                    // they will not have data integrity beyond here
          if (ee.getListeners(channel).length) {
            $log.error('[marsWebsockets] Possible bug');
            $log.error('[marsWebsockets] Make sure to unsubscribeEvents before killing the service');
            ee.removeListeners(channel, ee.flattenListeners(ee.getListeners(channel)));
          }
        });
      }
    }

    function onmessage (event) {
      $log.log('[marsWebsockets] websocket message', event);
      var jsonResponse,channel;
      try {
        jsonResponse = JSON.parse(event.data);
      } catch (e) {
        $log.error('[marsWebsockets] bad websocket message: ' + event.data);
      }
      if (jsonResponse && jsonResponse.channel && subscribedChannels.indexOf(jsonResponse.channel) > -1) {
        channel = jsonResponse.channel;
        delete jsonResponse.channel;
        ee.emit(channel, jsonResponse);
      } else if(jsonResponse && !jsonResponse.channel && subscribedChannels.indexOf('') > -1){ // glabal channel with ''
        ee.emit('', jsonResponse);
      } else {
        $log.warn(
                    '[marsWebsockets] Received message from WS on other channels then the one we subscribed: ',
                    jsonResponse
                );
      }
    }

    function onclose(){
      $log.warn('[marsWebsockets] Websocket has been closed!We try to reconnect!!!!');
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
      unVisCount = 0;
      stopCommunication = false;

      setTimeout(reinit(), 2000)
    }

    function resendChannel(channel, query){
      if (query === null) {
        ws.send(JSON.stringify({channel: channel}));
      } else {
        ws.send(JSON.stringify({channel: channel, params: query}));
      }
    }

    function isVisibility() {
      if($window.document.hidden === false){
        $log.warn(">>>> non-visiable");
        return true;
      } else {
        $log.warn(">>>> visiable");
        return false;
      }
    }

    function reinit() {
      $log.log('[marsWebsockets] RE-initialize websockets connection');
      delete ws.onopen;
      delete ws.onclose;
      delete ws.onmessage;

      reconnectInterval = setInterval(function () {
        try{
          $log.warn('[marsWebsockets] Try to connect websocket server!');
          ws = new WebSocket(appService.getWebscoketEndpoint());
          ws.onopen = reopen;
          ws.onerror = onerror;
        } catch (e){
          $log.warn('[marsWebsockets] Reconnect to websocket server error! let us sleep 2s');
        }
      },2000);
    };

    function subscribeToChannel (channel, query, cb) {
      if (subscribedChannels.indexOf(channel) !== -1) {
        $log.error('[marsWebsockets] already subscribed to ' + channel + '. Ignoring request.');
        return;
      }
      if (query === null) {
        ws.send(JSON.stringify({channel: channel}));
      } else {
        ws.send(JSON.stringify({channel: channel, params: query}));
      }
      subscribedChannels.push(channel);
      reconnectChannels[channel] = query;

      $log.log('[marsWebsockets] subscribed to channel: ' + channel + '.');

            // NOTE: there's no way to find out if the "send" was successful - relying on buffer size is not feasible
      ee.on(channel, cb);
    }

    function reopen(){
      $log.log('[marsWebsockets] Execute reopen to recover all events');
      clearInterval(reconnectInterval);
      reconnectInterval = null;

      ws.onmessage = onmessage;
      ws.onclose = onclose;
      for(let channel in reconnectChannels){
        resendChannel(channel, reconnectChannels[channel]);
      }
      delete ws.onopen;
      onopen();
    }

    function execVisibility(isVis){
      if(isVis === false){
        unVisCount++;
        if(!stopCommunication && unVisCount > maxVisCount){
          stopCommunication = true;
          removeAllChannelCbOnServer();
        }
      } else {
        unVisCount = 0;
        if(stopCommunication){
          stopCommunication = false;
          sendAllChannelCbOnServer();
        }
      }
    }
    
    function onerror(event){
      $log.warn('[marsWebsockets]Connect to websocket server error');
    }

    function onopen () {
            // Subscriptions made before? Nothing to do.
      if (!channelsToSubscribeOnOpen.length) {
        return;
      }
      channelsToSubscribeOnOpen.forEach(function (data) {
        subscribeToChannel(data.channel, data.query, data.cb);
      });
      channelsToSubscribeOnOpen = [];

      if( heartbeatInterval == null){
        heartbeatInterval = setInterval(function () {
          execVisibility(isVisibility());
        },10000);
      }

    }

    /**
     * Subscribe to a particular WS channel
     *
     * @param channel
     * @param cb
     */
    service.subscribe = function (channel, query, cb) {
      if (!ws) {
        channelsToSubscribeOnOpen.push({
          channel: channel,
          query: query,
          cb: cb
        });
        $log.warn('[marsWebsockets] subscribe to ' + channel + ': unable to subscribe, ws not available.');
        $log.warn('[marsWebsockets] queueing subscription until scoket opens');
        return;
      }
      if (ws.readyState === SOCKET_STATES.OPEN) {
        subscribeToChannel(channel, query, cb);
      } else {
        channelsToSubscribeOnOpen.push({channel: channel, query: query, cb: cb});
        ws.onopen = onopen;
      }
    };


    function removeAllChannelCbOnServer(){
      $log.warn("[marsWebsockets] Remove all callback on server(Because the page becomes to be not visibility)");
      for(let channel in reconnectChannels){
        let unIndex = channel.lastIndexOf('Subscribe');
        if (unIndex > -1) {
          let unChannel = channel.slice(0, unIndex) + 'Unsubscribe';
          service.unsubscribeServerCallback(unChannel);
        }
      }
    };

    function sendAllChannelCbOnServer(){
      $log.warn("[marsWebsockets] Send the event to ws server ,because the page becomes to be visibility)");
      for(let channel in reconnectChannels){
        resendChannel(channel, reconnectChannels[channel]);
      }
    };

    //his unsubscribe is used to remove page callback. Some requests are one time return, so we need to remove page callback
    //after we get the data.
    service.unsubscribe = function (channel) {
      if(!channel || typeof channel != 'string') {
        $log.error('[marsWebsockets] The channel to unsubscribe is invalid.');
      }
      ee.removeEvent(channel);
      let index = subscribedChannels.indexOf(channel);
      if (index !== -1) {
        subscribedChannels.splice(index, 1);
      }
      delete reconnectChannels[channel];
    };

    //This method is used to remove call back on server
    service.unsubscribeServerCallback = function(channel){
      ws.send(JSON.stringify({
        channel: channel
      }));
    };

    service.unsubscribe_channal = function (channel) {
      if(!channel || typeof channel != 'string') {
        $log.error('[marsWebsockets] The channel to unsubscribe is invalid.');
      }

      ee.removeEvent(channel);
      let index = subscribedChannels.indexOf(channel);
      if (index !== -1) {
        subscribedChannels.splice(index, 1);

        // send unsubscribe channel
        let unIndex = channel.lastIndexOf('Subscribe');
        if (unIndex > -1) {
          let unChannel = channel.slice(0, unIndex) + 'Unsubscribe';
          service.unsubscribeServerCallback(unChannel);

          // delete the unsubscribe channel
          let tmpIndex = subscribedChannels.indexOf(unChannel);
          if (tmpIndex !== -1) {
            subscribedChannels.splice(tmpIndex, 1);
          }
        }
      }
      delete reconnectChannels[channel];
    };

    service.updateQuery = function (channel, query) {
            // TODO: check if ws exists
      ws.send(JSON.stringify({
        channel: channel,
        params: query
      }));
    };


    /**
     * @description Return the result of the channel has been subscribed.
     * @param channel
     * @return true|false
     * @author yazhou.miao
     */
    service.isSubscribed = function (channel) {
      let result
      subscribedChannels.forEach((obj) => {
        if(obj == channel)
          result = true;
      })

      return result === undefined ? false : true;
    }

    service.init = function () {
      kill();
      $log.log('[marsWebsockets] initialize websockets connection');
      ws = new WebSocket(appService.getWebscoketEndpoint());
      ws.onmessage = onmessage;
      ws.onclose = onclose;
    };

    service.kill = function () {
      // help differenciate between calls to api and killing internally
      $log.log('[marsWebsockets] API killing service');
      kill();
    };
    return service;
  }

}

WebsocketService.$inject = WebsocketService.getDI();
WebsocketService.$$ngIsClass = true;
