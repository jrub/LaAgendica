var laAgendicaServices = angular.module('laAgendica.services', ['ngResource']);

laAgendicaServices.factory('SharingService', function() {
  var shareFunction = function(message, url) {
    if (window.plugins && window.plugins.socialsharing) {
      //Using Cordova
      window.plugins.socialsharing.share(message, null, null, url);
    } else {
      //In web browser, share on Twitter
      window.open("https://twitter.com/intent/tweet?text=Echa un vistazo a este evento que encontré en @LaAgendica " + url + "&hashtags=Zaragoza,LaAgendica")
    }
  };

  return shareFunction;
});

laAgendicaServices.factory('MapNavigationService', function() {
  var navigate = function(lat, lng) {
    // abre gmaps en browser si WebApp, mapas nativos si App
    if (!window.cordova) {
      window.open( "https://maps.google.com/?saddr=Current%20Location&daddr=" + lat + "," + lng , '_system', 'location=yes' );
    } else {
      launchnavigator.navigate(
        [lat, lng],
        null,
        function(){
            console.log("Navigator Plugin success");
        },
        function(error){
            console.log("Navigator Plugin error: "+ error);
        }
      );
    }
  };

  return navigate;
});

laAgendicaServices.factory('InAppBrowserService', function() {
  var abrir = function(uri) {
    if (uri === undefined) {
      alert("Disculpe, detalle no disponible");
      return ;
    }
    window.open(encodeURI(uri), '_system', 'location=yes' );
  };
  return abrir;
});

laAgendicaServices.factory('ApiSemanaSanta', function($resource) {
  return $resource('semana-santa-2015.json');
});

laAgendicaServices.factory('ApiSparql', function($resource) {
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
  } LIMIT 50";

  return $resource(SPARQL_ENDPOINT + '?query=' + encodeURIComponent(destacadosSPARQL) + '&format=application%2Fsparql-results%2Bjson&timeout=0');
});

laAgendicaServices.factory('ApiPilares', function ($resource) {
    return { 
        fn: function(dateStr) { 

            var SPARQL_ENDPOINT = 'http://datos.zaragoza.es/sparql';
            var query = "SELECT DISTINCT *\
              WHERE {\
                ?uri a s:Event;\
                dcterms:identifier ?id;\
                rdfs:label ?title;\
                rdfs:comment ?description.\
                OPTIONAL {?uri s:subEvent ?subEvent.}\
                OPTIONAL {?subEvent s:startDate ?startDate.}\
                OPTIONAL {?subEvent s:endDate ?endDate.}\
                OPTIONAL {?subEvent s:startTime ?startTime.}\
                OPTIONAL {?subEvent s:endTime ?endTime.}\
                OPTIONAL {?subEvent s:openingHours ?horario.}\
                OPTIONAL {?uri s:price ?precio.}\
                OPTIONAL{ ?uri s:image ?image}.\
                OPTIONAL {?uri geo:geometry ?geo.\
                ?geo geo:lat ?latitud.\
                ?geo geo:long ?longitud.}\
                ?uri <http://vocab.linkeddata.es/datosabiertos/def/cultura-ocio/agenda#programa> ?programa.\
                FILTER (REGEX(STR(?programa), 'Fiestas del Pilar', 'i'))\
                FILTER (xsd:date(?startDate) <= '"+ dateStr +"'^^xsd:date and xsd:date(?endDate) >= '"+ dateStr +"'^^xsd:date)\
              }";
            return $resource(SPARQL_ENDPOINT + '?query=' + encodeURIComponent(query) + '&format=application%2Fsparql-results%2Bjson&timeout=0')
        }
    };
});

laAgendicaServices.factory('ApiHoy', function ($resource) {
    return {
      fn: function() {
        var SPARQL_ENDPOINT = 'http://datos.zaragoza.es/sparql';
        // indentado a la izq para evitar docenas de "%20" en la request
        var query = "SELECT DISTINCT *\
WHERE {\
?uri a s:Event;\
dcterms:identifier ?id;\
rdfs:label ?title;\
rdfs:comment ?description.\
OPTIONAL {?uri s:subEvent ?subEvent.}\
OPTIONAL {?subEvent s:startDate ?startDate.}\
OPTIONAL {?subEvent s:endDate ?endDate.}\
OPTIONAL {?subEvent s:startTime ?startTime.}\
OPTIONAL {?subEvent s:endTime ?endTime.}\
OPTIONAL {?subEvent s:openingHours ?horario.}\
OPTIONAL {?uri s:price ?precio.}\
OPTIONAL{ ?uri s:image ?image}.\
OPTIONAL {?uri geo:geometry ?geo.\
?geo geo:lat ?latitud.\
?geo geo:long ?longitud.}\
?uri <http://vocab.linkeddata.es/datosabiertos/def/cultura-ocio/agenda#diasParaTerminar> ?diasParaTerminar.\
FILTER (?diasParaTerminar='1').\
}";
            return $resource(SPARQL_ENDPOINT + '?query=' + encodeURIComponent(query) + '&format=application%2Fsparql-results%2Bjson&timeout=0')
        }
    };
});