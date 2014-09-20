
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

define('src/providers',['src/providers/UserResource'], function (UserResource) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("UserResource", UserResource);
});
define('src/directives',[], function() {
    return angular.module("memapp.directives", ["memapp.providers"]);
});

define('src/app',['src/config', 'src/controllers', 'src/providers', 'src/directives'], function (config) {
  angular.module("memapp", [
    "memapp.controllers",
    "memapp.providers",
    "memapp.directives",
    "ngCookies",
    "ui.router",
    "ui.utils"
  ])
    .constant("API_URL", config.API_URL)
    .run(function ($http, $cookies) {
      var jwt = $cookies.jwt;
      $http.defaults.headers.common.Authorization = 'Bearer ' + jwt;
    })
    .config(function ($interpolateProvider, $stateProvider, $urlRouterProvider) {
      $interpolateProvider.startSymbol('{[{')
        .endSymbol('}]}');

      $urlRouterProvider.otherwise("/");

      $stateProvider
        .state('memories', {
          url: "/memories",
          templateUrl: "templates/memories.html",
          controller: "MemoriesCtrl"
        })
        .state('memories.view', {
          url: "/:id",
          templateUrl: "templates/memory.html",
          controller: "MemoryCtrl"
        })
        .state('memories.add', {
          url: "/new",
          templateUrl: "templates/new-memory.html",
          controller: "EditMemoryCtrl"
        })
        .state('memories.chat', {
          url: "/:id/chat",
          templateUrl: "templates/chat.html",
          controller: "ChatCtrl"
        })
        .state('memories.edit', {
          url: "/:id/edit/",
          templateUrl: "templates/edit-memory.html",
          controller: "EditMemoryCtrl"
        })
        .state('memories.moment', {
          url: ":id/facet/:momentId",
          templateUrl: "templates/moment.html",
          controller: "MomentCtrl"
        })
        .state('user', {
          url: "/user",
          templateUrl: "templates/user.html",
          controller: "UserCtrl"
        })
        .state('users', {
          url: "/users/:id",
          templateUrl: "templates/user.html",
          controller: "UserCtrl"
        })
        .state('albums', {
          url: "/albums",
          templateUrl: "templates/albums.html",
          controller: "AlbumsCtrl"
        })
        .state('albums.view', {
          url: "/:id",
          templateUrl: "templates/album.html",
          controller: "AlbumCtrl"
        })
        .state('memories.milestone', {
          url: "/:id/milestone/:milestoneId",
          templateUrl: "templates/milestone.html",
          controller: "MilestoneCtrl"
        });
    });

  angular.element(document)
    .ready(function () {
      angular.bootstrap(document, ['memapp']);
    });
});