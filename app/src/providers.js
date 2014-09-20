define([
  'src/providers/UserResource',
  'src/providers/MemoryResource'
], function (UserResource, MemoryResource) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("UserResource", UserResource);
});