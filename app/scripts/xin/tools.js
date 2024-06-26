// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  angular.module('xin_tools', []).service('DelayedEvent', function($timeout) {
    var DelayedEvent;
    return DelayedEvent = (function() {
      function DelayedEvent(timer) {
        this.timer = timer;
        this.eventCount = 0;
      }

      DelayedEvent.prototype.triggerEvent = function(action) {
        var eventCurrent;
        this.eventCount += 1;
        eventCurrent = this.eventCount;
        return $timeout((function(_this) {
          return function() {
            if (eventCurrent === _this.eventCount) {
              return action();
            }
          };
        })(this), this.timer);
      };

      return DelayedEvent;

    })();
  }).filter("xinDate", function($filter) {
    var dateFilter;
    dateFilter = $filter('date');
    return function(input, format, timezone) {
      return dateFilter(Date.parse(input), format, timezone);
    };
  }).service('evalCallDefered', function($q, $injector) {
    return function(elem) {
      var defer, result;
      if (typeof elem === 'function') {
        result = $injector.invoke(elem);
        if (result.then != null) {
          return result;
        } else {
          defer = $q.defer();
          defer.resolve(result);
        }
      } else {
        defer = $q.defer();
        defer.resolve(elem);
      }
      return defer.promise;
    };
  }).service('guid', function() {
    return function() {
      var id, s4;
      s4 = function() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      };
      id = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      return id;
    };
  });

  window.ngInject = function(v) {
    var func;
    if (v instanceof Array) {
      func = v.pop();
      func.$inject = v;
      return func;
    } else if (typeof v === 'function') {
      return v;
    } else {
      throw 'ngInject must receive a function';
    }
  };

}).call(this);
