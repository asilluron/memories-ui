define(function () {
  function MemoryCtrl($scope, handleLoading, memory, MomentResource, timelineEventZipper) {
    $scope.memory = handleLoading(memory, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.moments = [];
    $scope.timelineEvents = [];
    $scope.memory.$promise.then(function () {
      $scope.moments = handleLoading(MomentResource.query({id:memory._id}), function (value) {
        $scope.loadingMoments = value;
      }, function (error) {
        $scope.loadMomentsError = error;
      });

      $scope.moments.$promise.then(function () {
        debugger;
        $scope.timelineEvents = timelineEventZipper.zip($scope.moments, null, true);
      });
    });
  }

  return ["$scope", "handleLoading", "memory", "MomentResource", "timelineEventZipper", MemoryCtrl];
});