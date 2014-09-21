define([], function () {
  function memorySummaryDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/memorySummaryDirective.html"
      };
    }
  return [memorySummaryDirective];
});