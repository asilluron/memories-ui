define(function () {
  function RootCtrl($scope, $state, $window, UserResource) {

    if ($window.navigator.geolocation) {
      $window.navigator.geolocation.getCurrentPosition(function (position) {
        $scope.location = {
          lat: position.coords.latitude,
          long: position.coords.longitude
        };
      }, function () {

      });
    } else {
      $scope.location = {
        lat: null,
        long: null
      };
    }



    $scope.$watch(function () {
      return $state.current;
    }, function (state) {
      $scope.currentState = state;
    });

    $scope.$watch('currentState', function (state) {
      $scope.sanitizedCurrentStateName = state.name.replace(/\W/g, '-');
    });

    $scope.user = UserResource.get({}).$promise.then(function(result){
      console.log($scope.user);
    });

    $scope.title = ['m.emori.es'];
    $scope.setTitle = function (title) {
      $scope.title.unshift(title);
      this.$on('$destroy', function () {
        $scope.title.shift();
      });
    };
  }
  return ["$scope", "$state", "$window", "UserResource", RootCtrl];
});
