define(function () {
  function ChatCtrl($scope, memory, socketFactoryFactory) {
   $scope.messages = [];

   memory.$promise.then(function(result){
       $scope.chatSocket = socketFactoryFactory(result._id);

       $scope.chatSocket.join("chat");
       $scope.chatSocket.emit("nameReg", {name: $scope.user.preferredName});

       $scope.chatSocket.on("handShake", function(){
         $scope.chatSocket.emit("nameReg", {name: $scope.user.preferredName});
       });

       $scope.chatSocket.on("chatMessage", function storeChatMessage(data){
        $scope.messages.push(data);
       });

       $scope.sendMessage = function sendMessage(message){
        $scope.chatSocket.emit("chatMessage", {text: message});
   };
   });


  }

  return ["$scope", "memory", "socketFactoryFactory", ChatCtrl];
});