define([], function () {
  function MemoryResource($resource, API_URL) {
    return $resource(API_URL + "/memories/:id", {});
  }

  return ['$resource', 'API_URL', MemoryResource];
});