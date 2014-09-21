define([
    'src/controllers/EditMemoryCtrl',
    'src/controllers/MemoriesCtrl',
    'src/controllers/MemoryCtrl',
    'src/controllers/RootCtrl',
    'src/controllers/ChatCtrl'
  ],
  function (EditMemoryCtrl, MemoriesCtrl, MemoryCtrl, RootCtrl, ChatCtrl) {
    return angular.module("memapp.controllers", [])
      .controller("EditMemoryCtrl", EditMemoryCtrl)
      .controller("MemoriesCtrl", MemoriesCtrl)
      .controller("MemoryCtrl", MemoryCtrl)
      .controller("RootCtrl", RootCtrl)
      .controller("ChatCtrl", ChatCtrl);
  });