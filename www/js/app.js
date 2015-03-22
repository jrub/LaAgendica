// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

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
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: "/search",
    views: {
      'menuContent': {
        templateUrl: "templates/search.html"
      }
    }
  })

  .state('app.browse', {
    url: "/browse",
    views: {
      'menuContent': {
        templateUrl: "templates/browse.html"
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
        templateUrl: "templates/eventos.html",
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

  .state('app.single', {
    url: "/evento/:eventoId",
    views: {
      'menuContent': {
        templateUrl: "templates/evento.html",
        controller: 'EventoCtrl'
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
        console.log('El fav')
        console.log(fav.title)
        archive.push(fav);
      }
      return archive;
    },
    clearAll: function() {
      $window.localStorage.clear()
    }
  }
}]);

