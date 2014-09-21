define([], function () {
  function loader() {
    return {
      restrict: 'E',
      scope: {
        on: "=",
        message: "@",
        error: "=?"
      },
      replace: true,
      transclude: true,
      templateUrl: 'templates/directives/loader.html',
      link: function ($scope) {
        $scope.dots = '...';
      }
    }
  }

  return [loader];
});