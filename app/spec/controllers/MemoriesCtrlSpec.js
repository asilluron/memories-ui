define(['src/controllers'], function () {
  "use strict";
  describe("Controller: MemoriesCtrl", function () {
    var UserResourceMock, scope, q, ctrl, staticUserMock;

    beforeEach(function () {
      staticUserMock = generateStaticUserMock();
      UserResourceMock = generateResourceMock();

      sinon.stub(UserResourceMock, "get")
        .onCall(0)
        .returns(staticUserMock);
      sinon.spy(UserResourceMock, "save");

      module(function ($provide) {
        $provide.value("UserResource", UserResourceMock);
      });

      module("memapp.controllers");

      inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        q = $q;
        ctrl = $controller("MemoriesCtrl", {
          $scope: scope
        });
      });
    });

    describe("Basic functionality", function () {
      it("it set user to the result of the UserResource", function () {
        expect(scope.user)
          .toEqual(staticUserMock);
      });
    });


    function generateResourceMock() {
      return {
        get: function () {

        },
        save: function () {

        }
      };
    }

    function generateStaticUserMock() {
      return [{
        name: "Tester Mc Tester"
      }];
    }
  });
});