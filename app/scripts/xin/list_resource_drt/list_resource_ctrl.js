// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  angular.module('xin_listResource', ['ngRoute', 'angularUtils.directives.dirPagination', 'xin_session']).config(function($compileProvider, paginationTemplateProvider) {
    paginationTemplateProvider.setPath('scripts/xin/list_resource_drt/dirPagination.tpl.html');
    return $compileProvider.directive('compile', function($compile) {
      return function(scope, element, attrs) {
        return scope.$watch(function(scope) {
          return scope.$eval(attrs.compile);
        }, function(value) {
          element.html(value);
          return $compile(element.contents())(scope);
        });
      };
    });
  }).directive('listResourceDirective', function(session, Backend) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'scripts/xin/list_resource_drt/list_resource.html',
      controller: 'ListResourceController',
      scope: {
        resourceBackend: '=',
        lookup: '=?',
        others: '=?',
        customUpdateResourcesList: '=?'
      },
      link: function(scope, elem, attrs, ctrl, transclude) {
        if (attrs.others) {
          scope.$watch('others', function(others) {
            var key, results, value;
            results = [];
            for (key in others) {
              value = others[key];
              results.push(scope[key] = value);
            }
            return results;
          }, true);
        }
        if (attrs.lookup == null) {
          scope.lookup = {
            page: 1,
            max_result: 20
          };
        }
        return scope.$watch('lookup', function(lookup) {
          if (lookup != null) {
            scope.lookup.page = scope.lookup.page || 1;
            scope.lookup.max_results = scope.lookup.max_results || 20;
            if (!transclude) {
              throw "Illegal use of lgTranscludeReplace directive in the template," + " no parent directive that requires a transclusion found.";
              return;
            }
            return transclude(function(clone) {
              scope.resourceTemplate = '';
              return clone.each(function(index, node) {
                if (node.outerHTML != null) {
                  return scope.resourceTemplate += node.outerHTML;
                }
              });
            });
          }
        });
      }
    };
  }).controller('ListResourceController', function($scope, $timeout, $location, session) {
    var updateResourcesList;
    session.getUserPromise().then(function(user) {
      return $scope.user = user.plain();
    });
    $scope.resources = [];
    $scope.loading = true;
    updateResourcesList = function() {
      $scope.loading = true;
      if ($scope.resourceBackend != null) {
        return $scope.resourceBackend.getList($scope.lookup).then(function(items) {
          $scope.resources = items;
          if (typeof $scope.customUpdateResourcesList === "function") {
            $scope.customUpdateResourcesList($scope);
          }
          return $scope.loading = false;
        });
      }
    };
    $scope.$watch('lookup', function() {
      if (($scope.lookup == null) || ($scope.lookup.page == null)) {
        return;
      }
      return updateResourcesList();
    }, true);
    $scope.$watch('resourceBackend', function(resourceBackend, oldValue) {
      if (resourceBackend !== oldValue) {
        return updateResourcesList();
      }
    });
    return $scope.pageChange = function(newPage) {
      if ($scope.lookup.page === newPage) {
        return;
      }
      return $scope.lookup.page = newPage;
    };
  });

}).call(this);
