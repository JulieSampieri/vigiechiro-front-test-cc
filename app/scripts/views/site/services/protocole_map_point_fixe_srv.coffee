'use strict'


angular.module('protocole_map_point_fixe', [])
  .factory 'ProtocoleMapPointFixe', ($rootScope, Backend, GoogleMaps, ProtocoleMap) ->
    class ProtocoleMapPointFixe extends ProtocoleMap
      constructor: (mapDiv, @typeProtocole, @callbacks) ->
        super mapDiv, @typeProtocole, @callbacks
        @_min = 1
        @_distanceOfInterest = 40
        @_smallGrille = []
        @_steps = [
            id: 'start'
            message: "Positionner la zone de sélection aléatoire."
          ,
            id: 'selectGrilleStoc'
            message: "Cliquer sur la carte pour sélection la grille stoc correspondante."
          ,
            id: 'editLocalities'
            message: "Définir au moins 1 point à l'intérieur du carré."
          ,
            id: 'validLocalities'
            message: "Valider les points."
          ,
            id: 'end'
            message: "Cartographie achevée."
        ]
        @_googleMaps.setDrawingManagerOptions(
          drawingControlOptions:
            position: google.maps.ControlPosition.TOP_CENTER
            drawingModes: [
              google.maps.drawing.OverlayType.MARKER
            ]
        )
        @_googleMaps.setDrawingManagerOptions(drawingControl: false)

      mapCallback: ->
        onProjectionReady: =>
          @_projectionReady = true
          @loadMapEditContinue()
        overlayCreated: (overlay) =>
          isModified = false
          if @_step == 'selectGrilleStoc'
            @getGrilleStoc(overlay)
            return false
          else
            if overlay.type == "Point"
              if @_googleMaps.isPointInPolygon(overlay, @_grilleStoc.overlay)
                isModified = true
            else
              @callbacks.displayError?("Mauvaise forme : " + overlay.type)
            if isModified
              @saveOverlay(overlay)
              # rightclick for delete overlay
              @addEventRightClick(overlay)
              # dragend for rename
              @addEventDragEnd(overlay)
              if @_isOpportuniste
                @_step = 'validLocalities'
              else
                if @getCountOverlays() >= @_min
                  @_step = 'validLocalities'
                else
                  @_step = 'editLocalities'
              @updateSite()
              return true
            return false

      saveOverlay: (overlay) =>
        locality = {}
        locality.overlay = overlay
        locality.representatif = false
        overlay.title = @setLocalityNameWithInterest(overlay)
        overlay.infowindow = @_googleMaps.createInfoWindow(overlay.title)
        overlay.infowindow.open(@_googleMaps.getMap(), overlay)
        @_localities.push(locality)

      setLocalityNameWithInterest: (overlay) ->
        # Check if localite is near a point of interest
        interestPoint = false
        name = ''
        position = overlay.getPosition()
        for circle in @_smallGrille or []
          distance = @_googleMaps.computeDistanceBetween(circle.getCenter(), position)
          if distance <= @_distanceOfInterest
            interestPoint = true
            name = circle.name
            break
        if interestPoint
          return name
        else
          return @setLocalityName()

      setLocalityName: (name = 1) ->
        if @_isOpportuniste
          for locality in @_fixLocalities
            if locality.overlay.title == 'Z'+name
              return @setLocalityName(name + 1)
        for locality in @_localities
          if locality.overlay.title == 'Z'+name
            return @setLocalityName(name + 1)
        return 'Z'+name

      renameLocality: (overlay, latLng) ->
        interestPoint = false
        for circle in @_smallGrille or []
          distance = @_googleMaps.computeDistanceBetween(circle.getCenter(), latLng)
          if distance <= @_distanceOfInterest
            interestPoint = true
            overlay.title = circle.name
            break
        if not interestPoint
          if overlay.title.charAt(0) == "Z"
            return
          else
            overlay.title = @setLocalityName()
        overlay.infowindow.setContent(overlay.title)

      validNumeroGrille: (cell, numero, id, editable = false) =>
        # remove click event on map
        @_googleMaps.clearListeners(@_googleMaps.getMap(), 'click')
        # change color of cell
        cell.setOptions(
          strokeColor: '#00E000'
          strokeOpacity: 1
          strokeWeight: 2
          fillColor: '#000000'
          fillOpacity: 0
        )
        # get Path of cell
        path = cell.getPath()
        # register grille stoc
        @_grilleStoc =
          overlay: cell
          numero: numero
          id: id
        lat = (path.getAt(0).lat() + path.getAt(2).lat()) / 2
        lng = (path.getAt(0).lng() + path.getAt(2).lng()) / 2
        @_googleMaps.setCenter(lat, lng)
        @_googleMaps.setZoom(13)
        @_googleMaps.setDrawingManagerOptions(drawingControl: true)
        if editable
          @_googleMaps.addListener(@_grilleStoc.overlay, 'rightclick', (e) =>
            if confirm("Cette opération supprimera tous les points.")
              @_step = 'start'
              @_grilleStoc.overlay.setMap(null)
              @_grilleStoc = {}
              for localite in @_localities or []
                @_googleMaps.deleteOverlay(localite.overlay)
              @_localities = []
              @_googleMaps.setDrawingManagerOptions(drawingControl: false)
              @selectGrilleStoc()
              @updateSite()
          )
        @displaySmallGrille()
        @_step = 'editLocalities'
        @updateSite()

      # Display 4x4 grille into grille stoc
      displaySmallGrille: ->
        for small in @_smallGrille or []
          small.setMap(null)
        @_smallGrille = []
        if !@_grilleStoc? or !@_grilleStoc.overlay?
          return
        # Get Center
        p1 = @_grilleStoc.overlay.getPath().getAt(0)
        p2 = @_grilleStoc.overlay.getPath().getAt(2)
        center = @_googleMaps.interpolate(p1, p2, 0.5)
        # Get NW
        nw = @_googleMaps.computeOffset(center, 1000*Math.sqrt(2), -45)
        # Generate points
        p = []
        p[0] = []
        for i in [0..4]
          p[i] = []
          if i == 0
            p[0][0] = nw
          else
            p[i][0] = @_googleMaps.computeOffset(p[i-1][0], 500, 180)
          for j in [1..4]
            p[i][j] = @_googleMaps.computeOffset(p[i][j-1], 500, 90)
        # Generate Squares
        for i in [0..3]
          for j in [0..3]
            path = [p[i][j], p[i+1][j], p[i+1][j+1], p[i][j+1]]
            center = @_googleMaps.interpolate(path[0], path[2], 0.5)
            circle = @_googleMaps.createCircle(center, @_distanceOfInterest, false, false)
            circle.setOptions(
              fillOpacity: 0
              fillColor: '#000000'
              strokeWeight: 2
              strokeOpacity: 0.6
              strokeColor: '#000000'
            )
            @_smallGrille.push(circle)
        @_smallGrille[0].name = 'A1'
        @_smallGrille[1].name = 'A2'
        @_smallGrille[2].name = 'B1'
        @_smallGrille[3].name = 'B2'
        @_smallGrille[4].name = 'C2'
        @_smallGrille[5].name = 'C1'
        @_smallGrille[6].name = 'D2'
        @_smallGrille[7].name = 'D1'
        @_smallGrille[8].name = 'E1'
        @_smallGrille[9].name = 'E2'
        @_smallGrille[10].name = 'F1'
        @_smallGrille[11].name = 'F2'
        @_smallGrille[12].name = 'G2'
        @_smallGrille[13].name = 'G1'
        @_smallGrille[14].name = 'H2'
        @_smallGrille[15].name = 'H1'
