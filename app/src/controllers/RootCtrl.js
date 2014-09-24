define(function () {
  function RootCtrl($scope, $state, $window, $cookies, UserResource) {

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

    $scope.user = UserResource.get({});

    $scope.title = ['m.emori.es'];
    $scope.setTitle = function (title) {
      $scope.title.unshift(title);
      this.$on('$destroy', function () {
        $scope.title.shift();
      });
    };

    $scope.logout = function () {
      delete $cookies.jwt;
      $state.go('home');
    };

  }
  return ["$scope", "$state", "$window", "$cookies", "UserResource", RootCtrl];
});
