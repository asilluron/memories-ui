define([], function () {
  function uberService($http, UBER_TOKEN) {
    return {
      products: function () {
        return $http({
          method: 'GET',
          url: '/v1/products',
          headers: {
            'Authorization': 'Token ' + UBER_TOKEN
          }
        });
      },
      price: function (locations) {
        return $http({
          method: 'GET',
          url: '/v1/estimates/price',
          headers: {
            'Authorization': 'Token ' + UBER_TOKEN
          },
          params: {
          	start_latitude: locations.source.latitude,
          	start_longitude: locations.source.longitude,
          }
        });
      },
      time: function (locations) {
        return $http({
          method: 'GET',
          url: '/v1/estimates/time',
          headers: {
            'Authorization': 'Token ' + UBER_TOKEN
          },
          params: {
          	start_latitude: locations.source.latitude,
          	start_longitude: locations.source.longitude,
          	end_latitude: locations.source.latitude,
          	end_longtiude: locations.source.longitude
          }
        });
      }
    };
  }

  return ['$http', "UBER_TOKEN", uberService];
});