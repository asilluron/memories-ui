"use strict";

define([], function(){
  function socketFactoryFactory ($rootScope, API_URL){
    return function socketFactory(context){
      //"http:" + API_URL.split(":")[1] + ":8080";
      var socketAPI = API_URL;
      var socket = io.connect(context ? socketAPI + "/" + context : socketAPI);
      return {
        on: function (eventName, callback) {
          socket.on(eventName, function () {  
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });
        },
        emit: function (eventName, data, callback) {
          socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          });
        },
        join: function(room, callback){
          socket.emit("joinRoom", room, function(){
            var args = arguments;
            $rootScope.$apply(function(){
              if(callback){
                callback.apply(socket, args);
              }
            });
          });
        },
        socket: socket
      };
    };
  }

  return ['$rootScope', "API_URL", socketFactoryFactory];
});