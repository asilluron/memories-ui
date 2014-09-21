define([], function () {


  function map($window) {
    var directiveDefinitionObject = {
      priority: 0,
      replace: false,
      transclude: false,
      templateUrl: 'templates/directives/map.html',
      restrict: 'E',
      scope: {
        lat: '=',
        long: '=',
        height: '@',
        width: '@'
      },
      link: function (scope, iElement) {

        var mapCanvas = iElement.find(".map-canvas")[0];
        var mapOptions = {
          zoom: 8,
          center: new $window.google.maps.LatLng(scope.lat, scope.long)
        };

        var map = new $window.google.maps.Map(mapCanvas,mapOptions);

      }
    };
    return directiveDefinitionObject;
  }

  return ['$window', map];
});
