
define('src/config',[],function () {
  
  return {
    API_URL: "http://localhost:8700",
  };
});
define('src/controllers/EditMemoryCtrl',[],function () {
  function EditMemoryCtrl($scope, MemoryResource) {
    // TODO: handle edit mode
    $scope.memory = {
      name: "",
      shareability: "private",
      startDate: null,
      endDate: null,
      description: ""
    };

    $scope.SHAREABILITY_DESCRIPTIONS = {
      "private": "Your memory cannot be seen by anyone but participants of the memory.",
      "unlisted": "Your memory will not be listed on your profile, but is only accessible to anyone with a link.",
      "public": "Your memory will be listed on your public profile, and is accessible to anyone."
    };

    $scope.datePickersOpen = {
      startDate: false,
      endDate: false,
    };

    $scope.openDatePicker = function ($event, name) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.datePickersOpen[name] = true;
    };

    $scope.creating = false;
    $scope.errorMessage = null;
    $scope.create = function () {
      $scope.creating = true;
      $scope.errorMessage = null;
      MemoryResource.save($scope.memory)
        .$promise
        .then(function () {
          redirectToMemory();
        }, function (response) {
          // TODO: check response.status
          $scope.errorMessage = "The server returned an unexpected response: " + response.status;
        })
        .then(null, function () {
          $scope.errorMessage = "An unknown error occurred";
        })
        .finally(function () {
          $scope.creating = false;
        });
    };
  }

  return ["$scope", "MemoryResource", EditMemoryCtrl];
});
define('src/controllers/MemoriesCtrl',[],function () {
  function MemoriesCtrl($scope, $q, MemoryResource, socketFactoryFactory, UserResource) {
  	$scope.memories = [];
  	MemoryResource.query().$promise.then(function(result){
    	result.forEach(function(memory){
    		memory.socket = socketFactoryFactory(memory._id);
    		$scope.memories.push(memory);
    		memory.socket.join('chat');
    		memory.socket.on("milestone", function(msg){
    			console.log("new milestone action!", msg);
	        });
	        memory.socket.on("user", function(msg){
	        	console.log("new user action completed!");
	        });
	        memory.socket.on("moment", function(msg){
	        	console.log("new moment action!");
	        });
	        memory.socket.on("edit", function(msg){
	        	console.log("new edit to this memory");
	        });
    	});
    });
    $scope.user = UserResource.get();
  }

  return ["$scope", "$q", "MemoryResource", "socketFactoryFactory", "UserResource", MemoriesCtrl];
});
define('src/controllers',[
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl'
  ],
  function (EditMemoryCtrl, MemoriesCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("EditMemoryCtrl", EditMemoryCtrl)
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

define('src/providers/MemoryResource',[], function () {
  function MemoryResource($resource, API_URL) {
    return $resource(API_URL + "/memories/:id", {});
  }

  return ['$resource', 'API_URL', MemoryResource];
});
define('src/providers',[
  'src/providers/UserResource',
  'src/providers/MemoryResource'
], function (UserResource, MemoryResource) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("UserResource", UserResource);
});
define('src/directives',[], function () {
  return angular.module("memapp.directives", ["memapp.providers"])
    .directive('fa', [

      function () {
        return {
          compile: function (element, attrs) {
            element.addClass(['fa'].concat(attrs.fa.split(/\s+/)
                .map(function (part) {
                  return 'fa-' + part;
                }))
              .join(' '));
          }
        };
      }
    ]);
});
define('src/app',['src/config', 'src/controllers', 'src/providers', 'src/directives'], function (config) {
  angular.module("memapp", [
    "memapp.controllers",
    "memapp.providers",
    "memapp.directives",
    "ngCookies",
    "ui.router",
    "ui.utils",
    "ui.bootstrap"
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
        .state('memories.add', {
          url: "/new",
          templateUrl: "templates/new-memory.html",
          controller: "EditMemoryCtrl"
        })
        .state('memories.view', {
          url: "/:id",
          templateUrl: "templates/memory.html",
          controller: "MemoryCtrl"
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