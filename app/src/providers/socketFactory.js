"use strict";

define()([], function(){
  function socketFactoryFactory ($rootScope){
    return function socketFactory(context){
      var socket = io.connect(context);
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

  return ['$rootScope', socketFactoryFactory];
});