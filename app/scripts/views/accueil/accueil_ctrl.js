// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  angular.module('accueilViews', ['ngRoute', 'xin_backend', 'xin_session', 'xin_uploadFile']).config(function($routeProvider) {
    return $routeProvider.when('/accueil', {
      templateUrl: 'scripts/views/accueil/accueil.html',
      controller: 'AccueilController'
    });
  }).controller('AccueilController', function($scope, Backend, session) {
    return session.getUserPromise().then(function(user) {
      $scope.isAdmin = false;
      if (user.role === "Administrateur") {
        $scope.isAdmin = true;
      }
      return Backend.all('moi/sites').getList().then(function(sites) {
        return $scope.userSites = sites.plain();
      });
    });
  });

}).call(this);
