define(['src/config', 'src/controllers', 'src/providers', 'src/directives'], function(config) {
 
    angular.module("svapp", ["svapp.controllers", "svapp.providers", "svapp.directives", "ngCookies", "ui.router", "ui.utils"]).constant("API_URL", config.API_URL).run(function($http, $cookies) {
        var jwt = $cookies.jwt;
        $http.defaults.headers.common.Authorization = 'Bearer ' + jwt;
    }).config(function($interpolateProvider, $stateProvider, $urlRouterProvider) {
        $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
 
        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/admin");
        //
        // Now set up the states
        $stateProvider
            .state('dashboard', {
                url: "/admin",
                templateUrl: "templates/dashboard.html",
                controller: "SceneCtrl"
            })
            .state('adduser', {
                url: "/adduser",
                templateUrl: "templates/adduser.html"
            })
            .state('approvals', {
                url: "/approvals",
                template: "<section ui-view></section>",
                controller: "ApprovalCtrl"
            })
            .state('approvals.pending', {
                url: "/pending",
                templateUrl: "templates/viewapprovals.html"
            })
            .state('scenes', {
                url: "/scenes",
                template: "<section ui-view></section>",
                controller: "SceneCtrl"
            })
            .state('scenes.add', {
                url: "/add",
                templateUrl: "templates/addscene.html"
            })
            .state('scenes.view', {
                url: "/view",
                templateUrl: "templates/viewscenes.html"
            })
            .state('addtag', {
                url: "/addtag",
                templateUrl: "templates/addtag.html"
            }).state('viewtag', {
                url: "/viewtag",
                templateUrl: "templates/viewtags.html"
            });
    });
 
});