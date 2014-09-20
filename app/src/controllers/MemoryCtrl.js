define(function () {
  function MemoryCtrl($scope, handleLoading, memory) {
    $scope.memory = handleLoading(memory, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
  }

  return ["$scope", "handleLoading", "memory", MemoryCtrl];
});