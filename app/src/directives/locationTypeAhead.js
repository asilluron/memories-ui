define([], function () {
//<location-type-ahead lat="location.lat" long="location.long"></location-type-ahead>

  function locationTypeAhead($http, $window) {
    var directiveDefinitionObject = {
      priority: 0,
      replace: false,
      transclude: false,
      templateUrl: 'templates/directives/locationTypeAhead.html',
      restrict: 'E',
      scope: {
        lat: '=',
        long: '='
      },
      link: function (scope, iElement) {
        var autocomplete = new $window.google.maps.places.Autocomplete(iElement.find(".autocomplete")[0]);


        $window.google.maps.event.addListener(autocomplete, 'place_changed', function () {

          var place = autocomplete.getPlace();
          if (!place.geometry) {
            return;
          }
          scope.lat = place.geometry.location.lat();
          scope.lang = place.geometry.location.lng();

        });



      }
    };
    return directiveDefinitionObject;
  }

  return ['$http', '$window', locationTypeAhead];
});
