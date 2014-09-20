
define('src/config',[],function () {
  
  return {
    API_URL: "http://memories-api.herokuapp.com/",
  };
});
define('src/controllers/MemoriesCtrl',[],function() {

    function MemoriesCtrl($scope, UserResource) {
        $scope.user = UserResource.get();

    }

    return ["$scope", "UserResource", MemoriesCtrl];
});

define('src/controllers',['src/controllers/MemoriesCtrl'],
    function(MemoriesCtrl) {
    return angular.module("memapp.controllers", [])
        .controller("MemoriesCtrl", MemoriesCtrl);
});

/**
 * @module memapp.providers
 * @class UserResource
 */

define('src/providers/UserResource',[], function() {
    function UserResource($resource, API_URL) {
        return $resource(API_URL + "/user", {});
    }

    return ['$resource', 'API_URL', UserResource];
});

define('src/providers',['src/providers/UserResource'
], function(UserResource) {
    return angular.module("memapp.providers", ["ngResource"])
        .factory("UserResource", UserResource);
});

define('src/directives',[], function() {
    return angular.module("memapp.directives", ["memapp.providers"]);
});

define('src/app',['src/config', 'src/controllers', 'src/providers', 'src/directives'], function(config) {



});
