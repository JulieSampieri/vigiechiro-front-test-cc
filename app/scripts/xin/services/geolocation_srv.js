// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  angular.module('xin_geolocation', []).factory('geolocation', function() {
    if (navigator.geolocation) {
      return navigator.geolocation;
    }
  });

}).call(this);
