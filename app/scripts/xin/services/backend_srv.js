// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  angular.module('xin_backend', ['ngRoute', 'restangular', 'xin_session_tools']).factory('Backend', function($location, Restangular, sessionTools) {
    var backendConfig, customToken;
    customToken = void 0;
    backendConfig = Restangular.withConfig(function(RestangularConfigurer) {
      return RestangularConfigurer.setDefaultHeaders({
        Authorization: function() {
          if (customToken != null) {
            return sessionTools.buildAuthorizationHeader(customToken);
          } else {
            return sessionTools.getAuthorizationHeader();
          }
        },
        'Cache-Control': function() {
          return 'no-cache';
        }
      }).setRestangularFields({
        id: "_id",
        etag: "_etag"
      }).addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        var extractedData;
        if (operation === "getList") {
          extractedData = data._items;
          extractedData._meta = data._meta;
          extractedData._links = data._links;
          extractedData.self = data.self;
        } else {
          extractedData = data;
        }
        return extractedData;
      }).setErrorInterceptor(function(response, deferred, responseHandler) {
        if (response.status === 401) {
          sessionTools.logRequestError();
          return true;
        } else if (response.status === 404) {
          $location.path('/404');
        } else if (response.status === 403) {
          $location.path('/403');
        } else {
          return true;
        }
        return false;
      });
    });
    backendConfig.setCustomToken = function(token) {
      return customToken = token;
    };
    backendConfig.resetCustomToken = function(token) {
      if (token == null) {
        token = void 0;
      }
      return customToken = void 0;
    };
    return backendConfig;
  });

}).call(this);