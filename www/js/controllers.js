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

.controller('EventosCtrl', function($scope, $http) {
  var url = 'http://www.zaragoza.es/buscador/select?wt=json&q=*:*%20AND%20-tipocontenido_s:estatico%20AND%20category:Actividades%20AND%20fechaInicio_dt:[*%20TO%20NOW%2B7DAY]%20AND%20fechaFinal_dt:[NOW%2B7DAY%20TO%20*]&fq=temas_smultiple:(%22Musica%22),(%22musica%22)';
  $http({
                    method: 'JSONP',
                    url: 'http://www.zaragoza.es/buscador/select',
                    params: {
                        'json.wrf': 'JSON_CALLBACK',
                        'wt': 'json',
                        'start': 0,
                        'rows':  100,
                        'fl': 'uri,title,id,texto_t,x_coordinate,y_coordinate,last_modified,temas_smultiple',
                        'q': '*:* AND -tipocontenido_s:estatico AND category:Actividades AND fechaInicio_dt:[* TO NOW+7DAY] AND fechaFinal_dt:[NOW+7DAY TO *]',
                        'fq': 'temas_smultiple:(\"Musica\"),(\"musica\")'
                    }
                }).success(function(data, status, headers, config) {
                    console.log(data)
                    $scope.eventos = data.response.docs
                }).error(function(data, status, headers, config) {
                    console.log('Error:' + data)
                });
})

.controller('EventoCtrl', function($scope, $stateParams) {
});
