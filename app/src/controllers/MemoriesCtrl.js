define(function () {
  function MemoriesCtrl($scope, $rootScope, handleLoading, MemoryResource, socketFactoryFactory, UserResource) {
    $scope.memories = handleLoading(MemoryResource.query(), function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.memories.$promise.then(function (memories) {
      memories.forEach(function (memory) {
        var socket = memory.socket = socketFactoryFactory(memory._id);
        socket.on("helloWorld", function(data){
          console.log(data);
        });
        socket.emit("handShake", {data: "TEST"});
        socket.on("milestone", function (msg) {
          $rootScope.$emit("TIMELINE:REFRESH");
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
  return ["$scope", "$rootScope", "handleLoading", "MemoryResource", "socketFactoryFactory", "UserResource", MemoriesCtrl];
});
  
