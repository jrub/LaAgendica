angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('DestacadosCtrl', function($scope, $http, $stateParams, $rootScope) {
  var SPARQL_ENDPOINT = 'http://datos.zaragoza.es/sparql';
  var destacadosSPARQL = "PREFIX acto: <http://vocab.linkeddata.es/datosabiertos/def/cultura-ocio/agenda#>\
  PREFIX s: <http://schema.org/>\
  SELECT DISTINCT ?uri ?title ?image ?description ?latitud ?longitud \
  WHERE { ?uri a acto:Evento.\
    OPTIONAL{ ?uri rdfs:label ?title}.\
    OPTIONAL{ ?uri dcterms:description ?description}.\
    OPTIONAL{ ?uri s:image ?image}.\
    OPTIONAL {?uri geo:geometry ?geo.\
    ?geo geo:lat ?latitud.\
    ?geo geo:long ?longitud}.\
    ?uri acto:destacada \"true\".\
  }"
  $http.get(SPARQL_ENDPOINT + '?query=' + encodeURIComponent(destacadosSPARQL) + '&format=application%2Fsparql-results%2Bjson&timeout=0')
    .success(function(data, status, headers, config) {
        console.log(data)
        $scope.eventos = data.results.bindings
        $rootScope.eventos = data.results.bindings
    }).error(function(data, status, headers, config) {
        console.log('Error:' + data)
    });
})

.controller('EventosCtrl', function($scope, $http, $stateParams, $rootScope) {
  console.log($stateParams)
  var tipoCap = $stateParams.tipo.charAt(0).toUpperCase() + $stateParams.tipo.slice(1);
  $http({
                    method: 'JSONP',
                    url: 'http://www.zaragoza.es/buscador/select',
                    params: {
                        'json.wrf': 'JSON_CALLBACK',
                        'wt': 'json',
                        'start': 0,
                        'rows':  100,
                        'fl': 'uri,title,id,description,fechaInicio_dt,fechaFinal_dt,imagen_s,lugar_t,coordenadas_p_0_coordinate,coordenadas_p_1_coordinate,coordenadas_p',
                        'q': '*:* AND -tipocontenido_s:estatico AND category:Actividades AND fechaInicio_dt:[* TO NOW+7DAY] AND fechaFinal_dt:[NOW+7DAY TO *]',
                        'fq': 'temas_smultiple:(\"' + $stateParams.tipo + '\"),(\"' + tipoCap + '\")'
                    }
                }).success(function(data, status, headers, config) {
                    console.log(data)
                    $scope.eventos = data.response.docs
                    $rootScope.eventos = data.response.docs
                }).error(function(data, status, headers, config) {
                    console.log('Error:' + data)
                });
})

.controller('InfantilCtrl', function($scope, $http, $rootScope) {
  $http({
                    method: 'JSONP',
                    url: 'http://www.zaragoza.es/buscador/select',
                    params: {
                        'json.wrf': 'JSON_CALLBACK',
                        'wt': 'json',
                        'start': 0,
                        'rows':  100,
                        'fl': 'uri,title,id,description,fechaInicio_dt,fechaFinal_dt,imagen_s,lugar_t,coordenadas_p_0_coordinate,coordenadas_p_1_coordinate,coordenadas_p',
                        'q': '*:* AND -tipocontenido_s:estatico AND category:Actividades AND fechaInicio_dt:[* TO NOW+7DAY] AND fechaFinal_dt:[NOW+7DAY TO *]',
                        'fq': 'dirigidoa_smultiple:\"Infancia\"'
                    }
                }).success(function(data, status, headers, config) {
                    console.log(data)
                    $scope.eventos = data.response.docs
                    $rootScope.eventos = data.response.docs
                }).error(function(data, status, headers, config) {
                    console.log('Error:' + data)
                });
})
.controller('DestacadoCtrl', function($scope, $stateParams, $rootScope) {
  console.log($stateParams)
  console.log($rootScope.eventos[$stateParams.eventoId]);
  $scope.evento = $rootScope.eventos[$stateParams.eventoId];
})
.controller('EventoCtrl', function($scope, $stateParams, $rootScope) {
  console.log($stateParams)
  console.log($rootScope.eventos[$stateParams.eventoId]);
  $scope.evento = $rootScope.eventos[$stateParams.eventoId];
});
