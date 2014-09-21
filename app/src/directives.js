define(['src/directives/actionBarDirective', 'src/directives/memoryDetailDirective',
  'src/directives/memorySummaryDirective', 'src/directives/momentDetailDirective',
  'src/directives/momentSummaryDirective', 'src/directives/navBarDirective',
  'src/directives/timelineObjectDirective', 'src/directives/s3upload', 'src/directives/loader'
], function (actionBarDirective, memoryDetailDirective, memorySummaryDirective, momentDetailDirective,
        momentSummaryDirective, navBarDirective, timelineObjectDirective, s3upload, loader) {
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
    .directive('loader', loader)
    .directive('s3upload', s3upload)
    .directive('actionBar', actionBarDirective)
    .directive('memoryDetail', memoryDetailDirective)
    .directive('memorySummary', memorySummaryDirective)
    .directive('momentDetail', momentDetailDirective)
    .directive('momentSummary', momentSummaryDirective)
    .directive('navBar', navBarDirective)
    .directive('timelineObject', timelineObjectDirective);
});
