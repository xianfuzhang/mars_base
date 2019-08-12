export class MessageWebsocketService {
  static getDI () {
    return [
      '$log',
      '$window',
      '$rootScope',
      'eventEmitter',
      'appService',
      'localStoreService',
      'deviceDataManager'
    ];
  }
  
  constructor (...args) {
    this.di = [];
    MessageWebsocketService.getDI().forEach((value, index) => {
      this.di[value] = args[index];
    }, this);
    var EventEmitter = this.di.eventEmitter;
    const WEBSOCKET_MESSAGES_LOCALSTORE_KEY = 'websocket_messages';
    const DI = this.di;
    var service = {},
      SOCKET_STATES = {
        CONNECTING: 0,
        OPEN: 1,
        CLOSING: 2,
        CLOSED: 3
      },
      ws,
      devices,
      ee = new EventEmitter(),
      reconnectInterval = null,
      heartbeatInterval = null,
      subscribedChannels = [],
      reconnectChannels = {},
      unVisCount = 0,
      stopCommunication = false,
      maxVisCount = 180,
      channelsToSubscribeOnOpen = [],
      isClosedPurposely = false; // close the connection purposely
    
    var $log = this.di.$log;
    var $window = this.di.$window;
    let wsEndpoint = '';
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
        
        // close purposely
        isClosedPurposely = true;
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
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
        $log.warn(">>>> visiable");
        return true;
      } else {
        $log.warn(">>>> non-visiable");
        return false;
      }
    }
    
    function reinit() {
      $log.log('[marsWebsockets] RE-initialize websockets connection');
      if(!ws) return;
      
      if(isClosedPurposely) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
        return;
      }
      
      delete ws.onopen;
      delete ws.onclose;
      delete ws.onmessage;
      
      reconnectInterval = setInterval(function () {
        try{
          $log.warn('[marsMessageWebsockets] Try to connect websocket server!');
          ws = new WebSocket(DI.appService.getMessageWebscoketEndpoint());
          ws.onopen = reopen;
          ws.onerror = onerror;
        } catch (e){
          $log.warn('[marsMessageWebsockets] Reconnect to websocket server error! let us sleep 2s');
        }
      }, 10000);
    };
    
    function subscribeToChannel (channel, query, cb) {
      if (subscribedChannels.indexOf(channel) !== -1) {
        $log.error('[marsMessageWebsockets] already subscribed to ' + channel + '. Ignoring request.');
        return;
      }
      if (query === null) {
        ws.send(JSON.stringify({channel: channel}));
      } else {
        ws.send(JSON.stringify({channel: channel, params: query}));
      }
      subscribedChannels.push(channel);
      reconnectChannels[channel] = query;
      
      $log.log('[marsMessageWebsockets] subscribed to channel: ' + channel + '.');
      
      // NOTE: there's no way to find out if the "send" was successful - relying on buffer size is not feasible
      ee.on(channel, cb);
    }
    
    function reopen(){
      $log.log('[marsMessageWebsockets] Execute reopen to recover all events');
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
      $log.warn('[marsMessageWebsockets]Connect to websocket server error');
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
        $log.warn('[marsMessageWebsockets] subscribe to ' + channel + ': unable to subscribe, ws not available.');
        $log.warn('[marsMessageWebsockets] queueing subscription until scoket opens');
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
      $log.warn("[marsMessageWebsockets] Remove all callback on server(Because the page becomes to be not visibility)");
      for(let channel in reconnectChannels){
        let unIndex = channel.lastIndexOf('Subscribe');
        if (unIndex > -1) {
          let unChannel = channel.slice(0, unIndex) + 'Unsubscribe';
          service.unsubscribeServerCallback(unChannel);
        }
      }
    };
    
    function sendAllChannelCbOnServer(){
      $log.warn("[marsMessageWebsockets] Send the event to ws server ,because the page becomes to be visibility)");
      for(let channel in reconnectChannels){
        resendChannel(channel, reconnectChannels[channel]);
      }
    };
    
    //his unsubscribe is used to remove page callback. Some requests are one time return, so we need to remove page callback
    //after we get the data.
    service.unsubscribe = function (channel) {
      if(typeof channel != 'string') {
        $log.error('[marsMessageWebsockets] The channel to unsubscribe is invalid.');
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
        $log.error('[marsMessageWebsockets] The channel to unsubscribe is invalid.');
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
    
    function getLocalTime() {
      var local_time = '';
      var day = new Date();
      local_time += day.getFullYear() + '-';
      local_time += addPrefix((day.getMonth() + 1)) + '-';
      local_time += addPrefix(day.getDate()) + ' ';
      local_time += addPrefix(day.getHours()) + ':';
      local_time += addPrefix(day.getMinutes()) + ':';
      local_time += addPrefix(day.getSeconds());
      
      return local_time;
      
      function addPrefix(num) {
        if (num < 10) {
          return '0' + num;
        }
        else {
          return num;
        }
      }
    }
    
    function messageCb(message) {
      if(message.event == 'connect') {
        return;
      }
      // save new message
      const storage = DI.localStoreService.getSyncStorage();
      let messages = storage.get(WEBSOCKET_MESSAGES_LOCALSTORE_KEY) || [];
      
      // complete message obj
      message.uuid = (new Date()).getTime().toString() + Math.floor(Math.random() * 10).toString();
      message.isRead = false;
      message.time = getLocalTime();
      
      // Added to the start position
      messages.splice(0, 0, message);
      storage.set(WEBSOCKET_MESSAGES_LOCALSTORE_KEY, messages.slice(0, DI.appService.CONST.MAX_MESSAGES_NUMBER));
      
      DI.$rootScope.$emit('new-websocket-message', message)
    }
    
    service.init = function () {
      if(ws) {
        return;
      } else {
        kill();
        $log.log('[marsMessageWebsockets] initialize websockets connection');
        ws = new WebSocket(DI.appService.getMessageWebscoketEndpoint());
        ws.onmessage = onmessage;
        ws.onclose = onclose;
      
        service.subscribe('', {}, messageCb);
      }
      
      return service;
    };
    
    // get messages from local storage
    service.getMessages = function () {
      const storage = DI.localStoreService.getSyncStorage();
      let messages = storage.get(WEBSOCKET_MESSAGES_LOCALSTORE_KEY) || [];
      
      return messages;
    }
    
    // set message to local storage
    service.saveMessages = function(messages) {
      const storage = DI.localStoreService.getSyncStorage();
      storage.set(WEBSOCKET_MESSAGES_LOCALSTORE_KEY, messages);
    }
    
    service.kill = function () {
      // help differenciate between calls to api and killing internally
      $log.log('[marsMessageWebsockets] API killing service');
      kill();
    };
    return service;
  }
}

MessageWebsocketService.$inject = MessageWebsocketService.getDI();
MessageWebsocketService.$$ngIsClass = true;