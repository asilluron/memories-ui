define(['src/controllers/MemoriesCtrl'],
    function(MemoriesCtrl) {
    return angular.module("memapp.controllers", [])
        .controller("MemoriesCtrl", MemoriesCtrl);
});
