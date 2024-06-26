// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  angular.module('protocole_map', ['protocole_map_carre', 'protocole_map_point_fixe', 'protocole_map_routier', 'protocole_map_display_all']).factory('protocolesFactory', function(ProtocoleMapCarre, ProtocoleMapRoutier, ProtocoleMapPointFixe, ProtocoleMapDisplayCarre, ProtocoleMapDisplayRoutier, ProtocoleMapDisplayPointFixe) {
    return function(mapDiv, typeProtocole, callbacks) {
      if (callbacks == null) {
        callbacks = {};
      }
      if (typeProtocole === 'ROUTIER') {
        return new ProtocoleMapRoutier(mapDiv, typeProtocole, callbacks);
      } else if (typeProtocole === 'CARRE') {
        return new ProtocoleMapCarre(mapDiv, typeProtocole, callbacks);
      } else if (typeProtocole === 'POINT_FIXE') {
        return new ProtocoleMapPointFixe(mapDiv, typeProtocole, callbacks);
      } else if (typeProtocole === 'ALL_ROUTIER') {
        return new ProtocoleMapDisplayRoutier(mapDiv);
      } else if (typeProtocole === 'ALL_CARRE') {
        return new ProtocoleMapDisplayCarre(mapDiv);
      } else if (typeProtocole === 'ALL_POINT_FIXE') {
        return new ProtocoleMapDisplayPointFixe(mapDiv);
      } else {
        throw "Erreur : type de protocole inconnu " + typeProtocole;
      }
    };
  }).factory('ProtocoleMap', function($timeout, $rootScope, $modal, Backend, GoogleMaps) {
    var ProtocoleMap;
    return ProtocoleMap = (function() {
      function ProtocoleMap(mapDiv, typeProtocole1, callbacks1) {
        this.typeProtocole = typeProtocole1;
        this.callbacks = callbacks1;
        this.validNumeroGrille = bind(this.validNumeroGrille, this);
        this._site = null;
        this._localities = [];
        this._fixLocalities = [];
        this._step = 'start';
        this._steps = [];
        this._googleMaps = new GoogleMaps(mapDiv, this.mapCallback());
        this._projectionReady = false;
        this._sites = null;
        this._circleLimit = null;
        this._newSelection = false;
        this._grilleStoc = null;
        this._isOpportuniste = false;
        this._is_getting_grille_stoc = false;
        this._route = null;
        this._routeLength = 0;
        this.extendRouteTo = '';
        this._firstPoint = null;
        this._lastPoint = null;
        this._points = [];
        this._sections = [];
        this._padded_points = [];
      }

      ProtocoleMap.prototype.isValid = function() {
        var base, base1, ref, ref1;
        if ((ref = this.typeProtocole) === 'CARRE' || ref === 'POINT_FIXE') {
          if (this._step === 'end') {
            return true;
          } else {
            if (typeof (base = this.callbacks).displayError === "function") {
              base.displayError("Le site ne peut pas être sauvegardé. Des étapes n'ont pas été faites.");
            }
            return false;
          }
        } else {
          if ((ref1 = this._step) === 'selectOrigin' || ref1 === 'editSections' || ref1 === 'end') {
            return true;
          } else {
            if (typeof (base1 = this.callbacks).displayError === "function") {
              base1.displayError("Le site ne peut pas être sauvegardé. Des étapes obligatoires n'ont pas été faites.");
            }
            return false;
          }
        }
      };

      ProtocoleMap.prototype.clear = function() {
        var cell, i, j, k, l, len, len1, len2, len3, len4, locality, m, point, ref, ref1, ref2, ref3, ref4, ref5, section;
        ref = this._localities;
        for (i = 0, len = ref.length; i < len; i++) {
          locality = ref[i];
          locality.overlay.setMap(null);
        }
        this._localities = [];
        ref1 = this._fixLocalities;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          locality = ref1[j];
          locality.overlay.setMap(null);
        }
        this._fixLocalities = [];
        this._step = 'start';
        if ((ref2 = this.typeProtocole) === 'CARRE' || ref2 === 'POINT_FIXE') {
          this._googleMaps.setDrawingManagerOptions({
            drawingControl: false,
            drawingMode: ''
          });
        }
        if (this._circleLimit != null) {
          this._circleLimit.setMap(null);
          this._circleLimit = null;
        }
        this._newSelection = false;
        if (this._grilleStoc != null) {
          this._grilleStoc.overlay.setMap(null);
          this._grilleStoc = null;
        }
        ref3 = this._smallGrille || [];
        for (k = 0, len2 = ref3.length; k < len2; k++) {
          cell = ref3[k];
          cell.setMap(null);
        }
        this._smallGrille = null;
        if (this._route != null) {
          this._route.setMap(null);
          this._route = null;
        }
        this._routeLength = 0;
        if (this._firstPoint != null) {
          this._firstPoint.setMap(null);
          this._firstPoint = null;
        }
        if (this._lastPoint != null) {
          this._lastPoint.setMap(null);
          this._lastPoint = null;
        }
        if (this._points.length) {
          ref4 = this._points;
          for (l = 0, len3 = ref4.length; l < len3; l++) {
            point = ref4[l];
            point.setMap(null);
          }
          this._points = [];
        }
        if (this._sections.length) {
          ref5 = this._sections;
          for (m = 0, len4 = ref5.length; m < len4; m++) {
            section = ref5[m];
            section.setMap(null);
          }
          this._sections = [];
        }
        this._padded_points = [];
        return this.updateSite();
      };

      ProtocoleMap.prototype.isOpportuniste = function() {
        return this._isOpportuniste;
      };

      ProtocoleMap.prototype.loadMapDisplay = function(site) {
        this._googleMaps.hideDrawingManager();
        this._site = site;
        return this._loadMapDisplayContinue();
      };

      ProtocoleMap.prototype._loadMapDisplayContinue = function() {
        if (!this._site || !this._projectionReady) {
          return;
        }
        this.loadGrilleStoc(this._site.grille_stoc);
        return this.loadLocalities(this._site.localites);
      };

      ProtocoleMap.prototype.loadMapEdit = function(site) {
        this._site = site;
        return this.loadMapEditContinue();
      };

      ProtocoleMap.prototype.loadMapEditContinue = function() {
        if ((this._site == null) || !this._projectionReady) {
          return;
        }
        this.loadGrilleStoc(this._site.grille_stoc);
        this.loadLocalities(this._site.localites);
        return this.validLocalities();
      };

      ProtocoleMap.prototype.loadGrilleStoc = function(grille_stoc) {
        var cell, lat, lng, path, ref;
        cell = this.createCell(grille_stoc.centre.coordinates[1], grille_stoc.centre.coordinates[0]);
        cell.setOptions({
          strokeColor: '#00E000',
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: '#000000',
          fillOpacity: 0
        });
        path = cell.getPath();
        this._grilleStoc = {
          overlay: cell,
          numero: grille_stoc.numero,
          id: grille_stoc.id
        };
        lat = (path.getAt(0).lat() + path.getAt(2).lat()) / 2;
        lng = (path.getAt(0).lng() + path.getAt(2).lng()) / 2;
        this._googleMaps.setCenter(lat, lng);
        this._googleMaps.setZoom(13);
        if ((ref = this.typeProtocole) === 'POINT_FIXE') {
          return this.displaySmallGrille();
        }
      };

      ProtocoleMap.prototype.loadLocalities = function(localities) {
        var i, len, locality, newLocality, ref, results;
        ref = localities || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          locality = ref[i];
          newLocality = {
            representatif: locality.representatif
          };
          newLocality.overlay = this.loadGeoJson(locality.geometries);
          newLocality.overlay.title = locality.nom;
          newLocality.overlay.infowindow = this._googleMaps.createInfoWindow(locality.nom);
          newLocality.overlay.infowindow.open(this._googleMaps.getMap(), newLocality.overlay);
          results.push(this._localities.push(newLocality));
        }
        return results;
      };

      ProtocoleMap.prototype.displaySites = function(sites) {
        var coordinates, i, len, ref, results, site;
        this._sites = sites;
        ref = this._sites || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          site = ref[i];
          coordinates = site.grille_stoc.centre.coordinates;
          results.push(site.overlay = this.displayGrilleStocs(coordinates[1], coordinates[0]));
        }
        return results;
      };

      ProtocoleMap.prototype.displayGrilleStocs = function(lat, lng) {
        var distance, northEast, origine, overlay, southWest;
        distance = 1000 * Math.sqrt(2);
        origine = new google.maps.LatLng(lat, lng);
        southWest = google.maps.geometry.spherical.computeOffset(origine, distance, -135);
        northEast = google.maps.geometry.spherical.computeOffset(origine, distance, 45);
        overlay = new google.maps.Polygon({
          paths: [new google.maps.LatLng(southWest.lat(), northEast.lng()), new google.maps.LatLng(northEast.lat(), northEast.lng()), new google.maps.LatLng(northEast.lat(), southWest.lng()), new google.maps.LatLng(southWest.lat(), southWest.lng())],
          map: this._googleMaps.getMap(),
          fillOpacity: 0.5,
          fillColor: '#FF0000',
          strokeColor: '#FF0000',
          strokeOpacity: 0.65,
          strokeWeight: 0.5
        });
        return overlay;
      };

      ProtocoleMap.prototype.getGrilleStoc = function(overlay) {
        var payload;
        if (this._is_getting_grille_stoc) {
          return;
        }
        this._is_getting_grille_stoc = true;
        payload = {
          lng: overlay.getPosition().lng(),
          lat: overlay.getPosition().lat(),
          r: 1500
        };
        return Backend.one('grille_stoc/cercle').get(payload).then((function(_this) {
          return function(grille_stoc) {
            var base, cell, cells, i, index, len, modalInstance, ref, site;
            _this._is_getting_grille_stoc = false;
            cells = grille_stoc.plain()._items;
            if (!cells.length) {
              if (typeof (base = _this.callbacks).displayError === "function") {
                base.displayError("Pas de grille stoc trouvée pour " + overlay.getPosition().toString());
              }
              return;
            }
            cell = cells[0];
            ref = _this._sites;
            for (index = i = 0, len = ref.length; i < len; index = ++i) {
              site = ref[index];
              if (cell.numero === site.grille_stoc.numero) {
                modalInstance = $modal.open({
                  templateUrl: 'scripts/views/site/modal/site_opportuniste.html',
                  controller: 'ModalInstanceSiteOpportunisteController'
                });
                modalInstance.result.then(function(valid) {
                  if (valid) {
                    return _this.validAndDisplaySiteLocalities(index);
                  }
                });
                return;
              }
            }
            overlay = _this.createCell(cell.centre.coordinates[1], cell.centre.coordinates[0]);
            return _this.validNumeroGrille(overlay, cell.numero, cell._id, true);
          };
        })(this));
      };

      ProtocoleMap.prototype.validAndDisplaySiteLocalities = function(index) {
        var site;
        if (!this._sites || !this._sites[index]) {
          return;
        }
        site = this._sites[index];
        this.validNumeroGrille(site.overlay, site.grille_stoc.numero, site.grille_stoc._id, false);
        Backend.one('sites', site._id).get().then((function(_this) {
          return function(site) {
            return _this.displayLocalities(site.localites, _this._fixLocalities);
          };
        })(this));
        this._isOpportuniste = true;
        this._step = 'validLocalities';
        return this.updateSite();
      };

      ProtocoleMap.prototype.displayLocalities = function(localites, dest) {
        var i, len, locality, ref, results;
        ref = localites || [];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          locality = ref[i];
          results.push(this.displayLocality(locality, dest));
        }
        return results;
      };

      ProtocoleMap.prototype.displayLocality = function(locality, dest) {
        var newLocality;
        if (dest == null) {
          dest = this._localities;
        }
        newLocality = {
          representatif: locality.representatif
        };
        newLocality.overlay = this.loadGeoJson(locality.geometries);
        newLocality.overlay.title = locality.nom;
        return dest.push(newLocality);
      };

      ProtocoleMap.prototype.selectGrilleStoc = function() {
        this._step = 'selectGrilleStoc';
        this._googleMaps.setDrawingManagerOptions({
          drawingControl: true
        });
        return this.updateSite();
      };

      ProtocoleMap.prototype.validOrigin = function(grille_stoc) {
        var cell;
        cell = this.createCell(grille_stoc.centre.coordinates[1], grille_stoc.centre.coordinates[0]);
        this.validNumeroGrille(cell, grille_stoc.numero, grille_stoc._id);
        this.removeOrigin();
        return this.updateSite();
      };

      ProtocoleMap.prototype.createOriginPoint = function() {
        return this._circleLimit = new google.maps.Circle({
          map: this._googleMaps.getMap(),
          center: this._googleMaps.getCenter(),
          radius: 10000,
          draggable: true
        });
      };

      ProtocoleMap.prototype.removeOrigin = function() {
        this._newSelection = true;
        this._circleLimit.setMap(null);
        return this._circleLimit.setDraggable(false);
      };

      ProtocoleMap.prototype.deleteGrilleStoc = function() {
        this._grilleStoc.overlay.setMap(null);
        return this._grilleStoc = null;
      };

      ProtocoleMap.prototype.getOrigin = function() {
        return this._circleLimit;
      };

      ProtocoleMap.prototype.allowMapChanged = function() {
        if (this.site.verrouille == null) {
          return true;
        }
        return false;
      };

      ProtocoleMap.prototype.allowOverlayCreated = function() {
        if (this.site.verrouille == null) {
          return true;
        }
        return false;
      };

      ProtocoleMap.prototype.updateSite = function() {
        var steps;
        steps = {
          steps: this.getSteps(),
          step: this._step,
          loading: this.loading
        };
        if (this.callbacks.updateSteps != null) {
          return this.callbacks.updateSteps(steps, this._isOpportuniste);
        }
      };

      ProtocoleMap.prototype.exportLocality = function(locality) {
        var format_locality, shapetosave;
        format_locality = {};
        shapetosave = {};
        shapetosave.type = locality.overlay.type;
        if (shapetosave.type === "Point") {
          shapetosave.coordinates = this._googleMaps.getPosition(locality.overlay);
        } else if (shapetosave.type === "Polygon") {
          shapetosave.coordinates = [this._googleMaps.getPath(locality.overlay)];
        } else if (shapetosave.type === "LineString") {
          shapetosave.coordinates = this._googleMaps.getPath(locality.overlay);
        } else {
          return null;
        }
        format_locality = {
          name: locality.overlay.title,
          geometries: {
            type: 'GeometryCollection',
            geometries: [shapetosave]
          },
          representatif: false
        };
        return format_locality;
      };

      ProtocoleMap.prototype.saveMap = function() {
        var format_locality, i, j, len, len1, locality, ref, ref1, result;
        result = [];
        if ((this._fixLocalities != null) && this._fixLocalities.length) {
          ref = this._fixLocalities;
          for (i = 0, len = ref.length; i < len; i++) {
            locality = ref[i];
            format_locality = this.exportLocality(locality);
            if (format_locality != null) {
              result.push(this.exportLocality(locality));
            }
          }
        }
        ref1 = this._localities;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          locality = ref1[j];
          format_locality = this.exportLocality(locality);
          if (format_locality != null) {
            result.push(this.exportLocality(locality));
          }
        }
        return result;
      };

      ProtocoleMap.prototype.mapsCallback = function() {
        return {
          onProjectionReady: function() {
            return false;
          },
          overlayCreated: function() {
            return false;
          },
          saveOverlay: function() {
            return false;
          },
          zoomChanged: function() {
            return false;
          },
          mapsMoved: function() {
            return false;
          }
        };
      };

      ProtocoleMap.prototype.loadGeoJson = function(geoJson) {
        var geometry, i, len, overlay, ref;
        overlay = void 0;
        if (!geoJson) {
          return;
        }
        if (geoJson.type === 'GeometryCollection') {
          ref = geoJson.geometries;
          for (i = 0, len = ref.length; i < len; i++) {
            geometry = ref[i];
            return this.loadGeoJson(geometry);
          }
        }
        if (geoJson.type === 'Point') {
          overlay = this._googleMaps.createPoint(geoJson.coordinates[0], geoJson.coordinates[1]);
        } else if (geoJson.type === 'Polygon') {
          overlay = this._googleMaps.createPolygon(geoJson.coordinates[0]);
        } else if (geoJson.type === 'LineString') {
          overlay = this._googleMaps.createLineString(geoJson.coordinates);
        } else {
          throw "Error: Bad GeoJSON object " + geoJson;
        }
        overlay.type = geoJson.type;
        return overlay;
      };

      ProtocoleMap.prototype.getIdGrilleStoc = function() {
        return this._grilleStoc.id;
      };

      ProtocoleMap.prototype.getNumGrilleStoc = function() {
        return this._grilleStoc.numero;
      };

      ProtocoleMap.prototype.createCell = function(lat, lng) {
        var distance, item, northEast, origine, southWest;
        distance = 1000 * Math.sqrt(2);
        origine = new google.maps.LatLng(lat, lng);
        southWest = google.maps.geometry.spherical.computeOffset(origine, distance, -135);
        northEast = google.maps.geometry.spherical.computeOffset(origine, distance, 45);
        item = new google.maps.Polygon({
          paths: [new google.maps.LatLng(southWest.lat(), northEast.lng()), new google.maps.LatLng(northEast.lat(), northEast.lng()), new google.maps.LatLng(northEast.lat(), southWest.lng()), new google.maps.LatLng(southWest.lat(), southWest.lng())],
          map: this._googleMaps.getMap(),
          fillOpacity: 0,
          strokeColor: '#606060',
          strokeOpacity: 0.65,
          strokeWeight: 0.5
        });
        return item;
      };

      ProtocoleMap.prototype.validNumeroGrille = function(cell, numero, id, editable) {
        var lat, lng, path;
        if (editable == null) {
          editable = false;
        }
        this._googleMaps.clearListeners(this._googleMaps.getMap(), 'click');
        cell.setOptions({
          strokeColor: '#00E000',
          strokeOpacity: 1,
          strokeWeight: 2,
          fillColor: '#000000',
          fillOpacity: 0
        });
        path = cell.getPath();
        this._grilleStoc = {
          overlay: cell,
          numero: numero,
          id: id
        };
        lat = (path.getAt(0).lat() + path.getAt(2).lat()) / 2;
        lng = (path.getAt(0).lng() + path.getAt(2).lng()) / 2;
        this._googleMaps.setCenter(lat, lng);
        this._googleMaps.setZoom(13);
        this._step = 'editLocalities';
        this.updateSite();
        this._googleMaps.setDrawingManagerOptions({
          drawingControl: true
        });
        if (editable) {
          return this._googleMaps.addListener(this._grilleStoc.overlay, 'rightclick', (function(_this) {
            return function(e) {
              var i, len, locality, ref;
              if (confirm("Cette opération supprimera toutes les localités.")) {
                _this._step = 'start';
                _this._grilleStoc.overlay.setMap(null);
                _this._grilleStoc = null;
                ref = _this._localities || [];
                for (i = 0, len = ref.length; i < len; i++) {
                  locality = ref[i];
                  locality.overlay.setMap(null);
                }
                _this._localities = [];
                _this._googleMaps.setDrawingManagerOptions({
                  drawingControl: false
                });
                _this.selectGrilleStoc();
                return _this.updateSite();
              }
            };
          })(this));
        }
      };

      ProtocoleMap.prototype.checkLength = function(overlay) {
        var length;
        length = this._googleMaps.computeLength(overlay);
        if (length < 1800) {
          overlay.setOptions({
            strokeColor: '#800090'
          });
        } else if (length > 2200) {
          overlay.setOptions({
            strokeColor: '#FF0000'
          });
        } else {
          overlay.setOptions({
            strokeColor: '#000000'
          });
        }
        return length;
      };

      ProtocoleMap.prototype.checkTotalLength = function() {
        var length;
        if (this._route == null) {
          return 0;
        }
        length = this._googleMaps.computeLength(this._route);
        if (length < 30000) {
          this._route.setOptions({
            strokeColor: '#FF0000'
          });
        } else {
          this._route.setOptions({
            strokeColor: '#000000'
          });
        }
        return length;
      };

      ProtocoleMap.prototype.getSteps = function() {
        return this._steps;
      };

      ProtocoleMap.prototype.emptyMap = function() {
        var i, len, localite, ref;
        ref = this._localities;
        for (i = 0, len = ref.length; i < len; i++) {
          localite = ref[i];
          localite.overlay.setMap(null);
        }
        return this._localities = [];
      };

      ProtocoleMap.prototype.deleteOverlay = function(overlay) {
        var i, key, len, locality, ref;
        ref = this._localities;
        for (key = i = 0, len = ref.length; i < len; key = ++i) {
          locality = ref[key];
          if (locality.overlay === overlay) {
            locality.overlay.setMap(null);
            this._localities.splice(key, 1);
            return;
          }
        }
      };

      ProtocoleMap.prototype.getCountOverlays = function(type) {
        var i, len, localite, ref, result;
        if (type == null) {
          type = '';
        }
        if (type === '') {
          return this._localities.length;
        } else {
          result = 0;
          ref = this._localities || [];
          for (i = 0, len = ref.length; i < len; i++) {
            localite = ref[i];
            if (localite.overlay.type === type) {
              result++;
            }
          }
          return result;
        }
      };

      ProtocoleMap.prototype.validLocalities = function() {
        var i, len, locality, ref;
        this._googleMaps.clearListeners(this._grilleStoc.overlay, 'rightclick');
        this._googleMaps.setDrawingManagerOptions({
          drawingControl: false,
          drawingMode: ''
        });
        ref = this._localities;
        for (i = 0, len = ref.length; i < len; i++) {
          locality = ref[i];
          locality.overlay.setOptions({
            draggable: false
          });
          this._googleMaps.clearListeners(locality.overlay, 'rightclick');
          this._googleMaps.clearListeners(locality.overlay, 'dragend');
        }
        this._step = 'end';
        return this.updateSite();
      };

      ProtocoleMap.prototype.editLocalities = function() {
        var i, len, locality, ref;
        this._googleMaps.setDrawingManagerOptions({
          drawingControl: true
        });
        ref = this._localities;
        for (i = 0, len = ref.length; i < len; i++) {
          locality = ref[i];
          locality.overlay.setOptions({
            draggable: true
          });
          this.addEventRightClick(locality.overlay);
          this.addEventDragEnd(locality.overlay);
        }
        this._step = 'validLocalities';
        return this.updateSite();
      };

      ProtocoleMap.prototype.addEventRightClick = function(overlay) {
        return this._googleMaps.addListener(overlay, 'rightclick', (function(_this) {
          return function(e) {
            _this.deleteOverlay(overlay);
            if (_this.getCountOverlays() < _this._min) {
              _this._step = 'editLocalities';
            } else {
              _this._step = 'validLocalities';
            }
            return _this.updateSite();
          };
        })(this));
      };

      ProtocoleMap.prototype.addEventDragEnd = function(overlay) {
        return this._googleMaps.addListener(overlay, 'dragend', (function(_this) {
          return function(e) {
            return typeof _this.renameLocality === "function" ? _this.renameLocality(overlay, e.latLng) : void 0;
          };
        })(this));
      };

      return ProtocoleMap;

    })();
  });

}).call(this);
