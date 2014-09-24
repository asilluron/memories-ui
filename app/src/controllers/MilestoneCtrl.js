define(function () {
  function MilestoneCtrl($scope, $q, MilestoneResource) {
  	$scope.milestones = [];
    $scope.socket = {};
  	MilestoneResource.query().$promise.then(function(result){
    	result.forEach(function(milestone){
        milestone.socket =  $scope.memories[milestone.memory._id].socket;
        milestone.socket.join(milestone._id);
        milestone.on("edit", function(msg){

        });
        milestone.on("user", function(msg){

        });
        milestone.on("milestoneMoment", function(msg){

        });
    		$scope.milestones.push(milestone);
    	});
    });


  }

  return ["$scope", "$q","MilestoneResource", MilestoneCtrl];
});
