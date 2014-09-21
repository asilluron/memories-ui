
define('src/config',[],function () {
  
  return {
    API_URL: "http://localhost:8700",
  };
});
define('src/controllers/EditMemoryCtrl',[],function () {
  var makeEmptyMoment = function () {
    return {
      text: "",
      location: {
        name: "",
        gps: null,
        address: ""
      },
      sharing: "private"
    };
  }
  function EditMemoryCtrl($scope, $state, handleLoading, memory, MemoryResource) {
    var isNew = $scope.isNew = !memory;
    $scope.memory = handleLoading(memory || {
      about: {
        name: "",
        primaryMoment: null
      },
      preferences: {
        sharing: "private",
      },
      startDate: null,
      endDate: null,
      participants: []
    }, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    }, function (memory) {
      $scope.primaryMoment = memory.about.primaryMoment || (memory.about.primaryMoment = makeEmptyMoment());
    });
    if (isNew) {
      $scope.setTitle('New Memory');
    } else {
      $scope.setTitle('Edit Memory');
    }

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

    $scope.saving = false;
    $scope.errorMessage = null;
    $scope.save = function () {
      $scope.saving = true;
      $scope.errorMessage = null;
      (isNew ? MemoryResource.save($scope.memory).$promise : $scope.memory.$update())
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
          $scope.saving = false;
        });
    };
  }

  return ["$scope", "$state", "handleLoading", "memory", "MemoryResource", EditMemoryCtrl];
});
define('src/controllers/MemoriesCtrl',[],function () {
  function MemoriesCtrl($scope, handleLoading, MemoryResource, socketFactoryFactory, UserResource) {
    $scope.memories = handleLoading(MemoryResource.query(), function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.memories.$promise.then(function (memories) {
      memories.forEach(function (memory) {
        var socket = memory.socket = socketFactoryFactory(memory._id);
        socket.join('chat');
        socket.on("milestone", function (msg) {
          console.log("new milestone action!", msg);
        });
        socket.on("user", function (msg) {
          console.log("new user action completed!");
        });
        socket.on("moment", function (msg) {
          console.log("new moment action!");
        });
        socket.on("edit", function (msg) {
          console.log("new edit to this memory");
        });
      });
    });
  }
  return ["$scope", "handleLoading", "MemoryResource", "socketFactoryFactory", "UserResource", MemoriesCtrl];
});
  

define('src/controllers/MemoryCtrl',[],function () {
  function MemoryCtrl($scope, handleLoading, memory, MilestoneResource, MomentResource, timelineEventZipper) {
    $scope.memory = handleLoading(memory, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.moments = [];
    $scope.timelineEvents = [];
    $scope.memory.$promise.then(function (memory) {
      $scope.setTitle(memory.about.name);
      $scope.moments = handleLoading(MomentResource.query({id:memory._id}), function (value) {
        $scope.loadingMoments = value;
      }, function (error) {
        $scope.loadMomentsError = error;
      });

      $scope.moments.$promise.then(function () {
        $scope.timelineEvents = timelineEventZipper.zip($scope.moments, null, true);
      });
    });

    var reset = function () {
      $scope.moment = {};
      $scope.milestone = {};
    };
    reset();

    $scope.momentFlag = null;
    $scope.newMoment = function(type) {
      if ($scope.momentFlag === type) {
        $scope.momentFlag = null;
      } else {
        $scope.momentFlag = type;
      }
    };

    $scope.addMoment = function(moment){
      $scope.addingMoment = true;
      var newMoment = new MomentResource();
      angular.extend(newMoment, moment);
      angular.extend(newMoment, {memory: memory._id, sharing: "private"});
      newMoment.$save(function(){
        $scope.momentFlag = null;
        $scope.addingMoment = false;
        reset();
      });
    };

    $scope.addMilestone = function (milestone, moment) {
      $scope.addingMoment = true;
      var newMoment = new MomentResource();
      angular.extend(newMoment, moment);
      angular.extend(newMoment, {memory: memory._id, sharing: "private"});
      newMoment.$save(function(){
        $scope.momentFlag = null;
        $scope.addingMoment = false;
        reset();
      });
    }

    $scope.enableMilestoneStartDate = function () {
      $scope.milestone.hasStartDate = true;
      $scope.milestone.startDate = new Date();
      $scope.milestone.startTime = new Date();
    }

    $scope.disableMilestoneStartDate = function () {
      $scope.milestone.hasStartDate = false;
    }

    $scope.enableMilestoneEndDate = function () {
      $scope.milestone.hasEndDate = true;
      $scope.milestone.endDate = new Date();
      $scope.milestone.endTime = new Date();
    }

    $scope.disableMilestoneEndDate = function () {
      $scope.milestone.hasEndDate = false;
    }
  }

  return ["$scope", "handleLoading", "memory", "MilestoneResource", "MomentResource", "timelineEventZipper", MemoryCtrl];
});

define('src/controllers/RootCtrl',[],function () {
  function RootCtrl($scope, $state) {
    $scope.$watch(function () {
      return $state.current;
    }, function (state) {
      $scope.currentState = state;
    });

    $scope.$watch('currentState', function (state) {
      $scope.sanitizedCurrentStateName = state.name.replace(/\W/g, '-');
    });

    $scope.title = ['m.emori.es'];
    $scope.setTitle = function (title) {
      $scope.title.unshift(title);
      this.$on('$destroy', function () {
        $scope.title.shift();
      });
    }
  }
  return ["$scope", "$state", RootCtrl];
});
  

define('src/controllers',[
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl',
    'src/controllers/MemoryCtrl',
    'src/controllers/RootCtrl'
  ],
  function (EditMemoryCtrl, MemoriesCtrl, MemoryCtrl, RootCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl)
      .controller("MemoryCtrl", MemoryCtrl)
      .controller("RootCtrl", RootCtrl);
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
    return $resource(API_URL + "/memories/:id", {id:'@_id'}, {
      update: {
        method: 'PATCH',
        transformRequest: function (memory) {
          return angular.toJson({
            about: {
              name: memory.about.name
            },
            startDate: memory.startDate,
            endDate: memory.endDate,
            preferences: {
              sharing: memory.preferences.sharing
            },
            participants: memory.participants.map(function (participant) {
              return {
                role: participant.role,
                user: participant.user._id
              };
            })
          });
        }
      }
    });
  }

  return ['$resource', 'API_URL', MemoryResource];
});
define('src/providers/handleLoading',[], function () {
  function handleLoading() {
    return function (model, setLoading, setError, onLoaded) {
      setError(null);
      var promise = model && model.$promise;
      if (promise != null) {
        setLoading(true);
        promise.then(onLoaded, setError).finally(function () {
          setLoading(false);
        });
      } else {
        setLoading(false);
        onLoaded(model);
      }
      return model;
    };
  }

  return [handleLoading];
});


