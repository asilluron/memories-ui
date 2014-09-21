define(function () {
  function MemoryCtrl($scope, $rootScope, $q, handleLoading, memory, MilestoneResource, MomentResource,
    timelineEventZipper) {
    $scope.memory = handleLoading(memory, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.timelineEvents = [];
    $scope.memory.$promise.then(function (memory) {
      $scope.setTitle(memory.about.name);
      var moments = handleLoading(MomentResource.query({
        id: memory._id
      }), function (value) {
        $scope.loadingMoments = value;
      }, function (error) {
        $scope.loadMomentsError = error;
      });

      var milestones = handleLoading(MilestoneResource.query({
        id: memory._id
      }), function (value) {
        $scope.loadingMilestones = value;
      }, function (error) {
        $scope.loadMilestonesError = error;
      });

      $q.all([moments.$promise, milestones.$promise])
        .then(function () {
          $scope.timelineEvents = timelineEventZipper.zip(moments, milestones, true);
        });
    });

    $scope.refresh = function refresh() {
      $scope.memory.$promise.then(function (memory) {
        $q.all({
          milestones: MilestoneResource.query({
            id: memory._id
          }).$promise,
          moments: MomentResource.query({
            id: memory._id
          }).$promise
        })
          .then(function (o) {
            $scope.timelineEvents = timelineEventZipper.zip(o.moments, o.milestones, true);
          });
      });
    };

    $rootScope.$on("TIMELINE:REFRESH", function () {
      $scope.refresh();
    });


    var reset = function () {
      $scope.momentFlag = null;
      $scope.moment = {};
      $scope.milestone = {};
    };
    reset();

    $scope.newMoment = function (type) {
      if ($scope.momentFlag === type) {
        $scope.momentFlag = null;
      } else {
        $scope.momentFlag = type;
      }
    };

    var makeMomentResource = function (moment) {
      var newMoment = new MomentResource();
      angular.extend(newMoment, moment, {
        memory: memory._id,
        sharing: "private"
      });
      return newMoment;
    };
    $scope.addMoment = function (moment) {
      $scope.addingMoment = true;
      makeMomentResource(moment)
        .$save(function () {
          $scope.addingMoment = false;
          reset();
        });
    };

    $scope.addMilestone = function (milestone, moment) {
      $scope.addingMoment = true;
      var newMilestone = new MilestoneResource();
      angular.extend(newMilestone, {
        memory: memory._id,
        participation: 'anyone',
        participants: [],
        about: {
          startDate: milestone.hasStartDate ? fromDualDate(milestone.startDate, milestone.startTime) : null,
          endDate: milestone.hasEndDate ? fromDualDate(milestone.endDate, milestone.endTime) : null,
          desc: ""
        },
        viewability: 'participant',
        moment: angular.extend({}, moment, {
          sharing: "private"
        })
      });
      newMilestone.$save(function () {
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

  return ["$scope", "$rootScope", "$q", "handleLoading", "memory", "MilestoneResource", "MomentResource",
    "timelineEventZipper", MemoryCtrl
  ];
});