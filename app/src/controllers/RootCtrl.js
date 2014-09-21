define(function () {
  function RootCtrl($scope, $state) {
    $scope.$watch(function () {
      return $state.current;
    }, function (state) {
      $scope.currentState = state;
    });

    $scope.$watch('currentState', function (state) {
      $scope.sanitizedCurrentStateName = state.name.replace(/\W/g, '-');
    });
  }
  return ["$scope", "$state", RootCtrl];
});
  
