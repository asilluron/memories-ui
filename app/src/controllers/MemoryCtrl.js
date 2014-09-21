define(function () {
  function MemoryCtrl($scope, handleLoading, memory, MomentResource, timelineEventZipper) {
    $scope.memory = handleLoading(memory, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.moments = [];
    $scope.timelineEvents = [];
    $scope.memory.$promise.then(function (memory) {
      $scope.setTitle(memory.about.name);
      $scope.moments = handleLoading(MomentResource.query({id:memory._id}), function (value) {
        $scope.loadingMoments = value;
      }, function (error) {
        $scope.loadMomentsError = error;
      });

      $scope.moments.$promise.then(function () {
        $scope.timelineEvents = timelineEventZipper.zip($scope.moments, null, true);
      });
    });

    $scope.newMoment=function(type){
      $scope.momentFlag = type;

    };

    $scope.addMoment = function(moment){
      $scope.addingMoment = true;
      var newMoment = new MomentResource();
      angular.extend(newMoment, moment);
      angular.extend(newMoment, {memory: memory._id, sharing: "private"});
      newMoment.$save(function(){
        $scope.momentFlag = false;
        $scope.addingMoment = false;
      });

    };
  }

  return ["$scope", "handleLoading", "memory", "MomentResource", "timelineEventZipper", MemoryCtrl];
});
