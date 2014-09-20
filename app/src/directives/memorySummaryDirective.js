define([], function () {
  function memorySummaryDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/memoryDirective.html"
      };
    }
  return [memorySummaryDirective];
});