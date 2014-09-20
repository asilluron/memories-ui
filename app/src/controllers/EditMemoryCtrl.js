define(function () {
  function EditMemoryCtrl($scope, MemoryResource) {
    // TODO: handle edit mode
    $scope.memory = {
      name: "",
      shareability: "private",
      startDate: null,
      endDate: null,
      description: ""
    };

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

    $scope.creating = false;
    $scope.errorMessage = null;
    $scope.create = function () {
      $scope.creating = true;
      $scope.errorMessage = null;
      MemoryResource.save($scope.memory)
        .$promise
        .then(function () {
          redirectToMemory();
        }, function (response) {
          // TODO: check response.status
          $scope.errorMessage = "The server returned an unexpected response: " + response.status;
        })
        .then(null, function () {
          $scope.errorMessage = "An unknown error occurred";
        })
        .finally(function () {
          $scope.creating = false;
        });
    };
  }

  return ["$scope", "MemoryResource", EditMemoryCtrl];
});