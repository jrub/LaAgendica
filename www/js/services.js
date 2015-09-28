var laAgendicaServices = angular.module('starter.services', ['ngResource']);

laAgendicaServices.factory('ApiSemanaSanta', function($resource) {
  return $resource('semana-santa-2015.json');
});