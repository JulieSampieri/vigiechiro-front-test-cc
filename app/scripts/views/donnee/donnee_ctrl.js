// Generated by CoffeeScript 1.12.7
(function() {
  'use strict';
  var breadcrumbsGetParticipationDefer;

  breadcrumbsGetParticipationDefer = void 0;

  angular.module('donneeViews', ['ngRoute', 'xin_backend', 'xin_session', 'xin_tools', 'ui.bootstrap']).config(function($routeProvider) {
    return $routeProvider.when('/participations/:participationId/donnees', {
      templateUrl: 'scripts/views/donnee/list_donnees.html',
      controller: 'ListDonneesController',
      breadcrumbs: ngInject(function($q, $filter) {
        var breadcrumbsDefer;
        breadcrumbsDefer = $q.defer();
        breadcrumbsGetParticipationDefer = $q.defer();
        breadcrumbsGetParticipationDefer.promise.then(function(participation) {
          return breadcrumbsDefer.resolve([['Participations', '#/participations'], ['Participation du ' + $filter('date')(participation.date_debut, 'medium'), '#/participations/' + participation._id], ['Données', '#/participations/' + participation._id + '/donnees']]);
        });
        return breadcrumbsDefer.promise;
      })
    });
  }).controller('ListDonneesController', function($scope, $routeParams, $timeout, Backend, session, DelayedEvent) {
    var delayedFilter, sortByLibelle, sortByProbabilite;
    $scope.participation = {};
    $scope.lookup = {};
    $scope.others = {
      isObservateur: false,
      isValidateur: false,
      taxons: []
    };
    $scope.tadarida_taxon = {
      id: null
    };
    $scope.filteredTaxons = [];
    $scope.tadarida_probabilite = {}; /*ajout*/
    Backend.one('participations', $routeParams.participationId).get().then(function(participation) {
      var i, j, k, len, len1, len2, ref, ref1, ref2, taxon;
      $scope.participation = participation.plain();
      if (breadcrumbsGetParticipationDefer != null) {
        breadcrumbsGetParticipationDefer.resolve(participation);
        breadcrumbsGetParticipationDefer = void 0;
      }
      session.getUserPromise().then(function(user) {
        var ref;
        if (participation.observateur._id === user._id) {
          $scope.others.isObservateur = true;
        }
        if ((ref = user.role) === 'Validateur' || ref === 'Administrateur') {
          return $scope.others.isValidateur = true;
        }
      });
      if (participation.bilan != null) {
        ref = participation.bilan.autre || [];
        for (i = 0, len = ref.length; i < len; i++) {
          taxon = ref[i];
          $scope.filteredTaxons.push({
            _id: taxon.taxon._id,
            libelle_court: taxon.taxon.libelle_court
          });
        }
        ref1 = participation.bilan.chiropteres || [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          taxon = ref1[j];
          $scope.filteredTaxons.push({
            _id: taxon.taxon._id,
            libelle_court: taxon.taxon.libelle_court
          });
        }
        ref2 = participation.bilan.orthopteres || [];
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          taxon = ref2[k];
          $scope.filteredTaxons.push({
            _id: taxon.taxon._id,
            libelle_court: taxon.taxon.libelle_court
          });
        }
      }
      $scope.filteredTaxons.sort(sortByLibelle);
      return Backend.all('taxons/liste').getList().then(function(taxons) {
        return $scope.others.taxons = taxons.plain();
      });
    }, function(error) {
      return window.location = '#404';
    });
    sortByLibelle = function(a, b) {
      return a.libelle_court.localeCompare(b.libelle_court);
    };
    delayedFilter = new DelayedEvent(500);
    $scope.filterField = '';
    $scope.$watch('titre', function(titre) {
      return delayedFilter.triggerEvent(function() {
        if ((titre != null) && titre !== '') {
          return $scope.lookup.titre = titre;
        } else if ($scope.lookup.titre != null) {
          return delete $scope.lookup.titre;
        }
      });
    });
    $scope.$watch('tadarida_taxon.id', function(taxon) {
      return delayedFilter.triggerEvent(function() {
        if ((taxon != null) && taxon !== '') {
          return $scope.lookup.tadarida_taxon = taxon;
        } else if ($scope.lookup.tadarida_taxon != null) {
          return delete $scope.lookup.tadarida_taxon;
        }
      });
    });
    /*ajout du filtre probabilité égale à */
    console.log("test1");
    $scope.$watch('probabilite', function(probabilite) {
      console.log("probabilite", probabilite, "fin probabilite");
      return delayedFilter.triggerEvent(function() {
        if ((probabilite != null) && probabilite !== '') {
          return $scope.lookup.tadarida_probabilite = probabilite;
        } else if ($scope.lookup.tadarida_probabilite != null) {
          return delete $scope.lookup.tadarida_probabilite;
        }
      });
    });
    console.log("test");
    /*fin de l'ajout du filtre probabilité égale à */
    $scope.resourceBackend = Backend.all('participations/' + $routeParams.participationId + '/donnees');
    $scope.updateResourcesList = function(current_scope) {
      var i, j, key, len, len1, observation, ref, ref1, resource, results;
      ref = current_scope.resources || [];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        resource = ref[i];
        if (resource.observations != null) {
          ref1 = resource.observations || [];
          for (key = j = 0, len1 = ref1.length; j < len1; key = ++j) {
            observation = ref1[key];
            observation.index = key;
          }
          results.push(resource.observations.sort(sortByProbabilite));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };
    return sortByProbabilite = function(a, b) {
      return a.tadarida_probabilite < b.tadarida_probabilite;
    };
  }).directive('displayDonneeDirective', function($route, $modal, Backend) {
    return {
      restrict: 'E',
      templateUrl: 'scripts/views/donnee/display_donnee_drt.html',
      scope: {
        donnee: '=',
        isObservateur: '=',
        isValidateur: '=',
        taxons: '='
      },
      link: function(scope, elem, attrs) {
        var CreateElementForExecCommand, SelectContent;
        scope.patchSuccess = [];
        scope.patchError = [];
        scope.putMessageSuccess = [];
        scope.putMessageError = [];
        scope.addPost = function(index, post) {
          var payload;
          payload = {
            message: post
          };
          scope.post = '';
          return Backend.all("donnees/" + scope.donnee._id + "/observations/" + index + "/messages").customPUT(payload).then(function(donnee) {
            scope.putMessageSuccess[index] = true;
            return scope.donnee.observations[index].messages = donnee.observations[index].messages;
          }, function(error) {
            return scope.putMessageError[index] = true;
          });
        };
        scope.editDonnee = function() {
          var modalInstance;
          modalInstance = $modal.open({
            templateUrl: 'scripts/views/donnee/edit_donnee.html',
            controller: 'ModalInstanceController',
            resolve: {
              donnee: function() {
                return scope.donnee;
              }
            }
          });
          return modalInstance.result.then(function(payload) {
            return Backend.one('donnees', scope.donnee._id).get().then(function(donnee) {
              return donnee.patch(payload).then(function() {
                return $route.reload();
              }, function(error) {
                throw error;
              });
            });
          });
        };
        scope.patchValidateur = function(key) {
          var i, len, obs, observation, payload, ref;
          scope.patchSuccess[key] = false;
          scope.patchError[key] = false;
          observation = null;
          ref = scope.donnee.observations || [];
          for (i = 0, len = ref.length; i < len; i++) {
            obs = ref[i];
            if (!(obs.index === key)) {
              continue;
            }
            observation = obs;
            break;
          }
          payload = {
            validateur_taxon: observation.validateur_taxon,
            validateur_probabilite: observation.validateur_probabilite
          };
          return Backend.all('donnees/' + scope.donnee._id + '/observations/' + key).patch(payload).then(function(success) {
            return scope.patchSuccess[key] = true;
          }, function(error) {
            return scope.patchError[key] = true;
          });
        };
        scope.patchObservateur = function(key) {
          var i, len, obs, observation, payload, ref;
          scope.patchSuccess[key] = false;
          scope.patchError[key] = false;
          observation = null;
          ref = scope.donnee.observations || [];
          for (i = 0, len = ref.length; i < len; i++) {
            obs = ref[i];
            if (!(obs.index === key)) {
              continue;
            }
            observation = obs;
            break;
          }
          payload = {
            observateur_taxon: observation.observateur_taxon,
            observateur_probabilite: observation.observateur_probabilite
          };
          return Backend.all('donnees/' + scope.donnee._id + '/observations/' + key).patch(payload).then(function(success) {
            return scope.patchSuccess[key] = true;
          }, function(error) {
            return scope.patchError[key] = true;
          });
        };
        scope.CopyToClipboard = function(text) {
          var e, forExecElement, success, supported, textToClipboard;
          textToClipboard = text;
          success = true;
          if (window.clipboardData) {
            window.clipboardData.setData("Text", textToClipboard);
          } else {
            forExecElement = CreateElementForExecCommand(textToClipboard);
            SelectContent(forExecElement);
            supported = true;
            try {
              if (window.netscape && netscape.security) {
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
              }
              success = document.execCommand("copy", false, null);
            } catch (error1) {
              e = error1;
              success = false;
            }
            document.body.removeChild(forExecElement);
          }
          if (success) {
            return scope.copySuccess = true;
          } else {
            return window.prompt("Copier vers le presse-papiers: Ctrl+C, Entrer", text);
          }
        };
        CreateElementForExecCommand = function(textToClipboard) {
          var forExecElement;
          forExecElement = document.createElement("div");
          forExecElement.style.position = "absolute";
          forExecElement.style.left = "-10000px";
          forExecElement.style.top = "-10000px";
          forExecElement.textContent = textToClipboard;
          document.body.appendChild(forExecElement);
          forExecElement.contentEditable = true;
          return forExecElement;
        };
        return SelectContent = function(element) {
          var rangeToSelect, selection;
          rangeToSelect = document.createRange();
          rangeToSelect.selectNodeContents(element);
          selection = window.getSelection();
          selection.removeAllRanges();
          return selection.addRange(rangeToSelect);
        };
      }
    };
  }).controller('ModalInstanceController', function($scope, $modalInstance, donnee) {
    $scope.donnee = donnee;
    return $scope.done = function(done) {
      if (!done) {
        return $modalInstance.dismiss("cancel");
      } else {
        return $modalInstance.close({
          commentaire: $scope.donnee.commentaire,
          probleme: $scope.donnee.probleme
        });
      }
    };
  });

}).call(this);