define('src/providers/socketFactoryFactory',[], function(){
  function socketFactoryFactory ($rootScope, API_URL){
    return function socketFactory(context){
      var socket = io.connect(API_URL + "/" + context);
      return {
        on: function (eventName, callback) {
          socket.on(eventName, function () {  
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });
        },
        emit: function (eventName, data, callback) {
          socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          });
        },
        join: function(room, callback){
          socket.emit("joinRoom", room, function(){
            var args = arguments;
            $rootScope.$apply(function(){
              if(callback){
                callback.apply(socket, args);
              }
            });
          });
        },
        socket: socket
      };
    };
  }

  return ['$rootScope', "API_URL", socketFactoryFactory];
});
/**
 * @module memapp.providers
 * @class MomentFileSigResource
 */

define('src/providers/MomentFileSigResource',[], function() {
    function MomentFileSigResource($resource, API_URL) {
        return $resource(API_URL + "/momentfilesig", {});
    }

    return ['$resource', 'API_URL', MomentFileSigResource];
});


define('src/providers/MomentResource',[], function () {
  function MomentResource($resource, API_URL) {
    return $resource(API_URL + "/memories/:id/moments/:momentId", {id:'@memory', momentId:'@_id'});
  }

  return ['$resource', 'API_URL', MomentResource];
});


