define(function () {
  var makeEmptyMoment = function () {
    return {
      text: "",
      location: {
        name: "",
        gps: null,
        address: ""
      },
      sharing: "private"
    };
  }
  function EditMemoryCtrl($scope, $state, handleLoading, memory, MemoryResource) {
    var isNew = $scope.isNew = !memory;
    $scope.memory = handleLoading(memory || {
      about: {
        name: "",
        primaryMoment: null
      },
      preferences: {
        sharing: "private",
      },
      startDate: null,
      endDate: null,
      participants: []
    }, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    }, function (memory) {
      $scope.primaryMoment = memory.about.primaryMoment || (memory.about.primaryMoment = makeEmptyMoment());
    });
    if (isNew) {
      $scope.setTitle('New Memory');
    } else {
      $scope.setTitle('Edit Memory');
    }

    $scope.SHAREABILITY_DESCRIPTIONS = {
      "private": "Your memory cannot be seen by anyone but participants of the memory.",
      "unlisted": "Your memory will not be listed on your profile, but is only accessible to anyone with a link.",
      "public": "Your memory will be listed on your public profile, and is accessible to anyone."
    };

    $scope.datePickersOpen = {
      startDate: false,
      endDate: false,
    };

    $scope.openDatePicker = function ($event, name) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.datePickersOpen[name] = true;
    };

    $scope.saving = false;
    $scope.errorMessage = null;
    $scope.save = function () {
      $scope.saving = true;
      $scope.errorMessage = null;
      (isNew ? MemoryResource.save($scope.memory).$promise : $scope.memory.$update())
        .then(function (response) {
          $state.go('memories.view', {id: response._id});
        }, function (response) {
          if (!response.status) {
            $scope.errorMessage = "Could not connect to server";
          } else {
            // TODO: check response.status
            $scope.errorMessage = "The server returned an unexpected response: " + response.status;
          }
        })
        .then(null, function () {
          $scope.errorMessage = "An unknown error occurred";
        })
        .finally(function () {
          $scope.saving = false;
        });
    };
  }

  return ["$scope", "$state", "handleLoading", "memory", "MemoryResource", EditMemoryCtrl];
});