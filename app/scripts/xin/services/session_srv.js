// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  angular.module('xin_session', ['xin_storage', 'xin_backend']).factory('session', function($q, $window, $location, storage, Backend) {
    var Session;
    storage.addEventListener(function(e) {
      if (e.key === 'auth-session-token') {
        return $window.location.reload();
      }
    });
    Session = (function() {
      function Session() {}

      Session._userPromise = void 0;

      Session.refreshPromise = function() {
        var deferred, token;
        token = storage.getItem('auth-session-token');
        if (token != null) {
          return Session._userPromise = Backend.one('moi').get({}, {
            'Cache-Control': 'no-cache'
          });
        } else {
          deferred = $q.defer();
          deferred.reject();
          return Session._userPromise = deferred.promise;
        }
      };

      Session.getUserPromise = function() {
        return Session._userPromise;
      };

      Session.getIsAdminPromise = function() {
        var deferred;
        deferred = $q.defer();
        Session._userPromise.then(function(user) {
          return deferred.resolve(user.role === 'Administrateur');
        }, function() {
          return deferred.resolve(false);
        });
        return deferred.promise;
      };

      Session.login = function(token) {
        var i, key, len, ref, url, value;
        storage.setItem('auth-session-token', token);
        url = '/#' + $location.path() + '?';
        ref = $location.search();
        for (value = i = 0, len = ref.length; i < len; value = ++i) {
          key = ref[value];
          if (key !== 'token') {
            url += value + "&";
          }
        }
        $window.location.href = url;
        return $window.location.reload();
      };

      Session.logout = function() {
        var postLogout;
        postLogout = function(e) {
          storage.removeItem('auth-session-token');
          return $window.location.reload();
        };
        return Backend.one('logout').post().then(postLogout, postLogout);
      };

      return Session;

    })();
    Session.refreshPromise();
    return Session;
  });

  angular.module('xin_session_tools', ['xin_storage']).factory('sessionTools', function($window, storage) {
    var sessionTools;
    return sessionTools = (function() {
      function sessionTools() {}

      sessionTools.buildAuthorizationHeader = function(token) {
        return "Basic " + btoa(token + ":");
      };

      sessionTools.getAuthorizationHeader = function() {
        var token;
        token = storage.getItem('auth-session-token');
        if (token != null) {
          return sessionTools.buildAuthorizationHeader(token);
        } else {
          return void 0;
        }
      };

      sessionTools.logRequestError = function() {
        var authSession;
        authSession = storage.getItem('auth-session-token');
        if (authSession != null) {
          storage.removeItem('auth-session-token');
          return $window.location.reload();
        }
      };

      return sessionTools;

    })();
  });

}).call(this);
