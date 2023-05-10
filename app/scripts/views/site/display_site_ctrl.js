// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  var breadcrumbsGetSiteDefer;

  breadcrumbsGetSiteDefer = void 0;

  angular.module('displaySiteViews', ['ngRoute', 'textAngular', 'xin_backend', 'protocole_map']).config(function($routeProvider) {
    return $routeProvider.when('/sites', {
      templateUrl: 'scripts/views/site/list_sites.html',
      controller: 'ListSitesController',
      breadcrumbs: 'Sites'
    }).when('/sites/mes-sites', {
      templateUrl: 'scripts/views/site/list_sites.html',
      controller: 'ListMesSitesController',
      breadcrumbs: 'Mes Sites'
    }).when('/sites/:siteId', {
      templateUrl: 'scripts/views/site/display_site.html',
      controller: 'DisplaySiteController',
      breadcrumbs: ngInject(function($q) {
        var breadcrumbsDefer;
        breadcrumbsDefer = $q.defer();
        breadcrumbsGetSiteDefer = $q.defer();
        breadcrumbsGetSiteDefer.promise.then(function(site) {
          return breadcrumbsDefer.resolve([['Sites', '#/sites'], [site.titre, '#/sites/' + site._id]]);
        });
        return breadcrumbsDefer.promise;
      })
    });
  }).controller('ListSitesController', function($scope, Backend, session, DelayedEvent) {
    var delayedFilter;
    $scope.title = "Tous les sites";
    $scope.swap = {
      title: "Voir mes sites",
      value: "/mes-sites"
    };
    $scope.lookup = {};
    delayedFilter = new DelayedEvent(500);
    $scope.filterField = '';
    $scope.$watch('filterField', function(filterValue) {
      return delayedFilter.triggerEvent(function() {
        if ((filterValue != null) && filterValue !== '') {
          return $scope.lookup.q = filterValue;
        } else if ($scope.lookup.q != null) {
          return delete $scope.lookup.q;
        }
      });
    });
    return $scope.resourceBackend = Backend.all('sites');
  }).controller('ListMesSitesController', function($scope, Backend, session, DelayedEvent) {
    var delayedFilter;
    $scope.title = "Mes sites";
    $scope.swap = {
      title: "Voir tous les sites",
      value: ""
    };
    $scope.lookup = {};
    delayedFilter = new DelayedEvent(500);
    $scope.filterField = '';
    $scope.$watch('filterField', function(filterValue) {
      return delayedFilter.triggerEvent(function() {
        if ((filterValue != null) && filterValue !== '') {
          return $scope.lookup.q = filterValue;
        } else if ($scope.lookup.q != null) {
          return delete $scope.lookup.q;
        }
      });
    });
    return $scope.resourceBackend = Backend.all('moi/sites');
  }).controller('DisplaySiteController', function($routeParams, $scope, $modal, Backend, session) {
    $scope.participationsLookup = {};
    $scope.participationsResource = Backend.all("sites/" + $routeParams.siteId + "/participations");
    session.getIsAdminPromise().then(function(isAdmin) {
      return $scope.isAdmin = isAdmin;
    });
    Backend.one('sites', $routeParams.siteId).get().then(function(site) {
      if (breadcrumbsGetSiteDefer != null) {
        breadcrumbsGetSiteDefer.resolve(site);
        breadcrumbsGetSiteDefer = void 0;
      }
      $scope.site = site;
      $scope.typeSite = site.protocole.type_site;
      return session.getUserPromise().then(function(user) {
        var i, len, protocole, ref, results;
        $scope.userId = user._id;
        ref = user.protocoles || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          protocole = ref[i];
          if (protocole.protocole._id === $scope.site.protocole._id) {
            if (protocole.valide != null) {
              $scope.isProtocoleValid = true;
            }
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    }, function(error) {
      return window.location = '#/404';
    });
    return $scope["delete"] = function() {
      var modalInstance;
      modalInstance = $modal.open({
        templateUrl: 'scripts/views/site/modal/delete.html',
        controller: 'ModalDeleteSiteController',
        resolve: {
          site: function() {
            return $scope.site;
          }
        }
      });
      return modalInstance.result.then(function() {
        return $scope.site.remove().then(function() {
          return window.location = '#/sites';
        }, function(error) {
          throw error;
        });
      });
    };
  }).directive('displaySiteDirective', function($route, session, protocolesFactory) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/views/site/display_site_drt.html',
      scope: {
        site: '=',
        typeSite: '@'
      },
      link: function(scope, elem, attrs) {
        attrs.$observe('typeSite', function(typeSite) {
          var map, mapDiv;
          if (typeSite) {
            mapDiv = elem.find('.g-maps')[0];
            map = protocolesFactory(mapDiv, scope.typeSite);
            return map.loadMapDisplay(scope.site.plain());
          }
        });
        scope.lockSite = function(lock) {
          scope.site.patch({
            'verrouille': lock
          }).then(function() {}, function(error) {
            throw error;
          });
          return $route.reload();
        };
        return session.getIsAdminPromise().then(function(isAdmin) {
          return scope.isAdmin = isAdmin;
        });
      }
    };
  }).directive('displaySitesDirective', function(session, Backend, protocolesFactory) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/views/site/display_sites_drt.html',
      scope: {
        protocoleId: '@',
        typeSite: '@'
      },
      link: function(scope, elem, attrs) {
        var getSites, loadMap, makeRequest, map, sites;
        sites = [];
        map = null;
        scope.loading = true;
        session.getUserPromise().then(function(user) {
          return scope.userId = user._id;
        });
        attrs.$observe('typeSite', function(typeSite) {
          if (typeSite != null) {
            return makeRequest();
          }
        });
        attrs.$observe('protocoleId', function(protocoleId) {
          if (protocoleId != null) {
            return makeRequest();
          }
        });
        makeRequest = function() {
          var mapDiv, ref, sitesPromise;
          if (scope.typeSite === '' || scope.protocoleId === '') {
            return;
          }
          mapDiv = elem.find('.g-maps')[0];
          map = protocolesFactory(mapDiv, "ALL_" + scope.typeSite);
          sitesPromise = null;
          if ((ref = scope.typeSite) === "CARRE" || ref === "POINT_FIXE") {
            sitesPromise = Backend.all("protocoles/" + scope.protocoleId + "/sites").all('grille_stoc');
          } else if (scope.typeSite === "ROUTIER") {
            sitesPromise = Backend.all("protocoles/" + scope.protocoleId + "/sites").all('tracet');
          }
          return getSites(sitesPromise, 1);
        };
        getSites = function(sitesPromise, page) {
          if (sitesPromise) {
            return sitesPromise.getList({
              page: page,
              max_results: 2000
            }).then(function(result) {
              sites = sites.concat(result.plain());
              if (result._meta.page * result._meta.max_results < result._meta.total) {
                return getSites(sitesPromise, page + 1);
              } else {
                scope.loading = false;
                return loadMap(sites);
              }
            });
          }
        };
        return loadMap = function(sites) {
          return map.loadMap(sites);
        };
      }
    };
  }).directive('listSitesDirective', function(session, Backend) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/views/site/list_sites_drt.html',
      scope: {
        protocoleId: '@'
      },
      link: function(scope, elem, attrs) {
        session.getUserPromise().then(function(user) {
          return scope.userId = user._id;
        });
        return scope.$watch('protocoleId', function(value) {
          if (value !== '') {
            return scope.resourceBackend = Backend.all('protocoles/' + value + '/sites');
          }
        });
      }
    };
  });

}).call(this);