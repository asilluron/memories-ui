define(['src/directives/actionBarDirective', 'src/directives/memoryDetailDirective',
  'src/directives/memorySummaryDirective', 'src/directives/momentDetailDirective',
  'src/directives/momentSummaryDirective', 'src/directives/navBarDirective',
  'src/directives/timelineObjectDirective', 'src/directives/s3upload','src/directives/map', 'src/directives/loader'
], function (actionBarDirective, memoryDetailDirective, memorySummaryDirective, momentDetailDirective,
        momentSummaryDirective, navBarDirective, timelineObjectDirective, s3upload, map, loader) {
  return angular.module("memapp.directives", ["memapp.providers"])
    .directive('fa', [

      function () {
        return {
          compile: function (element, attrs) {
            element.addClass(['fa'].concat(attrs.fa.split(/\s+/)
                .map(function (part) {
                  return 'fa-' + part;
                }))
              .join(' '));
          }
        };
      }
    ])
    .directive('map', map)
    .directive('loader', loader)
    .directive('onReturn', [function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.keyup(function (event) {
            if ((event.keyCode === 13 || event.which === 13) && !event.altKey && !event.ctrlKey && !event.shiftKey) {
              scope.$eval(attrs.onReturn);
              event.preventDefault();
              event.stopPropagation();
              return false;
            }
          });
        }
      };
    }])
    .directive('s3upload', s3upload)
    .directive('actionBar', actionBarDirective)
    .directive('memoryDetail', memoryDetailDirective)
    .directive('memorySummary', memorySummaryDirective)
    .directive('momentDetail', momentDetailDirective)
    .directive('momentSummary', momentSummaryDirective)
    .directive('navBar', navBarDirective)
    .directive('timelineObject', timelineObjectDirective);
});
