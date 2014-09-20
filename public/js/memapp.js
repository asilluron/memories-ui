
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
          $state.go('memories.view', {id: response._id});
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
  function MemoriesCtrl($scope, handleLoading, MemoryResource, UserResource) {
    $scope.memories = handleLoading(MemoryResource.query(), function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.user = UserResource.get();
  }

  return ["$scope", "handleLoading", "MemoryResource", "UserResource", MemoriesCtrl];
});
define('src/controllers/MemoryCtrl',[],function () {
  function MemoryCtrl($scope, handleLoading, memory) {
    $scope.memory = handleLoading(memory, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
  }

  return ["$scope", "handleLoading", "memory", MemoryCtrl];
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
define('src/providers/handleLoading',[], function () {
  function handleLoading() {
    return function (model, setLoading, setError) {
      setError(null);
      var promise = model && model.$promise;
      if (promise != null) {
        setLoading(true);
        promise.then(null, setError).finally(function () {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
      return model;
    }
  }

  return [handleLoading];
});
define('src/providers',[
  'src/providers/UserResource',
  'src/providers/MemoryResource',
  'src/providers/handleLoading'
], function (UserResource, MemoryResource, handleLoading) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("UserResource", UserResource)
    .factory("handleLoading", handleLoading);
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

      var removeTrailingSlash = function (path, query) {
        if (path !== '/' && path.charAt(path.length - 1) === '/') {
          return path.substring(0, path.length - 1) + query;
        }
      };
      $urlRouterProvider.rule(function ($injector, $location) {
        var url = $location.url();

        var queryIndex = url.indexOf('?');
        if (queryIndex === -1) {
          return removeTrailingSlash(url, "");
        } else {
          return removeTrailingSlash(url.substring(0, queryIndex), url.substring(queryIndex));
        }
      });
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
            memory: ['$stateParams', 'MemoryResource',
              function ($stateParams, MemoryResource) {
                return MemoryResource.get({
                  id: $stateParams.id
                });
              }
            ]
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