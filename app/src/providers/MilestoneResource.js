define([], function () {
  function MilestoneResource($resource, API_URL) {
    return $resource(API_URL + "/memories/:id/milestones/:milestoneId", {id:'@memory', milestoneId:'@_id'});
  }

  return ['$resource', 'API_URL', MilestoneResource];
});