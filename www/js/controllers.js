angular.module('starter.controllers', ['ngSanitize'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage, $state, $ionicPopup) {

  // Open the login modal
  $scope.openMap = function() {
    if (hasToOpenMap()) {
      $state.go('app.map');
    } else {
      var alertPopup = $ionicPopup.alert({
        title: 'Mapa de Favoritos',
        template: 'No tienes favoritos, te animamos a que guardes algunos para visualizarlos en el mapa.'
      });
    }
  };

  function hasToOpenMap() {
    return $localstorage.allObjects().length > 0
  }

})

.controller('DestacadosCtrl', function($scope, $http, $stateParams, $rootScope) {
  var SPARQL_ENDPOINT = 'http://datos.zaragoza.es/sparql';
  var destacadosSPARQL = "PREFIX acto: <http://vocab.linkeddata.es/datosabiertos/def/cultura-ocio/agenda#>\
  PREFIX s: <http://schema.org/>\
  SELECT DISTINCT ?id ?uri ?title ?startDate ?endDate concat('http:', ?image) as ?image ?description ?latitud ?longitud \
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

  $scope.mostrarEventos = true //hasta que no lo sepamos desde el servidor

  $http.get(SPARQL_ENDPOINT + '?query=' + encodeURIComponent(destacadosSPARQL) + '&format=application%2Fsparql-results%2Bjson&timeout=0')
    .success(function(data, status, headers, config) {
        
        $scope.eventos = data.results.bindings
        $rootScope.eventos = data.results.bindings
        $scope.mostrarEventos = ($scope.eventos.length > 0)
        $scope.textoNoContent = 'Actualmente no existen eventos destacados'
    }).error(function(data, status, headers, config) {
        
    });
})

.controller('EventosCtrl', function($scope, $http, $stateParams, $rootScope) {
  
  var tipoCap = $stateParams.tipo.charAt(0).toUpperCase() + $stateParams.tipo.slice(1);
  $scope.mostrarEventos = true //hasta que no lo sepamos desde el servidor
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
                    
                    $scope.eventos = data.response.docs
                    $scope.eventos.nav = tipoCap
                    $rootScope.eventos = data.response.docs
                    $scope.mostrarEventos = ($scope.eventos.length > 0)
                    $scope.textoNoContent = 'Actualmente no existen eventos para esta sección'

                }).error(function(data, status, headers, config) {
                    
                });

})

.controller('InfantilCtrl', function($scope, $http, $rootScope) {
  $scope.mostrarEventos = true //hasta que no lo sepamos desde el servidor
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
                    
                    $scope.eventos = data.response.docs
                    $scope.eventos.nav = "Infantil"
                    $rootScope.eventos = data.response.docs
                    $scope.mostrarEventos = ($scope.eventos.length > 0)
                }).error(function(data, status, headers, config) {
                    
                });
})

.controller('FavoritosCtrl', function($scope, $localstorage, $rootScope) {
  $scope.eventos = $localstorage.allObjects()
  $scope.eventos.nav = "Favoritos"
  $rootScope.eventos = $scope.eventos
  $scope.mostrarEventos = ($scope.eventos.length > 0)
  $scope.textoNoContent = 'Actualmente no tienes favoritos guardados. Anímate a crear uno.'
})

.controller('DestacadoCtrl', function($scope, $state, $stateParams, $rootScope, $localstorage, $ionicPopup, $ionicHistory) {
  if (!$rootScope.eventos) {
    $state.go('app.destacados')
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    return
  }
  
  
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

.controller('EventoCtrl', function($scope, $state, $stateParams, $rootScope, $localstorage, $ionicPopup, $ionicHistory) {
  if (!$rootScope.eventos) {
    $state.go('app.destacados')
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    return
  }
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

  
    function initialize() {
      

      var map;
      var myInfoWindows = [];

      function getMyInfoWindows(i) {
        
        
        
        
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
        
        var theLatlng = new google.maps.LatLng(fav.coordenadas_p_0_coordinate, fav.coordenadas_p_1_coordinate);
        fav.index = i

        $scope.fav = fav;
        
        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest({{fav}})'>" + fav.title + "<p>'Pulsa para ver detalle'</p><img src='"+ fav.imagen_s + "' width='100' height='60' class='evimage'/></a></div>";
        var compiled = $compile(contentString)($scope);

        
        
        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });
        myInfoWindows.push(infowindow)
        
        

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
      
      $state.go('app.single', {eventoId: obj.index});
    };
    
  })

  .controller('TeamCtrl', function($scope) {
    var javi = {
      nombre:       'Javier Rubio',
      rolTecnico:   'Android Sloth Developer',
      descripcion:  'Me apasiona la tecnología y, por suerte, mi pasión es mi trabajo, desde hace ya más de diez años. Aunque últimamente me gano el pan creando apps Android como freelance, me gusta salir continuamente de mi zona de confort. Perfeccionista y en proceso de mejora continua, con ganas de involucrarme en nuevos proyectos en los que prime la atención al detalle.',
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

  .controller('AboutCtrl', function($scope) {

  })

;
