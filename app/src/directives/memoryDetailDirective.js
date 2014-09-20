define([], function () {
  function memoryDetailDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	transclude: true,
    	templateUrl: "templates/directives/memoryDetailDirective.html"
      };
    }
  return [memoryDetailDirective];
});