define('src/providers/timelineEventZipper',[], function(){
  function timelineEventZipper() {
    var toDate = function (value) {
      if (value instanceof Date) {
        return value;
      } else if (typeof value === 'number' || typeof value === 'string') {
        return new Date(value);
      } else {
        return null;
      }
    };
    var cmp = function (a, b) {
      return a === b ? 0 : a < b ? -1 : 1;
    };
    var getEventDate = function (event) {
      if (event.createdDate) {
        return toDate(event.createdDate);
      } else if (event.startDate) {
        return toDate(event.startDate);
      } else if (event.endDate) {
        return toDate(event.endDate);
      } else {
        return null;
      }
    };
    var sortByDate = function (items) {
      items.sort(function (a, b) {
        return cmp(a.date, b.date);
      });
    };
    var makeEvent = function (type, value, date) {
      return {
        type: type,
        value: value,
        date: date
      };
    };
    var calculateMomentType = function (moment) {
      if (moment.imageUrl) {
        return 'image';
      } else {
        return 'message';
      }
    };
    var momentToEvent = function (moment) {
      return makeEvent(calculateMomentType(moment), moment, getEventDate(moment));
    };
    var milestoneToEvent = function (milestone) {
      return makeEvent('milestone', milestone, getEventDate(milestone));
    };
    var zip = function (moments, milestones, descending) {
      var events = moments.map(momentToEvent).concat(milestones.map(milestoneToEvent));
      sortByDate(events);
      if (descending) {
        events.reverse();
      }
      return events;
    };
    this.zip = function (moments, milestones, descending) {
      return zip(
        moments || [],
        milestones || [],
        !!descending);
    };
  }

  return [timelineEventZipper];
});
define('src/providers',[
  'src/providers/UserResource',
  'src/providers/MemoryResource',
  'src/providers/handleLoading',
  'src/providers/socketFactoryFactory',
  'src/providers/MomentFileSigResource',
  'src/providers/MomentResource',
  'src/providers/timelineEventZipper'
], function (UserResource, MemoryResource, handleLoading, socketFactoryFactory, MomentFileSigResource, MomentResource, timelineEventZipper) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("MomentFileSigResource", MomentFileSigResource)
    .factory("MomentResource", MomentResource)
    .factory("UserResource", UserResource)
    .factory("handleLoading", handleLoading)
    .factory("socketFactoryFactory", socketFactoryFactory)
    .service("timelineEventZipper", timelineEventZipper);
});
define('src/directives/actionBarDirective',[], function () {
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
define('src/directives/memoryDetailDirective',[], function () {
  function memoryDetailDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/memoryDetailDirective.html"
      };
    }
  return [memoryDetailDirective];
});
define('src/directives/memorySummaryDirective',[], function () {
  function memorySummaryDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/memorySummaryDirective.html"
      };
    }
  return [memorySummaryDirective];
});
define('src/directives/momentDetailDirective',[], function () {
  function momentDetailDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/momentDetailDirective.html"
      };
    }
  return [momentDetailDirective];
});
define('src/directives/momentSummaryDirective',[], function () {
  function momentSummaryDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/momentSummaryDirective.html"
      };
    }
  return [momentSummaryDirective];
});
define('src/directives/navBarDirective',[], function () {
  function navBarDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	transclude: true,
    	templateUrl: "templates/directives/navBarDirective.html"
      };
    }
  return [navBarDirective];
});
define('src/directives/timelineObjectDirective',[], function () {
  function timelineObjectDirective() {
    return {
    	restrict: "E",
    	replace: true,
    	templateUrl: "templates/directives/timelineObjectDirective.html"
      };
    }
  return [timelineObjectDirective];
});
define('src/directives/s3upload',[], function() {


    function s3upload($http, MomentFileSigResource, UserResource) {
        var directiveDefinitionObject = {
            priority: 0,
            replace: false,
            transclude: false,
            templateUrl: 'templates/directives/s3upload.html',
            restrict: 'E',
            scope: {
                url: '=',
                prefix: '@'
            },
            link: function(scope, iElement) {

                var fileElem = iElement.find(".upload_files");
                fileElem.on("change", uploadFile);


                function uploadFile(event) {
                    var file = event.target.files[0];
                    var fileType = file.type;
                    var fileKey = scope.prefix + file.name;
                    MomentFileSigResource.get({
                        "s3_object_name": fileKey,
                        "s3_object_type": fileType
                    }).$promise.then(function(creds) {
                        $http.put(creds.signedUrl, file, {
                            headers: {
                                'Authorization': function() {
                                    return null;
                                },
                                "Content-Type": fileType
                            }
                        }).success(function() {
                            scope.url = creds.publicUrl;
                        });

                    });
                }
            }
        };
        return directiveDefinitionObject;
    }

    return ['$http', 'MomentFileSigResource', 'UserResource', s3upload];
});

define('src/directives/loader',[], function () {
  function loader() {
    return {
      restrict: 'E',
      scope: {
        on: "=",
        message: "@",
        error: "=?"
      },
      replace: true,
      transclude: true,
      templateUrl: 'templates/directives/loader.html',
      link: function ($scope) {
        $scope.dots = '...';
      }
    }
  }

  return [loader];
});
define('src/directives',['src/directives/actionBarDirective', 'src/directives/memoryDetailDirective',
  'src/directives/memorySummaryDirective', 'src/directives/momentDetailDirective',
  'src/directives/momentSummaryDirective', 'src/directives/navBarDirective',
  'src/directives/timelineObjectDirective', 'src/directives/s3upload', 'src/directives/loader'
], function (actionBarDirective, memoryDetailDirective, memorySummaryDirective, momentDetailDirective,
        momentSummaryDirective, navBarDirective, timelineObjectDirective, s3upload, loader) {
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
    ])
    .directive('loader', loader)
    .directive('onReturn', [function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.keyup(function (event) {
            if ((event.keyCode === 13 || event.which === 13) && !event.altKey && !event.ctrlKey && !event.shiftKey) {
              scope.$eval(attrs.onReturn);
              event.preventDefault();
              event.stopPropagation();
              return false;
            }
          });
        }
      };
    }])
    .directive('s3upload', s3upload)
    .directive('actionBar', actionBarDirective)
    .directive('memoryDetail', memoryDetailDirective)
    .directive('memorySummary', memorySummaryDirective)
    .directive('momentDetail', momentDetailDirective)
    .directive('momentSummary', momentSummaryDirective)
    .directive('navBar', navBarDirective)
    .directive('timelineObject', timelineObjectDirective);
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
          controller: "ChatCtrl"
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
        });
    });

  angular.element(document)
    .ready(function () {
      angular.bootstrap(document, ['memapp']);
    });
});
