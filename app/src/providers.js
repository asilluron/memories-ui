define([
  'src/providers/UserResource',
  'src/providers/MemoryResource',
  'src/providers/MilestoneResource',
  'src/providers/handleLoading',
  'src/providers/socketFactoryFactory',
  'src/providers/MomentFileSigResource',
  'src/providers/MomentResource',
  'src/providers/timelineEventZipper'
], function (UserResource, MemoryResource, MilestoneResource, handleLoading, socketFactoryFactory, MomentFileSigResource, MomentResource, timelineEventZipper) {
  return angular.module("memapp.providers", ["ngResource"])
    .factory("MemoryResource", MemoryResource)
    .factory("MilestoneResource", MilestoneResource)
    .factory("MomentFileSigResource", MomentFileSigResource)
    .factory("MomentResource", MomentResource)
    .factory("UserResource", UserResource)
    .factory("handleLoading", handleLoading)
    .factory("socketFactoryFactory", socketFactoryFactory)
    .service("timelineEventZipper", timelineEventZipper);
});