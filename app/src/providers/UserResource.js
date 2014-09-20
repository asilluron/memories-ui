/**
 * @module memapp.providers
 * @class UserResource
 */

define([], function() {
    function UserResource($resource, API_URL) {
        return $resource(API_URL + "/user", {});
    }

    return ['$resource', 'API_URL', UserResource];
});
