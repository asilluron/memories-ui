define(function () {
  function MemoriesCtrl($scope, handleLoading, MemoryResource, UserResource) {
    $scope.memories = handleLoading(MemoryResource.query(), function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.user = UserResource.get();
  }

  return ["$scope", "handleLoading", "MemoryResource", "UserResource", MemoriesCtrl];
});