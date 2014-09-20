define([
  'src/providers/UserResource',
  'src/providers/MemoryResource',
  'src/providers/handleLoading',
 'src/providers/socketFactoryFactory',
'src/providers/MomentFileSigResource'
], function (UserResource, MemoryResource, handleLoading, MomentFileSigResource) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("MomentFileSigResource", MomentFileSigResource)
    .factory("UserResource", UserResource)
    .factory("handleLoading", handleLoading)
    .factory("socketFactoryFactory", socketFactoryFactory);
});
