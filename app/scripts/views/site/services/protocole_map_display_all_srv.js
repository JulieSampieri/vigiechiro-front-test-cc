// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  angular.module('protocole_map_display_all', []).factory('ProtocoleMapDisplay', function(GoogleMaps) {
    var ProtocoleMapDisplay;
    return ProtocoleMapDisplay = (function() {
      function ProtocoleMapDisplay(mapDiv) {
        this._googleMaps = new GoogleMaps(mapDiv);
        this._googleMaps.setDrawingManagerOptions({
          drawingControl: false
        });
      }

      ProtocoleMapDisplay.prototype.displayGrilleStoc = function(lat, lng, title) {
        var distance, northEast, origine, southWest;
        if (title == null) {
          title = '';
        }
        this._googleMaps.createPoint(lat, lng, false, title);
        distance = 1000 * Math.sqrt(2);
        origine = new google.maps.LatLng(lat, lng);
        southWest = google.maps.geometry.spherical.computeOffset(origine, distance, -135);
        northEast = google.maps.geometry.spherical.computeOffset(origine, distance, 45);
        return new google.maps.Polygon({
          paths: [new google.maps.LatLng(southWest.lat(), northEast.lng()), new google.maps.LatLng(northEast.lat(), northEast.lng()), new google.maps.LatLng(northEast.lat(), southWest.lng()), new google.maps.LatLng(southWest.lat(), southWest.lng())],
          map: this._googleMaps.getMap(),
          fillOpacity: 0.5,
          fillColor: '#00FF00',
          strokeColor: '#606060',
          strokeOpacity: 0.65,
          strokeWeight: 0.5
        });
      };

      ProtocoleMapDisplay.prototype.loadMap = function(sites) {
        var coordinates, end, i, len, path, ref, results, site, start;
        ref = sites || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          site = ref[i];
          if (site.grille_stoc) {
            coordinates = site.grille_stoc.centre.coordinates;
            this.displayGrilleStoc(coordinates[1], coordinates[0], site.grille_stoc.numero);
          }
          if (site.tracet) {
            path = site.tracet.chemin.coordinates;
            start = path[0];
            end = path[path.length - 1];
            this._googleMaps.createPoint(start[0], start[1]);
            this._googleMaps.createPoint(end[0], end[1]);
            results.push(this._googleMaps.createLineString(path));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      return ProtocoleMapDisplay;

    })();
  }).factory('ProtocoleMapDisplayCarre', function(GoogleMaps, ProtocoleMapDisplay) {
    var ProtocoleMapDisplayCarre;
    return ProtocoleMapDisplayCarre = (function(superClass) {
      extend(ProtocoleMapDisplayCarre, superClass);

      function ProtocoleMapDisplayCarre(mapDiv) {
        ProtocoleMapDisplayCarre.__super__.constructor.call(this, mapDiv);
      }

      return ProtocoleMapDisplayCarre;

    })(ProtocoleMapDisplay);
  }).factory('ProtocoleMapDisplayRoutier', function(GoogleMaps, ProtocoleMapDisplay) {
    var ProtocoleMapDisplayRoutier;
    return ProtocoleMapDisplayRoutier = (function(superClass) {
      extend(ProtocoleMapDisplayRoutier, superClass);

      function ProtocoleMapDisplayRoutier(mapDiv) {
        ProtocoleMapDisplayRoutier.__super__.constructor.call(this, mapDiv);
      }

      return ProtocoleMapDisplayRoutier;

    })(ProtocoleMapDisplay);
  }).factory('ProtocoleMapDisplayPointFixe', function(GoogleMaps, ProtocoleMapDisplay) {
    var ProtocoleMapDisplayPointFixe;
    return ProtocoleMapDisplayPointFixe = (function(superClass) {
      extend(ProtocoleMapDisplayPointFixe, superClass);

      function ProtocoleMapDisplayPointFixe(mapDiv) {
        ProtocoleMapDisplayPointFixe.__super__.constructor.call(this, mapDiv);
      }

      return ProtocoleMapDisplayPointFixe;

    })(ProtocoleMapDisplay);
  });

}).call(this);
