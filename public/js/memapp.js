
define('src/config',[],function () {
  
  return {
    API_URL: "http://localhost:8700",
  };
});
define('src/controllers/HomeCtrl',[],function () {
  function HomeCtrl($scope, $http, $cookies, $state, API_URL) {
    $scope.user = {
      username: "",
      password: "",
      rememberMe: false,
    };
    $scope.registerUser = {
      preferredName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: ""
    };
    $scope.error = null;
    $scope.login = function () {
      $scope.error = null;
      $http.post("/login", $scope.user)
        .then(function (value) {
          $cookies.jwt = value.data.jwt;
          $state.go('memories');
        }, function (error) {
          $scope.error = error;
        });
    };

    $scope.successfullyRegistered = false;
    $scope.register = function () {
      $scope.error = null;
      var user = $scope.registerUser;
      $http.post(API_URL + "/user", {
        preferredName: user.preferredName,
        email: user.email,
        username: user.username,
        password: user.password,
      })
        .then(function (value) {
          $scope.successfullyRegistered = true;
          $scope.changeToLogin();
        }, function (error) {
          $scope.error = error;
        });
    }

    $scope.isSignedIn = function () {
      return !!$cookies.jwt;
    };
    $scope.logout = function () {
      delete $cookies.jwt;
    }

    $scope.registering = false;
    $scope.changeToRegister = function () {
      $scope.registering = true;
    }
    $scope.changeToLogin = function () {
      $scope.registering = false;
    }
  }

  return ["$scope", "$http", "$cookies", "$state", "API_URL", HomeCtrl];
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
  function MemoriesCtrl($scope, $rootScope, handleLoading, MemoryResource, socketFactoryFactory, UserResource) {
    $scope.memories = handleLoading(MemoryResource.query(), function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.memories.$promise.then(function (memories) {
      memories.forEach(function (memory) {
        var socket = memory.socket = socketFactoryFactory(memory._id);
        socket.on("helloWorld", function(data){
          console.log(data);
        });
        socket.emit("handShake", {data: "TEST"});
        socket.on("milestone", function (msg) {
          $rootScope.$emit("TIMELINE:REFRESH");
        });
        socket.on("user", function (msg) {
          console.log("new user action completed!");
        });
        socket.on("moment", function (msg) {
          $rootScope.$emit("TIMELINE:REFRESH");
        });
        socket.on("edit", function (msg) {
          console.log("new edit to this memory");
        });
      });
    });
  }
  return ["$scope", "$rootScope", "handleLoading", "MemoryResource", "socketFactoryFactory", "UserResource", MemoriesCtrl];
});
  

define('src/controllers/MemoryCtrl',[],function () {
  function MemoryCtrl($scope, $rootScope, $q, handleLoading, memory, MilestoneResource, MomentResource, MemoryResource,
    timelineEventZipper, uberService) {
    $scope.memory = handleLoading(memory, function (value) {
      $scope.loading = value;
    }, function (error) {
      $scope.loadError = error;
    });
    $scope.timelineEvents = [];
    $scope.memory.$promise.then(function (memory) {
      $scope.setTitle(memory.about.name);
      var moments = handleLoading(MomentResource.query({
        id: memory._id
      }), function (value) {
        $scope.loadingMoments = value;
      }, function (error) {
        $scope.loadMomentsError = error;
      });

      var milestones = handleLoading(MilestoneResource.query({
        id: memory._id
      }), function (value) {
        $scope.loadingMilestones = value;
      }, function (error) {
        $scope.loadMilestonesError = error;
      });

      $q.all([moments.$promise, milestones.$promise])
        .then(function () {
          $scope.timelineEvents = timelineEventZipper.zip(moments, milestones, true);
        });
    });

    $scope.refresh = function refresh() {
      $scope.memory.$promise.then(function (memory) {
        $q.all({
          milestones: MilestoneResource.query({
            id: memory._id
          }).$promise,
          moments: MomentResource.query({
            id: memory._id
          }).$promise
        })
          .then(function (o) {
            $scope.timelineEvents = timelineEventZipper.zip(o.moments, o.milestones, true);
          });
      });
    };

    $rootScope.$on("TIMELINE:REFRESH", function () {
      $scope.refresh();
    });


    var reset = function () {
      $scope.momentFlag = null;
      $scope.moment = {};
      $scope.milestone = {};
      $scope.invitation = {};
    };
    reset();

    $scope.newMoment = function (type) {
      if ($scope.momentFlag === type) {
        $scope.momentFlag = null;
      } else {
        $scope.momentFlag = type;
      }
    };

    var makeMomentResource = function (moment) {
      var newMoment = new MomentResource();
      angular.extend(newMoment, moment, {
        memory: memory._id,
        sharing: "private"
      });
      return newMoment;
    };
    $scope.addMoment = function (moment) {
      $scope.addingMoment = true;
      makeMomentResource(moment)
        .$save(function () {
          $scope.addingMoment = false;
          reset();
        });
    };

    var fromDualDate = function (date, time) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), 0, 0);
    };
    $scope.addMilestone = function (milestone, moment) {
      $scope.addingMoment = true;
      var newMilestone = new MilestoneResource();
      angular.extend(newMilestone, {
        memory: memory._id,
        participation: 'anyone',
        participants: [],
        about: {
          startDate: milestone.hasStartDate ? fromDualDate(milestone.startDate, milestone.startTime) : null,
          endDate: milestone.hasEndDate ? fromDualDate(milestone.endDate, milestone.endTime) : null,
          desc: ""
        },
        viewability: 'participant',
        moment: angular.extend({}, moment, {
          sharing: "private"
        })
      });
      newMilestone.$save(function () {
        $scope.addingMoment = false;
        reset();
      });
    };

    $scope.enableMilestoneStartDate = function () {
      $scope.milestone.hasStartDate = true;
      $scope.milestone.startDate = new Date();
      $scope.milestone.startTime = new Date();
    };

    $scope.disableMilestoneStartDate = function () {
      $scope.milestone.hasStartDate = false;
    };

    $scope.enableMilestoneEndDate = function () {
      $scope.milestone.hasEndDate = true;
      $scope.milestone.endDate = new Date();
      $scope.milestone.endTime = new Date();
    };

    $scope.disableMilestoneEndDate = function () {
      $scope.milestone.hasEndDate = false;
    };

    $scope.addInvite = function (invitation) {
      // TODO: error handling
      MemoryResource.invite($scope.memory, invitation.email)
        .then(function () {
          reset();
        });
    };
  }

  return ["$scope", "$rootScope", "$q", "handleLoading", "memory", "MilestoneResource", "MomentResource", "MemoryResource",
    "timelineEventZipper", "uberService", MemoryCtrl
  ];
});
define('src/controllers/RootCtrl',[],function () {
  function RootCtrl($scope, $state, $window, UserResource) {

    if ($window.navigator.geolocation) {
      $window.navigator.geolocation.getCurrentPosition(function (position) {
        $scope.location = {
          lat: position.coords.latitude,
          long: position.coords.longitude
        };
      }, function () {

      });
    } else {
      $scope.location = {
        lat: null,
        long: null
      };
    }



    $scope.$watch(function () {
      return $state.current;
    }, function (state) {
      $scope.currentState = state;
    });

    $scope.$watch('currentState', function (state) {
      $scope.sanitizedCurrentStateName = state.name.replace(/\W/g, '-');
    });

    $scope.user = UserResource.get({});

    $scope.title = ['m.emori.es'];
    $scope.setTitle = function (title) {
      $scope.title.unshift(title);
      this.$on('$destroy', function () {
        $scope.title.shift();
      });
    };
  }
  return ["$scope", "$state", "$window", "UserResource", RootCtrl];
});

