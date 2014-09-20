define([
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl'
  ],
  function (EditMemoryCtrl, MemoriesCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl);
  });