define([], function () {
  function actionBarDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	transclude: true,
    	templateUrl: "templates/directives/actionBarDirective.html"
      };
    }
  return [actionBarDirective];
});