var myApp = angular.module('app', []);

myApp.controller('helloworldController', function ($scope, $rootScope) {
    $scope.title = "Welcome to meeting planner!";
});
