define(function () {
  function ChatCtrl($scope, memory, user, socketFactoryFactory) {
   this.chatSocket = socketFactoryFactory(memory._id+"/chat");
   $scope.messages = [];

   this.chatSocket.emit("nameReg", {name: user._id});
   this.chatSocket.on("chatMessage", function storeChatMessage(data){
    $scope.messages.push(data);
   });

   $scope.sendMessage = function sendMessage(message){
    this.chatSocket.emit("chatMessage", {text: message});
   };

  // chatMessage = {
  // memory: “id”,
  // creator: “id”,
  // createdDate: Date,
  // text: “string”
  // }

  }

  return ["$scope", "memory", "user", "socketFactoryFactory", ChatCtrl];
});