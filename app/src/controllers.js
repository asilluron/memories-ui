define([
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl',
    'src/controllers/MemoryCtrl',
    'src/controllers/RootCtrl'
  ],
  function (EditMemoryCtrl, MemoriesCtrl, MemoryCtrl, RootCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl)
      .controller("MemoryCtrl", MemoryCtrl)
      .controller("RootCtrl", RootCtrl);
  });