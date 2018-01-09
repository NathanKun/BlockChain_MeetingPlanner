var myApp = angular.module('app', []);

myApp.controller('helloworldController', function ($scope, $rootScope) {
    $scope.title = "Hello World!";
});
