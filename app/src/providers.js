define(['src/providers/UserResource'], function (UserResource) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("UserResource", UserResource);
});