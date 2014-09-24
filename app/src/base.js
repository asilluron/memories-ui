define(['src/controllers', 'src/providers', 'src/directives'], function () {

  var memApp = angular.module("memapp", [
      "memapp.controllers",
      "memapp.providers",
      "memapp.directives",
      "ngCookies",
      "ui.router",
      "ui.utils",
      "ui.bootstrap"
    ])
    .config(function ($httpProvider) {
      $httpProvider.interceptors.push(['$cookies',
        function ($cookies) {
          return {
            request: function (config) {
              if ($cookies.jwt && !('Authorization' in config.headers) && !config._noAuthorization) {
                config.headers.Authorization = 'Bearer ' + $cookies.jwt;
              }
              return config;
            }
          };
        }
      ]);
    });

  return memApp;
});
