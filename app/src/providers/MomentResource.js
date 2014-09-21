define([], function () {
  function MomentResource($resource, API_URL) {
    return $resource(API_URL + "/memories/:id/moments/:momentId", {id:'@memory', momentId:'@_id'});
  }

  return ['$resource', 'API_URL', MomentResource];
});