define(function () {
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
    $scope.pending = false;
    $scope.error = null;
    $scope.login = function () {
      $scope.pending = true;
      $scope.error = null;
      $http.post("/login", $scope.user)
        .then(function (value) {
          $cookies.jwt = value.data.jwt;
          $state.go('memories');
        }, function (error) {
          $scope.error = error;
        }).finally(function () {
          $scope.pending = false;
        });
    };

    $scope.successfullyRegistered = false;
    $scope.register = function () {
      $scope.pending = false;
      $scope.error = null;
      var user = $scope.registerUser;
      $http.post(API_URL + "/user", {
        preferredName: user.preferredName,
        email: user.email,
        username: user.username,
        password: user.password,
      })
        .then(function () {
          $scope.successfullyRegistered = true;
          $scope.changeToLogin();
        }, function (error) {
          $scope.error = error;
        }).finally(function () {
          $scope.pending = false;
        });
    };

    $scope.isSignedIn = function () {
      return !!$cookies.jwt;
    };
    $scope.logout = function () {
      delete $cookies.jwt;
    };

    $scope.registering = false;
    $scope.changeToRegister = function () {
      $scope.registering = true;
    };
    $scope.changeToLogin = function () {
      $scope.registering = false;
    };
  }

  return ["$scope", "$http", "$cookies", "$state", "API_URL", HomeCtrl];
});
