define([], function () {
  function memoryDetailDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/memoryDetailDirective.html"
      };
    }
  return [memoryDetailDirective];
});