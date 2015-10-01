angular.module('laAgendica.controllers', ['laAgendica.services', 'ngSanitize'])

.constant("diasPilares", {"Viernes 9":"2015-10-09", "Sábado 10":"2015-10-10", "Domingo 11":"2015-10-11", "Lunes 12":"2015-10-12", "Martes 13":"2015-10-13", "Miércoles 14":"2015-10-14", "Jueves 15":"2015-10-15", "Viernes 16":"2015-10-16", "Sábado 17":"2015-10-17", "Domingo 18":"2015-10-18"})

// añade spinner 'loading' http://learn.ionicframework.com/formulas/loading-screen-with-interceptors/
.config(function($httpProvider) {
  $httpProvider.interceptors.push(function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:show')
        return config
      },
      response: function(response) {
        $rootScope.$broadcast('loading:hide')
        return response
      }
    }
  })
})
.run(function($rootScope, $ionicLoading) {
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: '<p>Cargando...</p><ion-spinner></ion-spinner>'})
  })

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide()
  })
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $localstorage, $state, $ionicPopup) {

  $scope.openMap = function() {
    if (hasToOpenMap()) {
      $state.go('app.map');
    } else {
      var alertPopup = $ionicPopup.alert({
        title: '¡Aún no tienes favoritos!',
        template: '<pre class="evpre" style="text-align:center">Anímate a guardar tus eventos favoritos, y así podrás verlos en el mapa de un vistazo.</pre>'
      });
    }
  };

  function hasToOpenMap() {
    return $localstorage.allObjects().length > 0
  }

})

.controller('PilaresCtrl', function($scope, ApiPilares, $stateParams, $rootScope, diasPilares) {
  $scope.diaPilar = $stateParams.dia.replace("-", " ").replace("-", " ");
  ApiPilares.fn(diasPilares[$scope.diaPilar]).get(function(evento) {
    $scope.eventos = evento.results.bindings;
    $rootScope.eventos = evento.results.bindings;
  });
})

.controller('PilaresEventoCtrl', function($scope, ApiPilares, $stateParams, $rootScope, diasPilares, SharingService) {
  //Pasar esto a un Servicio
  $scope.shareFn = SharingService;

  var eventoId = $stateParams.evento;

  var procesarEventos = function() {
    var evento;
    for (var i = 0; i < $rootScope.eventos.length; i++) {
      if (eventoId === $rootScope.eventos[i].id.value) {
        evento = $rootScope.eventos[i];
        break;
      };
    }
    $scope.evento = evento;
  }

  if ($rootScope.eventos === undefined) {
    ApiPilares.fn(diasPilares[$stateParams.dia]).get(function(evento) {
      $scope.eventos = evento.results.bindings;
      $rootScope.eventos = evento.results.bindings;
      procesarEventos();
    });
  } else {
    procesarEventos();
  }

  

})

.controller('DestacadosCtrl', function($scope, ApiSparql, $rootScope) {
  $scope.textoNoContent = 'Actualmente no existen eventos destacados'
  $scope.hayEventos = true //hasta que no lo sepamos tras el callback de la llamada al API

  $scope.destacados = ApiSparql.get(function(evento) {
    $scope.eventos = evento.results.bindings;
    $rootScope.eventos = evento.results.bindings;
    $scope.hayEventos = ($scope.eventos.length > 0)
  });
})

.controller('SemanaSantaDiaCtrl', function($scope, ApiSemanaSanta, $stateParams, $state, $location) {
  $scope.diasanto = $stateParams.dia.replace("-", " ").replace("-", " ");
  $scope.procesiones = ApiSemanaSanta.query();

  $scope.goMap = function(procesion) {
    $state.go('app.semana-santa-map', {id: procesion.id});
  };
  $scope.url = $location.absUrl().replace("#", "%23")
})

.controller('SemanaSantaMapCtrl', function($scope, $http, $stateParams, leafletData) {

  $scope.map = {
          defaults: {
            tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            maxZoom: 18,
            zoomControlPosition: 'bottomleft'
          },
          center: {
            lat: 41.6484815,
            lng: -0.8904359,
            zoom: 14
          },
          markers : {},
          events: {
            map: {
              enable: ['context'],
              logic: 'emit'
            }
          }
        };

        $http({
            method: 'GET',
            url: "http://www.zaragoza.es/api/recurso/cultura-ocio/procesion/recorrido/" + $stateParams.id + ".json?srsname=wgs84"
          }).success(function(data, status) {
            angular.extend($scope, {
                geojson: {
                    data: data
                }
            });
            // centrar el mapa en el recorrido
            leafletData.getMap().then(function(map) {
              leafletData.getGeoJSON().then(function(geoJSON) {
                map.fitBounds(geoJSON.getBounds());
              });
            });
        });

        $scope.locate = function() {
          navigator.geolocation
            .getCurrentPosition(function (position) {
              $scope.map.center.lat  = position.coords.latitude;
              $scope.map.center.lng = position.coords.longitude;
              $scope.map.center.zoom = 15;

              $scope.map.markers.now = {
                lat:position.coords.latitude,
                lng:position.coords.longitude,
                message: "Estás aquí",
                focus: true,
                draggable: false
              };

            }, function(err) {
              console.log("Location error!");
              console.log(err);
            });
      };
})

