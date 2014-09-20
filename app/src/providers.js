define([
  'src/providers/UserResource',
  'src/providers/MemoryResource',
  'src/providers/handleLoading'
], function (UserResource, MemoryResource, handleLoading) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("UserResource", UserResource)
    .factory("handleLoading", handleLoading);
});