define(function() {

    function MemoriesCtrl($scope, UserResource) {
        $scope.user = UserResource.get();

    }

    return ["$scope", "UserResource", MemoriesCtrl];
});
