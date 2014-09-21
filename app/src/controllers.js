define([
    'src/controllers/HomeCtrl',
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl',
    'src/controllers/MemoryCtrl',
    'src/controllers/RootCtrl',
    'src/controllers/ChatCtrl'
  ],
  function (HomeCtrl, EditMemoryCtrl, MemoriesCtrl, MemoryCtrl, RootCtrl, ChatCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("HomeCtrl", HomeCtrl)
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl)
      .controller("MemoryCtrl", MemoryCtrl)
      .controller("RootCtrl", RootCtrl)
      .controller("ChatCtrl", ChatCtrl);
  });