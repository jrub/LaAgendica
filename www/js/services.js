var laAgendicaServices = angular.module('laAgendica.services', ['ngResource']);

laAgendicaServices.factory('ApiSemanaSanta', function($resource) {
  return $resource('semana-santa-2015.json');
});