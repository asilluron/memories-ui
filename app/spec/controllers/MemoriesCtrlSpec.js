define(['src/controllers'], function () {
  "use strict";
  var $q;
  describe("q scaffold", function(){
    it("sets up the q", function(){
      inject(function(_$q_){
        $q = _$q_;
      });
      expect(true).toBe(true);
    });
  });
  describe("Controller: MemoriesCtrl", function () {
    var UserResourceMock, scope, ctrl, staticUserMock, staticMemoryMock, staticMemories, MemoryResourceMock, testDate, socketIoMock;

    beforeEach(function () {
      testDate = Date.now;
      staticUserMock = generateStaticUserMock();
      UserResourceMock = generateResourceMock();
      staticMemoryMock = generateStaticMemoryMock();
      MemoryResourceMock = generateResourceMock();
      socketIoMock = generateStaticSocketIoMock();

      module(function ($provide) {
        $provide.value("UserResource", UserResourceMock);
        $provide.value("MemoryResource", MemoryResourceMock);
        $provide.value("socketFactoryFactory", socketIoMock);
      });

      module("memapp.controllers");

      inject(function ($controller, $rootScope, _$q_) {
        scope = $rootScope.$new();
        $q = _$q_;

        sinon.stub(UserResourceMock, "get")
        .onCall(0)
        .returns(staticUserMock);
        sinon.spy(UserResourceMock, "save");

        sinon.stub(MemoryResourceMock, "get")
        .onCall(0)
        .returns(staticMemoryMock);
        sinon.spy(MemoryResourceMock, "save");
        sinon.stub(MemoryResourceMock, "query")
        .onCall(0)
        .returns({
          $promise: $q.when([])
        });

        ctrl = $controller("MemoriesCtrl", {
          $scope: scope
        });
      });
    });

    describe("Basic functionality", function () {
      it("it set user to the result of the UserResource", function () {
        scope.$digest();
        expect(scope.user)
        .toEqual(staticUserMock);
      });
      it("sets the memories scope property to the result of MemoryResource", function(){
        console.log('alpha');
        scope.$digest();
        scope.$digest();
        scope.$digest();
        scope.$digest();
        console.log('bravo');
        expect(scope.memories).toEqual(staticMemories);
      });
      it("creates a new socket.io context and connects to it for each Memory gleaned from the result of MemoryResource when it resolved", function(){
        //expect(scope.memories[0].socket).toEqual(generateStaticSocketIoMock);
      });
    });


    function generateResourceMock() {
      return {
        get: function () {

        },
        save: function () {

        },
        query: function(){

        }
      };
    }

    function generateStaticMemoryMock(){
      var promise = $q.when([{
       about: {
        name: "My Cool Memory",
        primaryMoment: generateStaticMomentMock()[0]
      },
        createdDate: testDate,
        modifiedDate: testDate,
        startDate: testDate,
        preferences: {
          sharing: "public"
        },
        endDate: testDate,
        active: true,
        participants: [{acceptance: "yes", role: "admin", user: generateStaticUserMock()[0]}]
      }]);
      return {$promise: promise};
    }

    function generateStaticSocketIoMock(){
      return {
        on: sinon.spy(),
        emit: sinon.spy(),
        join: sinon.spy(),
        socket: {socket: "Hello"}
      };
    }

    function generateStaticUserMock() {
      return [{
        name: "Tester Mc Tester"
      }];
    }

    function generateStaticMomentMock(){
      var deferred = $q.defer();
      deferred.resolve([{
        name: "My Sick Moment"
      }]);
      return {$promise: deferred.promise};
    }
  });
});