define([], function () {
  function timelineObjectDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/timelineObjectDirective.html"
      };
    }
  return [timelineObjectDirective];
});