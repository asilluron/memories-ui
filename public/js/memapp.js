
define('src/config',[],function () {
  
  return {
    API_URL: "http://localhost:8700",
  };
});
define('src/controllers/EditMemoryCtrl',[],function () {
  function EditMemoryCtrl($scope, $state, MemoryResource) {
    // TODO: handle edit mode
    $scope.memory = {
      about: {
        name: ""
      },
      preferences: {
        sharing: "private",
      },
      startDate: null,
      endDate: null,
      participants: []
    };
    $scope.primaryMoment = {
      text: "",
      location: {
        name: "",
        gps: null,
        address: ""
      },
      milestone: null,
      sharing: "private"
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
        .then(function (response) {
          $state.go('memories.view', response._id);
        }, function (response) {
          if (!response.status) {
            $scope.errorMessage = "Could not connect to server";
          } else {
            // TODO: check response.status
            $scope.errorMessage = "The server returned an unexpected response: " + response.status;
          }
        })
        .then(null, function () {
          $scope.errorMessage = "An unknown error occurred";
        })
        .finally(function () {
          $scope.creating = false;
        });
    };
  }

  return ["$scope", "$state", "MemoryResource", EditMemoryCtrl];
});
define('src/controllers/MemoriesCtrl',[],function () {
  function MemoriesCtrl($scope, MemoryResource, UserResource) {
    $scope.memories = MemoryResource.query();
    $scope.user = UserResource.get();
  }

  return ["$scope", "MemoryResource", "UserResource", MemoriesCtrl];
});
define('src/controllers/MemoryCtrl',[],function () {
  function MemoryCtrl($scope, memory) {
    $scope.memory = memory;
  }

  return ["$scope", "memory", MemoryCtrl];
});
define('src/controllers',[
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl',
    'src/controllers/MemoryCtrl'
  ],
  function (EditMemoryCtrl, MemoriesCtrl, MemoryCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl)
      .controller("MemoryCtrl", MemoryCtrl);
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
          controller: "MemoryCtrl",
          resolve: {
            memory: ['$stateParams', 'MemoryResource', function ($stateParams, MemoryResource) {
              return MemoryResource.get({id: $stateParams.id});
            }]
          }
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