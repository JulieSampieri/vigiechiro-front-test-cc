// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  angular.module('vigiechiroApp', ['ngAnimate', 'ngRoute', 'ngSanitize', 'ngTouch', 'flow', 'appSettings', 'xin_login', 'xin_tools', 'xin_content', 'xin_session', 'xin_backend', 'xin_google_maps', 'accueilViews', 'utilisateurViews', 'taxonViews', 'protocoleViews', 'siteViews', 'participationViews', 'actualiteViews', 'donneeViews', 'uploadParticipationViews']).run(function(Backend, SETTINGS) {
    return Backend.setBaseUrl(SETTINGS.API_DOMAIN);
  }).config(function($routeProvider, RestangularProvider) {
    return $routeProvider.when('/', {
      redirectTo: '/accueil'
    }).when('/profil', {
      templateUrl: 'scripts/views/utilisateur/show_utilisateur.html',
      controller: 'ShowUtilisateurController',
      resolve: {
        $routeParams: function() {
          return {
            'userId': 'moi'
          };
        }
      },
      breadcrumbs: ngInject(function($q, session) {
        var defer;
        defer = $q.defer();
        session.getUserPromise().then(function(user) {
          return defer.resolve(user.pseudo);
        });
        return defer.promise;
      })
    }).when('/policy', {
      templateUrl: 'policy.html',
      no_login: true,
    }).when('/legal-mentions', { /*page des mentions legal*/
      templateUrl: 'legal-mentions.html',
      no_login: true,
    }).when('/cookies-policy', { /*page d'utilisations des cookies */
      templateUrl: 'cookies-policy.html',
      no_login: true,
    }).when('/terms-of-service', { /*page des conditions generales d'utilisation */
      templateUrl: 'terms-of-service.html',
      no_login: true,
    }).when('/login', { /*page de connexion*/
      templateUrl: 'login.html',
      no_login: true
    }).when('/403', {
      templateUrl: '403.html',
      no_login: true
    }).when('/404', {
      templateUrl: '404.html',
      no_login: true
    }).otherwise({
      redirectTo: '/404'
    });
  }).directive('navbarDirective', function(evalCallDefered, $window, $rootScope, $route, SETTINGS, session, Backend) {
    return {
      restrict: 'E',
      templateUrl: 'navbar.html',
      scope: {},
      link: function($scope, elem, attrs) {
        var hiddenPages = ['/login', '/policy', '/legal-mentions', '/cookies-policy', '/terms-of-service'];

        $rootScope.$on('$routeChangeSuccess', function(event, currentRoute) {
          var currentPage = currentRoute.$$route.originalPath;
          if (hiddenPages.includes(currentPage)) {
            elem.hide();
          } else {
            elem.show();
          }
        });

        var loadBreadcrumbs;
        loadBreadcrumbs = function(currentRoute) {
          var breadcrumbsDefer;
          if (currentRoute.breadcrumbs != null) {
            breadcrumbsDefer = evalCallDefered(currentRoute.breadcrumbs);
            return breadcrumbsDefer.then(function(breadcrumbs) {
              if (typeof breadcrumbs === "string") {
                return $scope.breadcrumbs = [[breadcrumbs, '']];
              } else {
                return $scope.breadcrumbs = breadcrumbs;
              }
            });
          } else {
            return $scope.breadcrumbs = [];
          }
        };
        $rootScope.$on('$routeChangeSuccess', function(currentRoute, previousRoute) {
          loadBreadcrumbs($route.current.$$route);
        });
        loadBreadcrumbs($route.current.$$route);
        $scope.isAdmin = false;
        $scope.user = {};
        session.getIsAdminPromise().then(function(isAdmin) {
          return $scope.isAdmin = isAdmin;
        });
        $scope.wantToRefuseCharte = false;
        $scope.setWantToRefuseCharte = function(val) {
          return $scope.wantToRefuseCharte = val;
        };
        $scope.updateCharte = function(charte_acceptee) {
          return Backend.one('moi').patch({
            'charte_acceptee': charte_acceptee
          }).then(function() {
            return $window.location.reload();
          }, function(error) {
            $scope.charteModalSaveError = true;
            return $scope.charteModalSaveErrorReason = error;
          });
        };
        session.getUserPromise().then(function(user) {
          $scope.user = user;
          if (user.charte_acceptee === void 0 || user.charte_acceptee === null) {
            $('#charteModal').modal();
          }
          return angular.element('.waiting-for-angular').hide();
        }, function() {
          return angular.element('.waiting-for-angular').hide();
        });
        return $scope.logout = function() {
          return session.logout();
        };
      }
    };
  });

}).call(this);
