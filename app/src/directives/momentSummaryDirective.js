define([], function () {
  function momentSummaryDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/momentSummaryDirective.html"
      };
    }
  return [momentSummaryDirective];
});