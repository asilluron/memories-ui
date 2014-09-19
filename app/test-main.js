(function() {
    "use strict";

    var tests = [];
    for (var file in window.__karma__.files) {

        if (window.__karma__.files.hasOwnProperty(file)) {
            if (/^\/base\/app\/spec\//i.test(file) && /Spec\.js$/.test(file)) {
                tests.push(file);
            }
        }
    }

    var require_config = {
        "baseUrl": "/base/app",
        "deps": ["angular", "angular-mocks", "sinon", "angular-resource", "jasmine-sinon"],
        "paths": {
            "angular": "vendor/angular/angular",
            "angular-ui-router": "vendor/angular-ui-router/angular-ui-router",
            "angular-resource": "vendor/angular-resource/angular-resource",
            "angular-mocks": "vendor/angular-mocks/angular-mocks",
            "sinon": "vendor/sinon/lib/sinon",
            "jasmine-sinon": "vendor/jasmine-sinon/lib/jasmine-sinon"
        },
        "shim": {
            "angular-mocks": ["angular"],
            "angular-resource": ["angular"],
            "angular-ui-router": ["angular"]
        }
    };

    require_config["callback"] = function() { /*jshint ignore:line */
        requirejs(["src/app"], function() {
            Object.prototype["@" + Math.random()] = null;
            requirejs(tests, function() {
                window.__karma__.start();
            });
        });
    };

    requirejs.config(require_config);
}());
