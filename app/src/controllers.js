define([
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl',
    'src/controllers/MemoryCtrl'
  ],
  function (EditMemoryCtrl, MemoriesCtrl, MemoryCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl)
      .controller("MemoryCtrl", MemoryCtrl);
  });