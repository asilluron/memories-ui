define([], function () {
  function momentDetailDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/momentDetailDirective.html"
      };
    }
  return [momentDetailDirective];
});