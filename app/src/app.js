define(['src/config', 'src/controllers', 'src/providers', 'src/directives'], function (config) {
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
 	.constant("UBER_TOKEN", "O_Y-SG2M2PpzCh0UMjjtYRu99CsKDrlMbOTNTTuH")
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push(['$cookies', function ($cookies) {
        return {
          request: function (config) {
            if ($cookies.jwt) {
              config.headers.Authorization = 'Bearer ' + $cookies.jwt;
            }
            return config;
          }
        };
      }]);
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
      $urlRouterProvider.otherwise("/memories");

      var resolveMemoryByStateParam = function (paramName) {
        return ['$stateParams', 'MemoryResource',
          function ($stateParams, MemoryResource) {
            return MemoryResource.get({
              id: $stateParams[paramName]
            });
          }
        ];
      };

      $stateProvider
        .state('memories', {
          url: "/memories",
          views: {
            "main": {
              templateUrl: "templates/memories.html",
              controller: "MemoriesCtrl"
            },
            "header": {
              templateUrl: "templates/actionbars/memories.html"
            }
          }

        })
        .state('memories.add', {
          url: "/new",
          templateUrl: "templates/edit-memory.html",
          controller: "EditMemoryCtrl",
          resolve: {
            memory: [
              function () {
                return null;
              }
            ]
          }
        })
        .state('memories.view', {
          url: "/:id",
          templateUrl: "templates/memory.html",
          controller: "MemoryCtrl",
          resolve: {
            memory: resolveMemoryByStateParam('id')
          }
        })
        .state('memories.chat', {
          url: "/:id/chat",
          templateUrl: "templates/chat.html",
          controller: "ChatCtrl",
          resolve: {
            memory: resolveMemoryByStateParam('id')
          }
        })
        .state('memories.edit', {
          url: "/:id/edit",
          templateUrl: "templates/edit-memory.html",
          controller: "EditMemoryCtrl",
          resolve: {
            memory: resolveMemoryByStateParam('id')
          }
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
        })
        .state('home', {
          url: "/",
          views: {
            "main": {
              templateUrl: "templates/home.html",
              controller: "HomeCtrl"
            }
          }
        });
    });

  angular.element(document)
    .ready(function () {
      angular.bootstrap(document, ['memapp']);
    });
});
