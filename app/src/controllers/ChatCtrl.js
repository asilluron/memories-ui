define(function () {
  function ChatCtrl($scope, memory, socketFactoryFactory) {
    $scope.currentChatMessage = "";
    $scope.chatMessages = [{message: "woo!", user: "testUser"}];
    this.socket = {};
    memory.$promise.then(function (result) {
      $scope.chatSocket = result.chatSocket = socketFactoryFactory(result._id);
      
      socketFactoryFactory(result._id).emit("nameReg", {
        name: $scope.user.preferredName
      });

      socketFactoryFactory(result._id).on("handShake", function () {
        $scope.chatSocket.emit("nameReg", {
          name: $scope.user.preferredName
        });
        socketFactoryFactory(result._id).emit("chatMessage", {text: "HELLO"});
      });


      socketFactoryFactory(result._id).on("chatMessage", function storeChatMessage(data) {
        $scope.messages.push(data);
      });

      
    });

    $scope.sendMessage = function addMessage(){
      if( $scope.currentChatMessage !== ""){
        $scope.chatMessages.push({message: $scope.currentChatMessage, user: "Me!"});
        $scope.chatSocket.emit("chatMessage", {
          text: $scope.currentChatMessage
        });
        $scope.currentChatMessage = "";
      }
    };

    $scope.openMessage = function openMessage(index){
      $scope.currentChatMessage = $scope.chatMessages[index];
    };

  }

  return ["$scope", "memory", "socketFactoryFactory", ChatCtrl];
});