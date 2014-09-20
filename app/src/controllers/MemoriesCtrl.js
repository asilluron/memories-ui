define(function () {
  function MemoriesCtrl($scope, MemoryResource, UserResource) {
    $scope.memories = MemoryResource.query();
    $scope.user = UserResource.get();
  }

  return ["$scope", "MemoryResource", "UserResource", MemoriesCtrl];
});