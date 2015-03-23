angular.module('starter.controllers', ['ngSanitize'])

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
  SELECT DISTINCT ?id ?title ?startDate ?endDate concat('http:', ?image) as ?image ?description ?latitud ?longitud \
  WHERE {\
    ?uri a s:Event;\
    dcterms:identifier ?id;\
    rdfs:label  ?title.\
    OPTIONAL {?uri s:subEvent ?subEvent.}\
    OPTIONAL {?subEvent s:startDate ?startDate.}\
    OPTIONAL {?subEvent s:endDate ?endDate.}\
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
                    $scope.eventos.nav = tipoCap
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
                    $scope.eventos.nav = "Infantil"
                    $rootScope.eventos = data.response.docs
                }).error(function(data, status, headers, config) {
                    console.log('Error:' + data)
                });
})

.controller('FavoritosCtrl', function($scope, $localstorage, $rootScope) {
  $scope.eventos = $localstorage.allObjects()
  $scope.eventos.nav = "Favoritos"
  $rootScope.eventos = $scope.eventos
})

.controller('DestacadoCtrl', function($scope, $stateParams, $rootScope, $localstorage, $ionicPopup) {
  console.log($stateParams)
  console.log($rootScope.eventos[$stateParams.eventoId]);
  $scope.evento = $rootScope.eventos[$stateParams.eventoId];

  $scope.marcarFavorito = function(destacado) {
    var destacadofav = {
      id : destacado.id.value,
      description : destacado.description.value,
      title : destacado.title.value,
      fechaInicio_dt : destacado.startDate.value,
      fechaFinal_dt : destacado.endDate.value,
      imagen_s : destacado.image.value,
      coordenadas_p_0_coordinate: destacado.latitud.value,
      coordenadas_p_1_coordinate: destacado.longitud.value
    }
    $localstorage.setObject(destacadofav.id, destacadofav);
    var alertPopup = $ionicPopup.alert({
      title: 'Favoritos',
      template: 'Favorito guardado con éxito'
    });
  }

})

.controller('EventoCtrl', function($scope, $stateParams, $rootScope, $localstorage, $ionicPopup) {
  $scope.evento = $rootScope.eventos[$stateParams.eventoId];

  $scope.marcarFavorito = function(evento) {
    $localstorage.setObject(evento.id, evento);
    var alertPopup = $ionicPopup.alert({
      title: 'Favoritos',
      template: 'Favorito guardado con éxito'
    });
  }

  $scope.isFavorito = function(eventoId) {
    return $localstorage.getObject(eventoId)
  }

})

.controller('MapCtrl', function($scope, $ionicLoading, $compile, $localstorage, $state, $rootScope) {

  var favs = $localstorage.allObjects()
  $rootScope.eventos = favs;

  console.log('entra mapa')
    function initialize() {
      console.log('inicializa mapa')

      var map;
      var myInfoWindows = [];

      function getMyInfoWindows(i) {
        console.log('entro en getMuyInfoWindows')
        console.log(myInfoWindows)
        console.log('i es ' + i)
        console.log(myInfoWindows[i])
        return myInfoWindows[i]
      }

      function addListenerGoogleMaps(i, marker) {
        google.maps.event.addListener(marker, 'click', function() {
          //infowindow.open(map,marker);
          var myInfoWindow = getMyInfoWindows(i);
          myInfoWindow.open(map, marker)
        });
      }

      if (favs.length > 0) {
        var myLatlng = new google.maps.LatLng(favs[0].coordenadas_p_0_coordinate, favs[0].coordenadas_p_1_coordinate);
        var mapOptions = {
          center: myLatlng,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById("map"),
            mapOptions);  
      };
      
      for (var i = 0; i < favs.length; i++) {
        var fav = favs[i]
        console.log(fav)
        var theLatlng = new google.maps.LatLng(fav.coordenadas_p_0_coordinate, fav.coordenadas_p_1_coordinate);
        fav.index = i

        $scope.fav = fav;
        
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest({{fav}})'>" + fav.title + "<p>'Pulsa para ver detalle'</p></a></div>";
        var compiled = $compile(contentString)($scope);

        console.log("compiled")
        console.log(compiled)
        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });
        myInfoWindows.push(infowindow)
        console.log('infowindow')
        console.log(infowindow)

        var marker = new google.maps.Marker({
          position: theLatlng,
          map: map,
          title: fav.title
        });

        addListenerGoogleMaps(i, marker)

        // google.maps.event.addListener(marker, 'click', function() {
        //   //infowindow.open(map,marker);
        //   var myInfoWindow = getMyInfoWindows(i);
        //   myInfoWindow.open(map, marker)
        // });
      }

      $scope.map = map;
    }
    google.maps.event.addDomListener(window, 'load', initialize);
    initialize()
    
    $scope.centerOnMe = function() {
      console.log('centra mapa en ti')
      if(!$scope.map) {
        return;
      }

      $scope.loading = $ionicLoading.show({
        content: 'Getting current location...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function(pos) {
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        $scope.loading.hide();
      }, function(error) {
        alert('Unable to get location: ' + error.message);
      });
    };
    
    $scope.clickTest = function(obj) {
      console.log(obj)
      $state.go('app.single', {eventoId: obj.index});
    };
    
  })

  .controller('TeamCtrl', function($scope) {
    var javi = {
      nombre:       'Javier Rubio',
      rolTecnico:   'Android Sloth Developer',
      descripcion:  'Me apasiona la tecnología y, por suerte, mi pasión es mi trabajo, desde hace ya más de diez años. Aunque últimamente me gano el pan creando apps Android como freelance, me gusta salir continuamente de mi zona de confort. Perfeccionista y en proceso de mejora continua, con ganas de involucrarme en nuevos proyectos en los que prime la atención detalle.',
      twitter :     'https://twitter.com/jrubr',
      web:          'http://www.javirubio.net',
      github:       'https://github.com/jrub',
      imagenPerfil: 'http://www.gravatar.com/avatar/1328823cb98b75b1f020eabed78b1ff9.png?s=500',
      imagen:       ''
    }
    var tor  = {
      nombre:       'Héctor Rodríguez',
      rolTecnico:   'iOS Sloth Developer',
      descripcion:  'Trabajo como desarrollador freelance de aplicaciones móviles, me encanta aquello a lo que me dedico y disfruto haciéndolo bien. Estoy deseando trabajar contigo y crear algo nuevo que aporte valor para ti y tus usuarios. Sólo necesito unos auriculares, música y mi Macbook para ponerme a desarrollar la App que necesitas.',
      twitter:      'https://twitter.com/torhector2',
      web:          'https://www.behance.net/torhector2',
      github:       'https://github.com/torhector2',
      imagenPerfil: 'http://www.gravatar.com/avatar/1b951ff3d08e1d7fb7b7f94242855531.png?s=500',
      imagen:       ''
    }

    var team = [javi, tor]
    $scope.members = shuffle(team)

    function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;

};

  })

;
