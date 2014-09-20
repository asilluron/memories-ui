define(function () {
  function MemoryCtrl($scope, memory) {
    $scope.memory = memory;
  }

  return ["$scope", "memory", MemoryCtrl];
});