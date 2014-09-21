define(function () {
  function MemoryCtrl($scope, handleLoading, memory, MilestoneResource, MomentResource, timelineEventZipper) {
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

    var reset = function () {
      $scope.moment = {};
      $scope.milestone = {};
    };
    reset();

    $scope.momentFlag = null;
    $scope.newMoment = function(type) {
      if ($scope.momentFlag === type) {
        $scope.momentFlag = null;
      } else {
        $scope.momentFlag = type;
      }
    };

    $scope.addMoment = function(moment){
      $scope.addingMoment = true;
      var newMoment = new MomentResource();
      angular.extend(newMoment, moment);
      angular.extend(newMoment, {memory: memory._id, sharing: "private"});
      newMoment.$save(function(){
        $scope.momentFlag = null;
        $scope.addingMoment = false;
        reset();
      });
    };

    $scope.addMilestone = function (milestone, moment) {
      $scope.addingMoment = true;
      var newMoment = new MomentResource();
      angular.extend(newMoment, moment);
      angular.extend(newMoment, {memory: memory._id, sharing: "private"});
      newMoment.$save(function(){
        $scope.momentFlag = null;
        $scope.addingMoment = false;
        reset();
      });
    }

    $scope.enableMilestoneStartDate = function () {
      $scope.milestone.hasStartDate = true;
      $scope.milestone.startDate = new Date();
      $scope.milestone.startTime = new Date();
    }

    $scope.disableMilestoneStartDate = function () {
      $scope.milestone.hasStartDate = false;
    }

    $scope.enableMilestoneEndDate = function () {
      $scope.milestone.hasEndDate = true;
      $scope.milestone.endDate = new Date();
      $scope.milestone.endTime = new Date();
    }

    $scope.disableMilestoneEndDate = function () {
      $scope.milestone.hasEndDate = false;
    }
  }

  return ["$scope", "handleLoading", "memory", "MilestoneResource", "MomentResource", "timelineEventZipper", MemoryCtrl];
});
