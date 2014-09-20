define([], function () {
  function MilestoneResource($resource, API_URL) {
    return $resource(API_URL + "/memory/:id/milestones", {});
  }

  return ['$resource', 'API_URL', MilestoneResource];
});