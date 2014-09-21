define(function () {
  function ChatCtrl($scope, memory, socketFactoryFactory) {
    $scope.currentChatMessage = "";
    $scope.chatMessages = [{message: "woo!", user: "testUser"}];
    this.socket = {};

    var self = this;
    memory.$promise.then(function (result) {
      self.chatSocket = socketFactoryFactory(result._id);
      
      socketFactoryFactory(result._id).emit("nameReg", {
        name: $scope.user.preferredName
      });

      socketFactoryFactory(result._id).on("handShake", function () {
       self.chatSocket.emit("nameReg", {
          name: $scope.user.preferredName
        });
      });


      self.chatSocket.on("chatMessage", function storeChatMessage(data) {
        $scope.chatMessages.push(data);
      });

      
    });

    $scope.sendMessage = function sendMessage(){
      if( $scope.currentChatMessage !== ""){
        $scope.chatMessages.push({message: $scope.currentChatMessage, user: "Me!"});
        self.chatSocket.emit("chatMessage", {
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