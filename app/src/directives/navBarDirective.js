define([], function () {
  function navBarDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	transclude: true,
    	templateUrl: "templates/directives/navBarDirective.html"
      };
    }
  return [navBarDirective];
});