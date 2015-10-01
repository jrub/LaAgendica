angular.module('laAgendica', ['ionic', 'leaflet-directive', 'laAgendica.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    if (window.cordova) {
      window.open = cordova.InAppBrowser.open;
    } else {
      delete window.open;
      console.log("** WebApp Mode **");
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;

      //Remove the header used to identify ajax call  that would prevent CORS from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.semana-santa', {
    url: "/semana-santa",
    views: {
      'menuContent': {
        templateUrl: "templates/semsanta.html",
        controller: function($scope) {
          $scope.dias = ["Domingo-de-Ramos", "Lunes-Santo", "Martes-Santo", "Miércoles-Santo", "Jueves-Santo", "Viernes-Santo", "Sábado-Santo", "Domingo-de-Resurrección"];
        }
      }
    }
  })

  .state('app.semana-santa-dia', {
    url: "/semana-santa/:dia",
    views: {
      'menuContent': {
        templateUrl: "templates/semsanta-dia.html",
        controller: 'SemanaSantaDiaCtrl'
        }
      }
  })

  .state('app.semana-santa-map', {
    url: "/semana-santa/mapa/:id",
    views: {
      'menuContent': {
        templateUrl: "templates/semsanta-map.html",
        controller: 'SemanaSantaMapCtrl'
        }
      }
  })

  .state('app.pilares', {
    url: "/pilares",
    views: {
      'menuContent': {
        templateUrl: "templates/pilares.html",
        controller: function($scope) {
          $scope.dias = ["Viernes-9", "Sábado-10", "Domingo-11", "Lunes-12", "Martes-13", "Miércoles-14", "Jueves-15", "Viernes-16", "Sábado-17", "Domingo-18"];
        }
      }
    }
  })

  .state('app.pilares-dia', {
    url: "/pilares/:dia",
    views: {
      'menuContent': {
        templateUrl: "templates/pilares-dia.html",
        controller: 'PilaresCtrl'
      }
    }
  })

  .state('app.pilares-evento', {
    url: "/pilares/:dia/:evento",
    views: {
      'menuContent': {
        templateUrl: "templates/pilares-evento.html",
        controller: 'PilaresEventoCtrl'
      }
    }
  })

  .state('app.destacados', {
    url: "/destacados",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/destacados.html",
        controller: 'DestacadosCtrl'
      }
    }
  })

  .state('app.eventos', {
    url: "/eventos/:tipo",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/eventos.html",
        controller: 'EventosCtrl'
      }
    }
  })

  .state('app.infantil', {
    url: "/infantil",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/eventos.html",
        controller: 'InfantilCtrl'
      }
    }
  })

  .state('app.favoritos', {
    url: "/favoritos",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/favoritos.html",
        controller: 'FavoritosCtrl'
      }
    }
  })

  .state('app.destacado', {
    url: "/destacado/:eventoId",
    views: {
      'menuContent': {
        templateUrl: "templates/destacado.html",
        controller: 'DestacadoCtrl'
      }
    }
  })

  .state('app.map', {
    url: "/map",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/map.html",
        controller: 'MapCtrl'
      }
    }
  })

  .state('app.single', {
    url: "/evento/:eventoId",
    views: {
      'menuContent': {
        templateUrl: "templates/evento.html",
        controller: 'EventoCtrl'
      }
    }
  })

  .state('app.team', {
    url: "/team",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/team.html",
        controller: 'TeamCtrl'
      }
    }
  })

  .state('app.about', {
    url: "/about",
    cache: false,
    views: {
      'menuContent': {
        templateUrl: "templates/about.html",
        controller: 'AboutCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/destacados');
})

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    allObjects: function() {
      var archive = [],
      keys = Object.keys(localStorage),
      i = 0;

      for (; i < keys.length; i++) {
        var key = keys[i]
        var fav = this.getObject(key)
        
        
        archive.push(fav);
      }
      return archive;
    },
    removeItem: function(key) {
      $window.localStorage.removeItem(key)
    },
    clearAll: function() {
      $window.localStorage.clear()
    }
  }
}]);