define('src/controllers/ChatCtrl',[],function () {
  function ChatCtrl($scope, memory, socketFactoryFactory) {
    $scope.currentChatMessage = "";
    $scope.chatMessages = [{message: "woo!", user: "testUser"}];
    this.socket = {};

    var self = this;
    memory.$promise.then(function (result) {
      self.chatSocket = socketFactoryFactory(result._id);
      
      socketFactoryFactory(result._id).emit("nameReg", {
        name: $scope.user.preferredName
      });

      socketFactoryFactory(result._id).on("handShake", function () {
       self.chatSocket.emit("nameReg", {
          name: $scope.user.preferredName
        });
      });


      self.chatSocket.on("chatMessage", function storeChatMessage(data) {
        $scope.chatMessages.push(data);
      });

      
    });

    $scope.sendMessage = function sendMessage(){
      if( $scope.currentChatMessage !== ""){
        $scope.chatMessages.push({message: $scope.currentChatMessage, user: "Me!"});
        self.chatSocket.emit("chatMessage", {
          text: $scope.currentChatMessage
        });
        $scope.currentChatMessage = "";
      }
    };

    $scope.openMessage = function openMessage(index){
      $scope.currentChatMessage = $scope.chatMessages[index];
    };

  }

  return ["$scope", "memory", "socketFactoryFactory", ChatCtrl];
});
define('src/controllers',[
    'src/controllers/HomeCtrl',
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl',
    'src/controllers/MemoryCtrl',
    'src/controllers/RootCtrl',
    'src/controllers/ChatCtrl'
  ],
  function (HomeCtrl, EditMemoryCtrl, MemoriesCtrl, MemoryCtrl, RootCtrl, ChatCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("HomeCtrl", HomeCtrl)
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl)
      .controller("MemoryCtrl", MemoryCtrl)
      .controller("RootCtrl", RootCtrl)
      .controller("ChatCtrl", ChatCtrl);
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
  function MemoryResource($resource, $http, API_URL) {
    var resource = $resource(API_URL + "/memories/:id", {id:'@_id'}, {
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

    resource.invite = function (memory, email) {
      return $http.post(API_URL + "/memories/" + memory._id + "/invite", {
        email: email
      }).then(function (response) {
        return response.data;
      });
    };

    return resource;
  }

  return ['$resource', '$http', 'API_URL', MemoryResource];
});
define('src/providers/MilestoneResource',[], function () {
  function MilestoneResource($resource, API_URL) {
    return $resource(API_URL + "/memories/:id/milestones/:milestoneId", {id:'@memory', milestoneId:'@_id'});
  }

  return ['$resource', 'API_URL', MilestoneResource];
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


define('src/providers/socketFactoryFactory',[], function () {
  function socketFactoryFactory($rootScope, API_URL) {
    return function socketFactory(context) {
      var cache = {};
      //"http:" + API_URL.split(":")[1] + ":8080";
      var socketAPI = API_URL;
      var socket = io.connect(context ? socketAPI + "/" + context : socketAPI);
      if (cache[context]) {
        return cache[context];
      } else {
        var contextSocket =  {
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
          join: function (room, callback) {
            socket.emit("joinRoom", room, function () {
              var args = arguments;
              $rootScope.$apply(function () {
                if (callback) {
                  callback.apply(socket, args);
                }
              });
            });
          },
          socket: socket
        };
        cache[context] = contextSocket;
        return cache[context];
      }
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
    var removeMilestonePrimaryMoments = function (moments, milestones) {
      var primaryMomentIds = milestones
        .map(function (milestone) {
          return ((milestone.about || {}).primaryMoment || {})._id || null;
        })
        .filter(function (id) {
          return id;
        });
      return moments
        .filter(function (moment) {
          return primaryMomentIds.indexOf(moment._id) === -1;
        });
    };
    var zip = function (moments, milestones, descending) {
      var filteredMoments = removeMilestonePrimaryMoments(moments, milestones);
      var events = filteredMoments.map(momentToEvent)
        .concat(milestones.map(milestoneToEvent));
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
define('src/providers/uberService',[], function () {
  function uberService($http, UBER_TOKEN) {
    return {
      products: function () {
        return $http({
          method: 'GET',
          url: 'https://api.uber.com//v1/products',
          headers: {
            'Authorization': 'Token ' + UBER_TOKEN
          }
        });
      },
      price: function (locations) {
        return $http({
          method: 'GET',
          url: 'https://api.uber.com//v1/estimates/price',
          headers: {
            'Authorization': 'Token ' + UBER_TOKEN
          },
          params: {
          	start_latitude: locations.source.latitude,
          	start_longitude: locations.source.longitude,
          }
        });
      },
      time: function (locations) {
        return $http({
          method: 'GET',
          url: 'https://api.uber.com//v1/estimates/time',
          headers: {
            'Authorization': 'Token ' + UBER_TOKEN
          },
          params: {
          	start_latitude: locations.source.latitude,
          	start_longitude: locations.source.longitude,
          	end_latitude: locations.source.latitude,
          	end_longtiude: locations.source.longitude
          }
        });
      }
    };
  }

  return ['$http', "UBER_TOKEN", uberService];
});
define('src/providers',[
  'src/providers/UserResource',
  'src/providers/MemoryResource',
  'src/providers/MilestoneResource',
  'src/providers/handleLoading',
  'src/providers/socketFactoryFactory',
  'src/providers/MomentFileSigResource',
  'src/providers/MomentResource',
  'src/providers/timelineEventZipper',
  'src/providers/uberService'
], function (UserResource, MemoryResource, MilestoneResource, handleLoading, socketFactoryFactory, MomentFileSigResource, MomentResource, timelineEventZipper, uberService) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("MilestoneResource", MilestoneResource)
    .factory("MomentFileSigResource", MomentFileSigResource)
    .factory("MomentResource", MomentResource)
    .factory("UserResource", UserResource)
    .factory("handleLoading", handleLoading)
    .factory("socketFactoryFactory", socketFactoryFactory)
    .service("timelineEventZipper", timelineEventZipper)
    .service("uberService", uberService);
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
                            },
                            _noAuthorization: true
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

define('src/directives/map',[], function () {

  var DEFAULT_ZOOM = 12;
  function map($window) {
    var directiveDefinitionObject = {
      priority: 0,
      replace: false,
      transclude: false,
      templateUrl: 'templates/directives/map.html',
      restrict: 'E',
      scope: {
        lat: '=',
        long: '=',
        height: '@',
        width: '@',
        zoom: '=?'
      },
      link: function (scope, iElement) {

        var mapCanvas = iElement.find(".map-canvas")[0];
        var mapOptions = {
          zoom: scope.zoom || DEFAULT_ZOOM,
          center: new $window.google.maps.LatLng(scope.lat, scope.long)
        };

        var map = new $window.google.maps.Map(mapCanvas,mapOptions);

      }
    };
    return directiveDefinitionObject;
  }

  return ['$window', map];
});

define('src/directives/locationTypeAhead',[], function () {
//<location-type-ahead lat="location.lat" long="location.long"></location-type-ahead>

  function locationTypeAhead($http, $window) {
    var directiveDefinitionObject = {
      priority: 0,
      replace: false,
      transclude: false,
      templateUrl: 'templates/directives/locationTypeAhead.html',
      restrict: 'E',
      scope: {
        lat: '=',
        long: '='
      },
      link: function (scope, iElement) {
        var autocomplete = new $window.google.maps.places.Autocomplete(iElement.find(".autocomplete")[0]);


        $window.google.maps.event.addListener(autocomplete, 'place_changed', function () {

          var place = autocomplete.getPlace();
          if (!place.geometry) {
            return;
          }
          scope.lat = place.geometry.location.lat();
          scope.lang = place.geometry.location.lng();

        });



      }
    };
    return directiveDefinitionObject;
  }

  return ['$http', '$window', locationTypeAhead];
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
  'src/directives/timelineObjectDirective', 'src/directives/s3upload','src/directives/map', 'src/directives/locationTypeAhead','src/directives/loader'
], function (actionBarDirective, memoryDetailDirective, memorySummaryDirective, momentDetailDirective,
        momentSummaryDirective, navBarDirective, timelineObjectDirective, s3upload, map, locationTypeAhead, loader) {
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
    .directive('map', map)
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
    .directive('locationTypeAhead', locationTypeAhead)
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
 	.constant("UBER_TOKEN", "O_Y-SG2M2PpzCh0UMjjtYRu99CsKDrlMbOTNTTuH")
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push(['$cookies', function ($cookies) {
        return {
          request: function (config) {
            if ($cookies.jwt && !('Authorization' in config.headers) && !config._noAuthorization) {
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