.controller('EventosCtrl', function($scope, $http, $stateParams, $rootScope) {
  
  var tipoCap = $stateParams.tipo.charAt(0).toUpperCase() + $stateParams.tipo.slice(1);
  $scope.hayEventos = true //hasta que no lo sepamos tras el callback de la llamada al API
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
                    $scope.hayEventos = ($scope.eventos.length > 0)
                    $scope.textoNoContent = 'Actualmente no existen eventos para esta sección'

                }).error(function(data, status, headers, config) {
                    
                });

})

.controller('InfantilCtrl', function($scope, $http, $rootScope) {
  $scope.hayEventos = true //hasta que no lo sepamos tras el callback de la llamada al API
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
                    $scope.hayEventos = ($scope.eventos.length > 0)
                }).error(function(data, status, headers, config) {
                    
                });
})

.controller('FavoritosCtrl', function($scope, $localstorage, $rootScope) {
  $scope.eventos = $localstorage.allObjects()
  $scope.eventos.nav = "Favoritos"
  $rootScope.eventos = $scope.eventos
  $scope.hayEventos = ($scope.eventos.length > 0)
  $scope.textoNoContent = '¡Aún no tienes favoritos! \n\n Anímate a guardar tus eventos favoritos, y así podrás verlos en el mapa de un vistazo.'
})

.controller('DestacadoCtrl', function($scope, $state, $stateParams, $rootScope, $localstorage, $ionicPopup, $ionicHistory, SharingService) {
  
  $scope.shareFn = SharingService;
  if (!$rootScope.eventos) {
    $state.go('app.destacados')
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    return
  }
  
  $scope.evento = $rootScope.eventos[$stateParams.eventoId];

  $scope.gestionarFavorito = function(destacado) {
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
    if ($scope.isFavorito(destacadofav.id)) {
      $localstorage.removeItem(destacadofav.id)
      $scope.evento.fav = false
      return
    } else {
      $localstorage.setObject(destacadofav.id, destacadofav);
      $scope.evento.fav = true
    }
  }

  $scope.isFavorito = function(eventoId) {
    var fav = $localstorage.getObject(eventoId)
    return fav.id === eventoId
  }

  if ($scope.isFavorito($scope.evento.id.value)) {
    $scope.evento.fav = true // para pintar el boton fav activo
  }
})

.controller('EventoCtrl', function($scope, $state, $stateParams, $rootScope, $localstorage, $ionicPopup, $ionicHistory, SharingService) {

  $scope.shareFn = SharingService;
  if (!$rootScope.eventos) {
    $state.go('app.destacados')
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });
    return
  }
  $scope.evento = $rootScope.eventos[$stateParams.eventoId];

  $scope.gestionarFavorito = function(evento) {
    if ($scope.isFavorito(evento.id)) {
      $localstorage.removeItem(evento.id)
      $scope.evento.fav = false
      if ($ionicHistory.backView().stateName == "app.favoritos") {
        var alertPopup = $ionicPopup.alert({
          title: 'Favoritos',
          template: 'Favorito borrado con éxito'
        });
        $ionicHistory.goBack()
      }
      return;
    } else {
      $localstorage.setObject(evento.id, evento);
      $scope.evento.fav = true
    }
  }

  $scope.isFavorito = function(eventoId) {
    var fav = $localstorage.getObject(eventoId)
    return fav.id === eventoId
  }

  if ($scope.isFavorito($scope.evento.id)) {
    $scope.evento.fav = true // para pintar el boton fav activo
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

        var contentString = "<div><a ng-click='clickMapInfoWindow({{fav}})'>" + fav.title + "<p>'Pulsa para ver detalle'</p><img src='"+ fav.imagen_s + "' width='100' height='60' class='evimage'/></a></div>";
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
        content: 'Buscándote...',
        showBackdrop: false
      });

      navigator.geolocation.getCurrentPosition(function(pos) {
        $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        $scope.loading.hide();
      }, function(error) {
        alert('Lo sentimos, no hemos podido encontrarte.');
      });
    };
    
    $scope.clickMapInfoWindow = function(obj) {
      
      $state.go('app.single', {eventoId: obj.index});
    };
    
  })

  .controller('TeamCtrl', function($scope) {
    var javi = {
      nombre:       'Javier Rubio',
      rolTecnico:   'Android Developer',
      descripcion:  'Me apasiona la tecnología y, por suerte, mi pasión es mi trabajo, desde hace ya más de diez años. Aunque últimamente me gano el pan creando apps Android como freelance, me gusta salir continuamente de mi zona de confort. Perfeccionista y en proceso de mejora continua, con ganas de involucrarme en nuevos proyectos en los que prime la atención al detalle.',
      twitter :     'https://twitter.com/jrubr',
      web:          'http://www.javirubio.net',
      github:       'https://github.com/jrub',
      imagenPerfil: 'http://www.gravatar.com/avatar/1328823cb98b75b1f020eabed78b1ff9.png?s=500',
      imagen:       ''
    }
    var tor  = {
      nombre:       'Héctor Rodríguez',
      rolTecnico:   'iOS Developer',
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
