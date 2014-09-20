/**
 * @module memapp.providers
 * @class MomentFileSigResource
 */

define([], function() {
    function MomentFileSigResource($resource, API_URL) {
        return $resource(API_URL + "/momentfilesig", {});
    }

    return ['$resource', 'API_URL', MomentFileSigResource];
});

