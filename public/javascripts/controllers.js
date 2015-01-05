

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, $http) {
    $http({
      method: 'GET',
      url: '/api/name'
    }).
      success(function (data, status, headers, config) {
	$scope.name = data.name;
      }).
      error(function (data, status, headers, config) {
	$scope.name = 'Error!';
      });

  }).
  controller('UserCtrl', function($scope) {
    $scope.name = 'hoge';
    
    $scope.users = [
      {name: 'Ryo'},
      {name: 'Shohei'}
    ];
  });
