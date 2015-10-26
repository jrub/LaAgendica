angular.module('laAgendica.controllers', ['laAgendica.services', 'ngSanitize', 'jett.ionic.filter.bar'])

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
  $scope.platform = ionic.Platform.platform();
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

.controller('PilaresCtrl', function($scope, ApiFecha, $stateParams, $rootScope, diasPilares) {
  $scope.diaPilar = $stateParams.dia.replace("-", " ").replace("-", " ");
  ApiFecha.fn(diasPilares[$scope.diaPilar], 'Fiestas del Pilar').get(function(evento) {
    $scope.eventos = evento.results.bindings;
    $rootScope.eventos = evento.results.bindings;
  });
})

.controller('PilaresEventoCtrl', function($scope, ApiFecha, $stateParams, $rootScope, diasPilares, SharingService, MapNavigationService, InAppBrowserService, $localstorage, $filter) {
  delete $rootScope.eventos;

  $scope.shareFn = SharingService;
  $scope.navigate = MapNavigationService;
  $scope.abrir = InAppBrowserService;

  $scope.gestionarFavorito = function(destacado) {
    if (destacado === undefined) {
      return;
    };
    
    var destacadofav = {
      id : destacado.id.value,
      description : destacado.description.value,
      title : destacado.title.value,
      fechaInicio_dt : destacado.startDate.value,
      fechaFinal_dt : destacado.endDate.value,
      // ApiFecha no concatena 'http:', lo que significa q al template de evento.html pueden llegar imgs sin 'http:' (otros como pilares-evento.html lo meten a mano)
      imagen_s : destacado.image ? (destacado.image.value.indexOf('http:') === 0 ? destacado.image.value : 'http:' + destacado.image.value) : '',
      coordenadas_p_0_coordinate: destacado.latitud ? destacado.latitud.value : '',
      coordenadas_p_1_coordinate: destacado.longitud ? destacado.longitud.value : '',
      nombrelugar_t: destacado.lugar ? destacado.lugar.value : '',
      direccionlugar_t: destacado.direccion ? destacado.direccion.value : '',
      telefonolugar_t: destacado.phone ? destacado.phone.value : '',
      horario_t: destacado.horario ? destacado.horario.value : '',
      entrada_t: destacado.precio ? destacado.precio.value : ''
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

  var procesarEventos = function() {
    $scope.evento = $rootScope.eventos.filter(function(obj) { return obj.id.value === $stateParams.evento})[0];

    if ($scope.isFavorito($scope.evento.id.value)) {
      $scope.evento.fav = true // para pintar el boton fav activo
    }
  }

  // En modo WebApp, podemos venir de un bookmark, por lo que no se abrá cargado $rootScope.eventos en 'PilaresCtrl'
  // así que hay que volver a llamar al API
  if ($rootScope.eventos === undefined) {
    var hoy = diasPilares[$stateParams.dia];
    var programa = 'Fiestas del Pilar';
    if ($stateParams.dia == undefined) { // si venimos de .state('app.hoy-detalle') -> url: "/hoy/:evento"
      hoy = $filter('date')(Date.now(), 'yyyy-MM-dd');
      var isPilares = Date.now() >= new Date(2015, 9, 9) && Date.now() <= new Date(2015, 9, 18); // 9 + 1 = mes 10
      programa = isPilares ? 'Fiestas del Pilar' : '';
    }
    ApiFecha.fn(hoy, programa, !isPilares).get(function(evento) {
      $scope.eventos = evento.results.bindings;
      $rootScope.eventos = evento.results.bindings;
      procesarEventos();
    });
  } else {
    procesarEventos();
  }
})

.controller('DestacadosCtrl', function($scope, ApiSparql, $rootScope, $filter) {
  delete $rootScope.eventos;

  $scope.textoNoContent = 'Actualmente no existen eventos destacados'
  $scope.hayEventos = true //hasta que no lo sepamos tras el callback de la llamada al API
  $scope.today = $filter('date')(Date.now(), 'yyyy-MM-dd');

  $scope.destacados = ApiSparql.get(function(evento) {
    $scope.eventos = evento.results.bindings;
    $rootScope.eventos = evento.results.bindings;
    $scope.hayEventos = ($scope.eventos.length > 0)
  });
})

.controller('HoyCtrl', function($scope, ApiFecha, $rootScope, $filter, $ionicFilterBar) {
  $scope.textoNoContent = 'Hoy no hay eventos. Parece que hoy es un día para relajarte en casa...'
  $scope.hayEventos = true //hasta que no lo sepamos tras el callback de la llamada al API
  var hoy = $filter('date')(Date.now(), 'yyyy-MM-dd');
  ApiFecha.fn(hoy, null, true).get(function(evento) {
    $scope.eventos = evento.results.bindings;
    $rootScope.eventos = evento.results.bindings;
    $scope.hayEventos = ($scope.eventos.length > 0)
  });
  $scope.showFilterBar = function () {
    filterBarInstance = $ionicFilterBar.show({
      items: $scope.eventos,
      update: function (filteredItems, filterText) {
        $scope.eventos = filteredItems;
        if (filterText) {
          console.log(filterText);
        }
      },
      cancelText: 'Cancelar',
      expression: function (filterText, value, index, array) {
         return value.title.value.toLowerCase().indexOf(filterText.toLowerCase()) !== -1
      }
    });
  };
})

.controller('SemanaSantaDiaCtrl', function($scope, ApiSemanaSanta, $stateParams, $state, $location, SharingService) {
  $scope.shareFn = SharingService;
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
  delete $rootScope.eventos;

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
                        'fl': 'uri,title,id,descripcion_t,fechaInicio_dt,fechaFinal_dt,imagen_s,lugar_t,coordenadas_p_0_coordinate,coordenadas_p_1_coordinate,coordenadas_p,nombrelugar_t,direccionlugar_t,telefonolugar_t,horario_t,entrada_t',
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
  delete $rootScope.eventos;

  $scope.hayEventos = true //hasta que no lo sepamos tras el callback de la llamada al API
  $http({
                    method: 'JSONP',
                    url: 'http://www.zaragoza.es/buscador/select',
                    params: {
                        'json.wrf': 'JSON_CALLBACK',
                        'wt': 'json',
                        'start': 0,
                        'rows':  100,
                        'fl': 'uri,title,id,descripcion_t,fechaInicio_dt,fechaFinal_dt,imagen_s,lugar_t,coordenadas_p_0_coordinate,coordenadas_p_1_coordinate,coordenadas_p,nombrelugar_t,direccionlugar_t,telefonolugar_t,horario_t,entrada_t',
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
  delete $rootScope.eventos;

  $scope.eventos = $localstorage.allObjects()
  $scope.eventos.nav = "Favoritos"
  $rootScope.eventos = $scope.eventos
  $scope.hayEventos = ($scope.eventos.length > 0)
  $scope.textoNoContent = '¡Aún no tienes favoritos! \n\n Anímate a guardar tus eventos favoritos, y así podrás verlos en el mapa de un vistazo.'
})

.controller('DestacadoCtrl', function($scope, $state, $stateParams, $rootScope, $localstorage, $ionicPopup, $ionicHistory, SharingService, MapNavigationService, InAppBrowserService) {
  $scope.navigate = MapNavigationService;
  $scope.shareFn = SharingService;
  $scope.abrir = InAppBrowserService;

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
      // ApiFecha no concatena 'http:', lo que significa q al template de evento.html pueden llegar imgs sin 'http:' (otros como pilares-evento.html lo meten a mano)
      imagen_s : destacado.image ? (destacado.image.value.indexOf('http:') === 0 ? destacado.image.value : 'http:' + destacado.image.value) : '',
      coordenadas_p_0_coordinate: destacado.latitud ? destacado.latitud.value : '',
      coordenadas_p_1_coordinate: destacado.longitud ? destacado.longitud.value : '',
      nombrelugar_t: destacado.lugar ? destacado.lugar.value : '',
      direccionlugar_t: destacado.direccion ? destacado.direccion.value : '',
      telefonolugar_t: destacado.phone ? destacado.phone.value : '',
      horario_t: destacado.horario ? destacado.horario.value : '',
      entrada_t: destacado.precio ? destacado.precio.value : ''
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

.controller('EventoCtrl', function($scope, $state, $stateParams, $rootScope, $localstorage, $ionicPopup, $ionicHistory, SharingService, MapNavigationService, InAppBrowserService) {
  $scope.navigate = MapNavigationService;
  $scope.shareFn = SharingService;
  $scope.abrir = InAppBrowserService;

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

        var imgStr = "";
        if (fav.imagen_s && (typeof fav.imagen_s == 'string')) {
          imgStr = "<img src='"+ fav.imagen_s + "' width='100' height='60' class='evimage'/>"
        };
        var contentString = "<div><a ng-click='clickMapInfoWindow({{fav}})'>" + fav.title + "<p>'Pulsa para ver detalle'</p>"+ imgStr +"</a></div>";
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

  .controller('TeamCtrl', function($scope, InAppBrowserService) {
    $scope.abrir = InAppBrowserService;
    var javi = {
      nombre:       'Javier Rubio',
      rolTecnico:   'Android Developer',
      descripcion:  'Me apasiona la tecnología y, por suerte, mi pasión es mi trabajo, desde hace ya más de diez años. Aunque últimamente me gano el pan creando apps Android como freelance, me gusta salir continuamente de mi zona de confort. Perfeccionista y en proceso de mejora continua, con ganas de involucrarme en nuevos proyectos en los que prime la atención al detalle.',
      twitter :     'https://twitter.com/jrubr',
      web:          'http://www.javirubio.net',
      github:       'https://github.com/jrub',
      imagenPerfil: 'https://www.gravatar.com/avatar/1328823cb98b75b1f020eabed78b1ff9.png?s=500'
    }
    var tor  = {
      nombre:       'Héctor Rodríguez',
      rolTecnico:   'iOS Developer',
      descripcion:  'Trabajo como desarrollador freelance de aplicaciones móviles, me encanta aquello a lo que me dedico y disfruto haciéndolo bien. Estoy deseando trabajar contigo y crear algo nuevo que aporte valor para ti y tus usuarios. Sólo necesito unos auriculares, música y mi Macbook para ponerme a desarrollar la App que necesitas.',
      twitter:      'https://twitter.com/torhector2',
      web:          'https://www.behance.net/torhector2',
      github:       'https://github.com/torhector2',
      imagenPerfil: 'https://www.gravatar.com/avatar/1b951ff3d08e1d7fb7b7f94242855531.png?s=500'
    }

    var team = [javi, tor]
    $scope.members = shuffle(team)

    function shuffle(o) {
      for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;
    };
  })

  .controller('AboutCtrl', function($scope, $ionicPopup) {
    $scope.is_app = ionic.Platform.isWebView();
    $scope.addToHomeAlert = function() {
      var alertPopup = $ionicPopup.alert({
        title: '¡Aún no disponible en Windows Phone!',
        template: '<pre class="evpre" style="text-align:center">Estamos trabajando para sacar LaAgendica también en Windows Phone. <br> Mientras tanto, pulsa en <strong>Más </strong><img src="https://assets.windowsphone.com/54516450-75a5-40aa-a4eb-8ebd4931d348/basic-icon-ellipses_InvariantCulture_Default.png" alt="Icono de Más"> y, luego, pulsa en <strong>Anclar a Inicio</strong> para tenerla en tu pantalla de inicio como si fuera una app más. <br><br> Ahora mismo no tenemos dispositivos Windows para testear la app, así que si encuentras fallos por favor avísanos en <a href="mailto:info@laAgendica.com?subject=Problema%20en%20Windows%20Phone">info@laAgendica.com</a></pre>'
      });
    };
    // makes sure all links to be opened in a new tab (target='_blank') are opened with window.open,
    // which makes it work both as WebApp and native app. Only works without '{{ngVars}}'
    angular.element(document.querySelectorAll("a[target='_blank']")).on("click", (function(e){
      alert("open mio");
      e.preventDefault();
      window.open(e.currentTarget.href, '_system', 'location=yes');
    }));
  })

;
