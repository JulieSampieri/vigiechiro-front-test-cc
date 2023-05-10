// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  var locBySection, locality_colors, section_colors,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  locality_colors = ['#FF8000', '#80FF00', '#00FF80', '#0080FF', '#FF0080'];

  locBySection = 5;

  section_colors = ['#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080'];

  angular.module('protocole_map_routier', []).factory('ProtocoleMapRoutier', function($rootScope, $timeout, $modal, Backend, GoogleMaps, ProtocoleMap) {
    var ProtocoleMapRoutier;
    return ProtocoleMapRoutier = (function(superClass) {
      extend(ProtocoleMapRoutier, superClass);

      function ProtocoleMapRoutier(mapDiv, typeProtocole, callbacks) {
        this.typeProtocole = typeProtocole;
        this.callbacks = callbacks != null ? callbacks : {};
        this.addSectionPoint = bind(this.addSectionPoint, this);
        this.onValidOriginPoint = bind(this.onValidOriginPoint, this);
        ProtocoleMapRoutier.__super__.constructor.call(this, mapDiv, this.typeProtocole, this.callbacks);
        this._steps = [
          {
            id: 'start',
            message: "Tracer le trajet complet en un seul trait. Le tracé doit atteindre 30 km ou plus."
          }, {
            id: 'selectOrigin',
            message: "Sélectionner le point d'origine."
          }, {
            id: 'editSections',
            message: "Placer les limites des tronçons de 2 km (+/-20%) sur le tracé en partant du point d'origine."
          }, {
            id: 'validSections',
            message: "Valider les tronçons."
          }, {
            id: 'end',
            message: "Cartographie achevée."
          }
        ];
        this._googleMaps.setDrawingManagerOptions({
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYLINE]
          }
        });
      }

      ProtocoleMapRoutier.prototype.loadMapDisplay = function(site) {
        this._googleMaps.hideDrawingManager();
        this.loadRoute(site.tracet);
        this.loadBounds(site.tracet);
        return this.loadLocalities(site.localites);
      };

      ProtocoleMapRoutier.prototype.loadMapEdit = function(site) {
        this._site = site;
        return this.loadMapEditContinue();
      };

      ProtocoleMapRoutier.prototype.loadMapEditContinue = function() {
        var boundsValid, routeValid;
        if ((this._site == null) || !this._projectionReady) {
          return;
        }
        this.loadRoute(this._site.tracet);
        routeValid = this.validRoute();
        this.loadBounds(this._site.tracet);
        if (routeValid) {
          boundsValid = this.validBounds();
        }
        this.loadLocalities(this._site.localites);
        return this.validLocalities();
      };

      ProtocoleMapRoutier.prototype.loadRoute = function(route) {
        var base, bounds, j, len, point, ref;
        bounds = this._googleMaps.createBounds();
        ref = route.chemin.coordinates;
        for (j = 0, len = ref.length; j < len; j++) {
          point = ref[j];
          this._googleMaps.extendBounds(bounds, point);
        }
        this._route = this._googleMaps.createLineString(route.chemin.coordinates);
        this._routeLength = (this.checkTotalLength() / 1000).toFixed(1);
        if (typeof (base = this.callbacks).updateLength === "function") {
          base.updateLength(this._routeLength);
        }
        this._route.setOptions({
          zIndex: 1
        });
        this._googleMaps.setCenter(route.chemin.coordinates[0][1], route.chemin.coordinates[0][0]);
        return this._googleMaps.fitBounds(bounds);
      };

      ProtocoleMapRoutier.prototype.hasRoute = function() {
        if (this._route != null) {
          return true;
        } else {
          return false;
        }
      };

      ProtocoleMapRoutier.prototype.validRoute = function() {
        var base, current_point, distance, i, interval, j, k, key, nbSections, new_pt, next_point, path, ref, ref1;
        if (this._route == null) {
          if (typeof (base = this.callbacks).displayError === "function") {
            base.displayError("Pas de tracé");
          }
          return false;
        }
        if (this._routeLength < 24) {
          this.callbacks.displayError("Tracé trop court");
          return false;
        }
        this._googleMaps.clearListeners(this._route, 'rightclick');
        this._route.setOptions({
          editable: false
        });
        path = this._route.getPath();
        interval = 10;
        for (key = j = 0, ref = path.getLength() - 2; 0 <= ref ? j <= ref : j >= ref; key = 0 <= ref ? ++j : --j) {
          current_point = path.getAt(key);
          next_point = path.getAt(key + 1);
          distance = this._googleMaps.computeDistanceBetween(current_point, next_point);
          nbSections = Math.floor(distance / interval) + 1;
          for (i = k = 0, ref1 = nbSections - 1; 0 <= ref1 ? k <= ref1 : k >= ref1; i = 0 <= ref1 ? ++k : --k) {
            new_pt = this._googleMaps.interpolate(current_point, next_point, i / nbSections);
            if (!(key === 0 && i === 0)) {
              if (this._googleMaps.isLocationOnEdge(new_pt, [current_point, next_point])) {
                this._padded_points.push(new_pt);
              } else {
                this.callbacks.displayError("Certains points ne sont pas sur le tracé");
              }
            }
          }
        }
        this._step = 'selectOrigin';
        this._googleMaps.setDrawingManagerOptions({
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: []
          },
          drawingMode: ''
        });
        this.updateSite();
        return true;
      };

      ProtocoleMapRoutier.prototype.loadBounds = function(route) {
        if (route.origine == null) {
          return;
        }
        this._firstPoint = this._googleMaps.createPoint(route.origine.coordinates[1], route.origine.coordinates[0], false);
        this._lastPoint = this._googleMaps.createPoint(route.arrivee.coordinates[1], route.arrivee.coordinates[0], false);
        this._firstPoint.setTitle("Départ");
        return this._lastPoint.setTitle("Arrivée");
      };

      ProtocoleMapRoutier.prototype.validBounds = function() {
        var routePath;
        if (!this._route) {
          return false;
        }
        if (this._firstPoint == null) {
          routePath = this._route.getPath();
          this._firstPoint = this._googleMaps.createPoint(routePath.getAt(0).lat(), routePath.getAt(0).lng(), false);
          this._lastPoint = this._googleMaps.createPoint(routePath.getAt(routePath.length - 1).lat(), routePath.getAt(routePath.length - 1).lng(), false);
          this._googleMaps.addListener(this._firstPoint, 'click', this.onValidOriginPoint);
          this._googleMaps.addListener(this._lastPoint, 'click', this.onValidOriginPoint);
          return false;
        } else {
          return this.validOriginPoint();
        }
      };

      ProtocoleMapRoutier.prototype.loadLocalities = function(localities) {
        var j, len, locality, newLocality, num_secteur, ref, results;
        ref = localities || [];
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          locality = ref[j];
          newLocality = {
            representatif: locality.representatif
          };
          newLocality.overlay = this.loadGeoJson(locality.geometries);
          newLocality.overlay.title = locality.nom;
          if (locality.nom.charAt(0) === 'T') {
            num_secteur = parseInt(locality.nom[locality.nom.length - 1]) - 1;
            newLocality.overlay.setOptions({
              strokeColor: locality_colors[num_secteur],
              zIndex: 2
            });
          }
          results.push(this._localities.push(newLocality));
        }
        return results;
      };

      ProtocoleMapRoutier.prototype.validLocalities = function() {
        if (this._localities.length) {
          this._googleMaps.clearListeners(this._route, 'click');
          this._step = 'end';
          return this.updateSite();
        } else {
          this._step = 'editSections';
          return this._changeStep("Point à placer : fin tronçon 1");
        }
      };

      ProtocoleMapRoutier.prototype.mapCallback = function() {
        return {
          onProjectionReady: (function(_this) {
            return function() {
              _this._projectionReady = true;
              return _this.loadMapEditContinue();
            };
          })(this),
          overlayCreated: (function(_this) {
            return function(overlay) {
              var base, base1, base2, base3, isModified;
              isModified = false;
              if (_this._step === 'start') {
                if (overlay.type === "LineString") {
                  isModified = true;
                  _this._route = overlay;
                  _this._route.setOptions({
                    draggable: false
                  });
                  _this._routeLength = (_this.checkTotalLength() / 1000).toFixed(1);
                  _this._googleMaps.addListener(_this._route, 'mouseout', function(e) {
                    _this._routeLength = (_this.checkTotalLength() / 1000).toFixed(1);
                    return _this.callbacks.updateLength(_this._routeLength);
                  });
                  _this._googleMaps.setDrawingManagerOptions({
                    drawingControlOptions: {
                      position: google.maps.ControlPosition.TOP_CENTER,
                      drawingModes: [google.maps.drawing.OverlayType.MARKER]
                    },
                    drawingMode: ''
                  });
                  _this.addRouteRightClick();
                  if (typeof (base = _this.callbacks).updateLength === "function") {
                    base.updateLength(_this._routeLength);
                  }
                } else if (overlay.type === "Point") {
                  isModified = true;
                  _this.extendRoute(overlay);
                } else {
                  if (typeof (base1 = _this.callbacks).displayError === "function") {
                    base1.displayError("Géométrie non autorisée à cette étape : " + overlay.type);
                  }
                }
              } else if (_this._step === 'editSections') {
                if (overlay.type !== "LineString") {
                  if (typeof (base2 = _this.callbacks).displayError === "function") {
                    base2.displayError("Géométrie non autorisée à cette étape : " + overlay.type);
                  }
                } else {
                  overlay.setOptions({
                    draggable: false,
                    editable: false
                  });
                  isModified = true;
                }
              }
              if (isModified) {
                _this.updateSite();
                return true;
              }
              if (typeof (base3 = _this.callbacks).displayError === "function") {
                base3.displayError("Impossible de créer la forme");
              }
              return false;
            };
          })(this)
        };
      };

      ProtocoleMapRoutier.prototype.getGeoJsonRoute = function() {
        var end, origin, route;
        route = {
          chemin: {
            type: 'LineString',
            coordinates: this._googleMaps.getPath(this._route)
          }
        };
        if ((this._firstPoint != null) && this._firstPoint.getTitle() === "Départ") {
          origin = this._firstPoint.getPosition();
          route.origine = {
            type: 'Point',
            coordinates: [origin.lng(), origin.lat()]
          };
          end = this._lastPoint.getPosition();
          route.arrivee = {
            type: 'Point',
            coordinates: [end.lng(), end.lat()]
          };
        } else {
          delete route.origine;
          delete route.arrivee;
        }
        return route;
      };

      ProtocoleMapRoutier.prototype.addRouteRightClick = function() {
        return this._googleMaps.addListener(this._route, 'rightclick', (function(_this) {
          return function(e) {
            var modalInstance, path;
            if (e.vertex != null) {
              path = _this._route.getPath();
              path.removeAt(e.vertex);
              if (path.getLength() < 2) {
                _this.deleteRoute();
              } else {
                _this._route.setPath(path);
              }
            } else {
              modalInstance = $modal.open({
                templateUrl: 'scripts/views/site/modal/delete_route.html',
                controller: 'ModalDeleteRouteController'
              });
              modalInstance.result.then(function() {
                return _this.deleteRoute();
              });
            }
            return _this.updateSite();
          };
        })(this));
      };

      ProtocoleMapRoutier.prototype.deleteRoute = function() {
        this._route.setMap(null);
        this._route = null;
        this._routeLength = 0;
        this._googleMaps.setDrawingManagerOptions({
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYLINE]
          }
        });
        return this.updateSite();
      };

      ProtocoleMapRoutier.prototype.getRouteLength = function() {
        return this._routeLength;
      };

      ProtocoleMapRoutier.prototype.extendRoute = function(overlay) {
        var base, path;
        path = this._route.getPath();
        if (this.extendRouteTo === 'BEGIN') {
          path.insertAt(0, overlay.position);
        } else {
          path.push(overlay.position);
        }
        this._route.setPath(path);
        overlay.setMap(null);
        this._routeLength = (this.checkTotalLength() / 1000).toFixed(1);
        return typeof (base = this.callbacks).updateLength === "function" ? base.updateLength(this._routeLength) : void 0;
      };

      ProtocoleMapRoutier.prototype.editRoute = function() {
        var j, k, l, len, len1, len2, locality, point, ref, ref1, ref2, section;
        this._padded_points = [];
        this._firstPoint.setMap(null);
        this._firstPoint = null;
        this._lastPoint.setMap(null);
        this._lastPoint = null;
        ref = this._points;
        for (j = 0, len = ref.length; j < len; j++) {
          point = ref[j];
          point.setMap(null);
        }
        this._points = [];
        ref1 = this._sections;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          section = ref1[k];
          section.setMap(null);
        }
        this._sections = [];
        ref2 = this._localities;
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          locality = ref2[l];
          locality.overlay.setMap(null);
        }
        this._localities = [];
        this._googleMaps.clearListeners(this._route, 'click');
        this._googleMaps.addListener(this._route, 'mouseout', (function(_this) {
          return function(e) {
            var base;
            _this._routeLength = (_this.checkTotalLength() / 1000).toFixed(1);
            return typeof (base = _this.callbacks).updateLength === "function" ? base.updateLength(_this._routeLength) : void 0;
          };
        })(this));
        this._googleMaps.setDrawingManagerOptions({
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.MARKER]
          }
        });
        this.addRouteRightClick();
        this._route.setOptions({
          draggable: false,
          editable: true
        });
        this._step = 'start';
        return this.updateSite();
      };

      ProtocoleMapRoutier.prototype.onValidOriginPoint = function(e) {
        var i, j, new_path, path, ref, tmp;
        tmp = null;
        if (e.latLng.lat() !== this._firstPoint.getPosition().lat() || e.latLng.lng() !== this._firstPoint.getPosition().lng()) {
          tmp = this._firstPoint;
          this._firstPoint = this._lastPoint;
          this._lastPoint = tmp;
          path = this._route.getPath();
          new_path = [];
          for (i = j = 0, ref = path.getLength() - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            new_path.push(path.pop());
          }
          this._route.setPath(new_path);
        }
        return this.validOriginPoint();
      };

      ProtocoleMapRoutier.prototype.validOriginPoint = function() {
        var j, len, point, ref;
        ref = this._points || [];
        for (j = 0, len = ref.length; j < len; j++) {
          point = ref[j];
          point.setMap(null);
        }
        this._points = [];
        this._points.push(this._firstPoint);
        this._points.push(this._lastPoint);
        this._points[0].setMap(this._googleMaps.getMap());
        this._points[1].setMap(this._googleMaps.getMap());
        this._points[0].setTitle("Départ");
        this._points[1].setTitle("Arrivée");
        this._points[0].edge = 0;
        this._points[1].edge = this._route.getPath().getLength() - 2;
        this._googleMaps.addListener(this._route, 'click', this.addSectionPoint);
        this._googleMaps.clearListeners(this._firstPoint, 'click');
        this._googleMaps.clearListeners(this._lastPoint, 'click');
        this._firstPoint.infowindow = this._googleMaps.createInfoWindow("Départ");
        this._firstPoint.infowindow.open(this._googleMaps.getMap(), this._firstPoint);
        this._googleMaps.addListener(this._firstPoint, 'click', (function(_this) {
          return function() {
            return _this._firstPoint.infowindow.open(_this._googleMaps.getMap(), _this._firstPoint);
          };
        })(this));
        this._lastPoint.infowindow = this._googleMaps.createInfoWindow("Arrivée");
        this._lastPoint.infowindow.open(this._googleMaps.getMap(), this._lastPoint);
        this._googleMaps.addListener(this._lastPoint, 'click', (function(_this) {
          return function() {
            return _this._lastPoint.infowindow.open(_this._googleMaps.getMap(), _this._lastPoint);
          };
        })(this));
        this._step = 'editSections';
        return this._changeStep("Point à placer : fin tronçon 1");
      };

      ProtocoleMapRoutier.prototype._changeStep = function(message) {
        var messageOrig;
        messageOrig = "Placer les limites des tronçons de 2 km (+/-20%) sur le tracé en partant du point d'origine.";
        this._steps[2].message = messageOrig + " " + message;
        return this.updateSite();
      };

      ProtocoleMapRoutier.prototype.createSectionPoint = function(lat, lng) {
        var currVertex, j, key, nbPoints, path, point, ref, vertex;
        point = this._googleMaps.createPoint(lat, lng);
        path = this._route.getPath();
        nbPoints = path.getLength();
        vertex = [];
        for (key = j = 0, ref = nbPoints - 2; 0 <= ref ? j <= ref : j >= ref; key = 0 <= ref ? ++j : --j) {
          currVertex = [path.getAt(key), path.getAt(key + 1)];
          vertex.push(currVertex);
          if (this._googleMaps.isLocationOnEdge(point.getPosition(), currVertex)) {
            point.edge = key;
          }
        }
        return point;
      };

      ProtocoleMapRoutier.prototype.addSectionPoint = function(e) {
        var closestPoint, i, j, numSection, point, position, ref;
        closestPoint = this._googleMaps.findClosestPointOnPath(e.latLng, this._padded_points, this._points);
        point = this.createSectionPoint(closestPoint.lat(), closestPoint.lng());
        this._points.splice(this._points.length - 1, 0, point);
        this._setPointListeners(point);
        for (i = j = 1, ref = this._points.length - 3; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
          if (!(this._points.length > 3)) {
            continue;
          }
          this._googleMaps.clearListeners(this._points[i], 'rightclick');
          this._points[i].infowindow.close();
        }
        numSection = Math.floor(this._points.length / 2);
        numSection = {
          current: numSection,
          next: numSection
        };
        position = {};
        if (this._points.length % 2) {
          position = {
            current: "Fin tronçon ",
            next: "début tronçon "
          };
          numSection.next++;
        } else {
          position = {
            current: "Début tronçon ",
            next: "fin tronçon "
          };
        }
        point.infowindow = this._googleMaps.createInfoWindow(position.current + numSection.current);
        point.infowindow.open(this._googleMaps.getMap(), point);
        this._googleMaps.addListener(point, 'click', (function(_this) {
          return function() {
            return point.infowindow.open(_this._googleMaps.getMap(), point);
          };
        })(this));
        this._changeStep("Point à placer : " + position.next + numSection.next);
        return this.generateSections();
      };

      ProtocoleMapRoutier.prototype._setMovePointListener = function(point) {
        point.setOptions({
          draggable: true
        });
        this._googleMaps.addListener(point, 'dragend', (function(_this) {
          return function(e) {
            point.setPosition(_this._googleMaps.findClosestPointOnPath(e.latLng, _this._padded_points, _this._points));
            _this.updatePointPosition(point);
            return _this.generateSections();
          };
        })(this));
        return this._googleMaps.addListener(point, 'drag', (function(_this) {
          return function(e) {
            return point.setPosition(_this._googleMaps.findClosestPointOnPath(e.latLng, _this._padded_points, _this._points));
          };
        })(this));
      };

      ProtocoleMapRoutier.prototype._setDeletePointListener = function(point) {
        return this._googleMaps.addListener(point, 'rightclick', (function(_this) {
          return function(e) {
            return _this._deleteLastPoint();
          };
        })(this));
      };

      ProtocoleMapRoutier.prototype._setPointListeners = function(point) {
        this._googleMaps.addListener(point, 'rightclick', (function(_this) {
          return function(e) {
            return _this._deleteLastPoint();
          };
        })(this));
        point.setOptions({
          draggable: true
        });
        this._googleMaps.addListener(point, 'dragend', (function(_this) {
          return function(e) {
            point.setPosition(_this._googleMaps.findClosestPointOnPath(e.latLng, _this._padded_points, _this._points));
            _this.updatePointPosition(point);
            return _this.generateSections();
          };
        })(this));
        return this._googleMaps.addListener(point, 'drag', (function(_this) {
          return function(e) {
            return point.setPosition(_this._googleMaps.findClosestPointOnPath(e.latLng, _this._padded_points, _this._points));
          };
        })(this));
      };

      ProtocoleMapRoutier.prototype._deleteLastPoint = function() {
        var content, index;
        index = this._points.length - 2;
        content = this._points[index].infowindow.getContent();
        this._points[index].setMap(null);
        this._points.splice(index, 1);
        if (index > 1) {
          this._setPointListeners(this._points[index - 1]);
          this._points[index - 1].infowindow.open(this._googleMaps.getMap(), this._points[index - 1]);
        }
        this._changeStep("Point à placer : " + content);
        return this.generateSections();
      };

      ProtocoleMapRoutier.prototype.generateSections = function() {
        var j, key, len, nbPoints, ref, results, section;
        ref = this._sections;
        for (j = 0, len = ref.length; j < len; j++) {
          section = ref[j];
          section.setMap(null);
        }
        this._sections = [];
        nbPoints = this._points.length;
        key = 0;
        results = [];
        while (key < nbPoints - 1) {
          section = this.generateSection(key);
          section.setOptions({
            strokeColor: section_colors[(key / 2) % 11],
            zIndex: 10
          });
          this._googleMaps.addListener(section, 'click', this.addSectionPoint);
          this._sections.push(section);
          results.push(key += 2);
        }
        return results;
      };

      ProtocoleMapRoutier.prototype.generateSection = function(key) {
        var corner, j, path, pt, ref, ref1, routePath, start, stop;
        routePath = this._route.getPath();
        path = [];
        start = this._points[key];
        stop = this._points[key + 1];
        path.push([start.getPosition().lat(), start.getPosition().lng()]);
        if (start.edge < stop.edge) {
          for (corner = j = ref = start.edge + 1, ref1 = stop.edge; ref <= ref1 ? j <= ref1 : j >= ref1; corner = ref <= ref1 ? ++j : --j) {
            pt = routePath.getAt(corner);
            path.push([pt.lat(), pt.lng()]);
          }
        }
        path.push([stop.getPosition().lat(), stop.getPosition().lng()]);
        return this._googleMaps.createLineString(path);
      };

      ProtocoleMapRoutier.prototype.updatePointPosition = function(point) {
        var j, key, path, ref, results, vertex;
        path = this._route.getPath();
        results = [];
        for (key = j = 0, ref = path.getLength() - 2; 0 <= ref ? j <= ref : j >= ref; key = 0 <= ref ? ++j : --j) {
          vertex = [path.getAt(key), path.getAt(key + 1)];
          if (this._googleMaps.isLocationOnEdge(point.getPosition(), vertex)) {
            results.push(point.edge = key);
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      ProtocoleMapRoutier.prototype.validSections = function() {
        var base, currLength, cut_point, d, delta, end, index, j, k, key, l, len, len1, len2, locality, localityPath, m, point, ratio, ref, ref1, ref2, section, sectionPath;
        if (!this._sections.length) {
          if (typeof (base = this.callbacks).displayError === "function") {
            base.displayError("Aucun tronçon");
          }
          return false;
        }
        this._googleMaps.clearListeners(this._route, 'click');
        ref = this._sections || [];
        for (j = 0, len = ref.length; j < len; j++) {
          section = ref[j];
          this._googleMaps.clearListeners(section, 'click');
        }
        ref1 = this._points;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          point = ref1[k];
          point.setMap(null);
        }
        this._points = [];
        this._firstPoint.setMap(this._googleMaps.getMap());
        this._lastPoint.setMap(this._googleMaps.getMap());
        ref2 = this._sections;
        for (key = l = 0, len2 = ref2.length; l < len2; key = ++l) {
          section = ref2[key];
          section.setMap(null);
          delta = this._googleMaps.computeLength(section) / locBySection;
          sectionPath = section.getPath();
          for (index = m = 1; m <= 4; index = ++m) {
            locality = {};
            localityPath = [sectionPath.getAt(0)];
            currLength = 0;
            end = false;
            while (sectionPath.getLength() > 1 && !end) {
              d = this._googleMaps.computeDistanceBetween(sectionPath.getAt(0), sectionPath.getAt(1));
              if (d + currLength < delta) {
                currLength += d;
                localityPath.push(sectionPath.getAt(1));
                sectionPath.removeAt(0);
              } else {
                end = true;
                ratio = (delta - currLength) / d;
                cut_point = this._googleMaps.interpolate(sectionPath.getAt(0), sectionPath.getAt(1), ratio);
                localityPath.push(cut_point);
                sectionPath.setAt(0, cut_point);
              }
            }
            locality.overlay = this._googleMaps.createLineStringWithPath(localityPath);
            locality.overlay.setOptions({
              'strokeColor': locality_colors[index - 1],
              'zIndex': 11
            });
            locality.overlay.type = 'LineString';
            locality.overlay.title = 'T ' + (key + 1) + ' ' + index;
            locality.representatif = false;
            this._localities.push(locality);
          }
          locality = {};
          locality.overlay = this._googleMaps.createLineStringWithPath(sectionPath);
          locality.overlay.setOptions({
            'strokeColor': locality_colors[index - 1],
            'zIndex': 11
          });
          locality.overlay.type = 'LineString';
          locality.overlay.title = 'T ' + (key + 1) + ' 5';
          locality.representatif = false;
          this._localities.push(locality);
        }
        this._sections = [];
        this.validLocalities();
        return true;
      };

      ProtocoleMapRoutier.prototype.editSections = function() {
        var firstLat, firstLng, firstSectionPoint, i, index, j, k, l, lastLat, lastLng, lastSectionPoint, len, len1, locality, nb_sections, newPoint, path, path_length, point, ref, ref1, ref2;
        this.validOriginPoint();
        nb_sections = this._localities.length / locBySection;
        for (i = j = 0, ref = nb_sections - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          if (!(nb_sections > 0)) {
            continue;
          }
          firstSectionPoint = this._localities[i * locBySection].overlay.getPath().getAt(0);
          path = this._localities[i * locBySection + 4].overlay.getPath();
          path_length = path.getLength();
          lastSectionPoint = path.getAt(path_length - 1);
          firstLat = firstSectionPoint.lat();
          firstLng = firstSectionPoint.lng();
          if (firstLat !== this._points[0].getPosition().lat() || firstLng !== this._points[0].getPosition().lng()) {
            newPoint = this.createSectionPoint(firstLat, firstLng);
            this._points.splice(this._points.length - 1, 0, newPoint);
            this._setCurrentInfoWindow(newPoint);
          }
          lastLat = lastSectionPoint.lat();
          lastLng = lastSectionPoint.lng();
          if (lastLat !== this._points[this._points.length - 1].getPosition().lat() || lastLng !== this._points[this._points.length - 1].getPosition().lng()) {
            newPoint = this.createSectionPoint(lastLat, lastLng);
            this._points.splice(this._points.length - 1, 0, newPoint);
            this._setCurrentInfoWindow(newPoint);
          }
        }
        ref1 = this._points || [];
        for (i = k = 0, len = ref1.length; k < len; i = ++k) {
          point = ref1[i];
          if (i !== 0 && i !== this._points.length - 1) {
            this._setMovePointListener(point);
          }
        }
        index = this._points.length - 2;
        if (index > 0) {
          this._setDeletePointListener(this._points[index]);
          this._points[index].infowindow.open(this._googleMaps.getMap(), this._points[index]);
        }
        ref2 = this._localities;
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          locality = ref2[l];
          locality.overlay.setMap(null);
        }
        this._localities = [];
        this.generateSections();
        this._step = 'editSections';
        return this.updateSite();
      };

      ProtocoleMapRoutier.prototype._setCurrentInfoWindow = function(point) {
        var numSection, position;
        numSection = Math.floor(this._points.length / 2);
        numSection = {
          current: numSection,
          next: numSection
        };
        position = {};
        if (this._points.length % 2) {
          position = {
            current: "Fin tronçon ",
            next: "début tronçon "
          };
          numSection.next++;
        } else {
          position = {
            current: "Début tronçon ",
            next: "fin tronçon "
          };
        }
        point.infowindow = this._googleMaps.createInfoWindow(position.current + numSection.current);
        return this._changeStep("Point à placer : " + position.next + numSection.next);
      };

      return ProtocoleMapRoutier;

    })(ProtocoleMap);
  });

}).call(this);
