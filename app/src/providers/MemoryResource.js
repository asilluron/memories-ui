define([], function () {
  function MemoryResource($resource, $http, API_URL) {
    var resource = $resource(API_URL + "/memories/:id", {id:'@_id'}, {
      update: {
        method: 'PATCH',
        transformRequest: function (memory) {
          return angular.toJson({
            about: {
              name: memory.about.name
            },
            startDate: memory.startDate,
            endDate: memory.endDate,
            preferences: {
              sharing: memory.preferences.sharing
            },
            participants: memory.participants.map(function (participant) {
              return {
                role: participant.role,
                user: participant.user._id
              };
            })
          });
        }
      }
    });

    resource.invite = function (memory, email) {
      return $http.post(API_URL + "/memories/" + memory._id + "/invite", {
        email: email
      }).then(function (response) {
        return response.data;
      });
    };

    return resource;
  }

  return ['$resource', '$http', 'API_URL', MemoryResource];
});