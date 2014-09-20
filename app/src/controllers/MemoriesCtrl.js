define(function () {
  function MemoriesCtrl($scope, handleLoading, MemoryResource, socketFactoryFactory, UserResource) {
    $scope.memories = handleLoading(MemoryResource.query(), function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.memories.$promise.then(function (memories) {
      memories.forEach(function (memory) {
        var socket = memory.socket = socketFactoryFactory(memory._id);
        socket.join('chat');
        socket.on("milestone", function (msg) {
          console.log("new milestone action!", msg);
        });
        socket.on("user", function (msg) {
          console.log("new user action completed!");
        });
        socket.on("moment", function (msg) {
          console.log("new moment action!");
        });
        socket.on("edit", function (msg) {
          console.log("new edit to this memory");
        });
      });
    });
  }
  return ["$scope", "handleLoading", "MemoryResource", "socketFactoryFactory", "UserResource", MemoriesCtrl];
});
  
