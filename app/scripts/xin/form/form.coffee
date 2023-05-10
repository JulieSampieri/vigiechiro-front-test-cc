'use strict'


angular.module('xin.form', ['ui.bootstrap.datetimepicker', 'angularMoment'])
  .directive 'dateTextInputDirective', (guid) ->
    restrict: 'E'
    templateUrl: 'scripts/xin/form/date_text_input.html'
    controller: 'DateTextInputController'
    scope:
      label: '=?'
      model: '=?'
      error: '=?'
    link: (scope, elem, attrs) ->
      scope.date_id = guid()
      scope.today = false
      if attrs.today?
        scope.today = true

  .controller 'DateTextInputController', ($scope) ->
    $scope.textDate = ""
    $scope.originTextDate = ""
    firstChange = false

    $scope.onTimeSet = (newDate, oldDate) ->
      $("#dLabel_date_#{$scope.date_id}").dropdown('toggle')
      return true

    $scope.$watch 'model', (value) ->
      $scope.textDate = ''
      date = null
      if value? and value != ""
        date = moment(value)
      else if $scope.today and not firstChange
        date = moment()
        $scope.model = date._d
      else
        firstChange = true
        return
      $scope.textDate = date.format('DD/MM/YYYY HH:mm')
      if not firstChange
        firstChange = true
        $scope.originTextDate = $scope.textDate

    $scope.handleInputDate = ->
      $scope.error = ""
      if $scope.textDate? and $scope.textDate != ""
        testDate = moment($scope.textDate, "DD/MM/YYYY HH:mm", true)
        if testDate.isValid()
          $scope.model = testDate._d
        else
          $scope.error = $scope.textDate + " n'est pas une date valide (jj/mm/aaaa hh:mm)."
      else
        $scope.model = null

    $scope.$watch 'error', (value) ->
      if Array.isArray(value)
        error_text = ""
        for errorString in value
          if errorString.indexOf("Could not deserialize") > -1
            error_text += "Date invalide "
          else
            error_text += errorString
        $scope.error = error_text
    , true
