define(function () {
  function MemoryCtrl($scope, memory) {
    $scope.memory = memory;
    $scope.loadError = null;
    if (memory.$promise) {
      $scope.loading = true;
      memory.$promise.then(null, function (error) {
        $scope.loadError = error;
      }).finally(function () {
        $scope.loading = false;
      });
    } else {
      $scope.loading = false;
    }
  }

  return ["$scope", "memory", MemoryCtrl];
});