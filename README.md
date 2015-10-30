App desarrollada en [Ionic](http://ionicframework.com/) para la consulta y descubrimiento de eventos en la ciudad de Zaragoza, basándose en los datos liberados por el Ayuntamiento de Zaragoza. Inicialmente desarrollada durante el hackaton ZgzAppStore (21-22 de marzo, en el edificio Etopia, Zaragoza).

- Desplegada en github-pages como WebApp: www.LaAgendica.com
- Link Google Play: https://play.google.com/store/apps/details?id=com.slothdevs.laagendica
- Link Apple Store: https://itunes.apple.com/es/app/laagendica-agenda-cultural/id1046044148

La Agendica es un proyecto sin ánimo de lucro. Si te resulta útil, puedes apoyarnos dejando un review positivo en Google Play/App Store. ¡Gracias!

## Descripción de funcionalidades

- Muestra los eventos que suceden Hoy en Zaragoza, ordenados por hora del día (sección "Qué hacer hoy" del menú lateral).
- Muestra los eventos de la siguiente semana, clasificados por categorías en el menú lateral (las categorías actuales son: exposiciones y museos, tecnología, teatro, infantil, - música, gastronomía, danzas y bailes, medio ambiente y deportes)
- Muestra todos los eventos de los Pilares 2015 (desactivado tras los Pilares), clasificados por día, y ordenados por hora del día (la cual además se muestra en la lista).
- Muestra los eventos destacados marcados como tal por el Ayuntamiento (sección "Destacados"), ordenados por fecha, hasta los que empiezan dentro de diez días.
- En los detalles de un evento, muestra las fechas, descripción, horario y precio (si los hubiera), así como la imagen asignada al evento (si existe), y permite realizar 4 acciones:
  - Guardar un evento como *Favorito*. Los eventos favoritos se pueden consultar en una sección específica en el menú lateral.
  - *Compartir* en redes sociales. Utiliza los menús nativos de iOS y Android, por lo que permite compartir en cualquier red social o App que tenga instalada el usuario en su dispositivo, por ejemplo Whatsapp, Telegram, Twitter, Facebook... * En el caso de la WebApp, esta funcionalidad de compartir está limitada a compartir en Twitter (por ahora).
  - Abrir la *web original* del evento en la web oficial del ayuntamiento.
  - Si los datos proporcionados por el Ayuntamiento incluyen la geolocalización del evento, permite mostrar la *ruta* para ir andando, en coche, o en transporte público, desde la - geolocalización actual del dispositivo hasta el lugar donde ocurre el evento, usando  la App nativa de mapas del dispositivo (como Google Maps y Apple Maps).  * En el caso de la WebApp, la ruta se muestra en el navegador web del dispositivo, mediante Google Maps.
- Muestra la lista de eventos favoritos.
- Muestra un mapa de favoritos, con la geolocalización de todos los eventos marcados como favorito. Si lo desea, el usuario puede clicar el evento en el mapa, yendo así a su - pantalla de detalle, donde puede solicitar la ruta para ir andando, en coche, o en transporte público, hasta el lugar del evento.

## Fuentes de Datos

Utiliza las APIs Open Data del Ayuntamiento de Zaragoza, en concreto:

- endpoint SPARQL: http://datos.zaragoza.es/sparql contra el vocabulario http://vocab.linkeddata.es/datosabiertos/def/cultura-ocio/agenda#
- endpoint SOLR: http://www.zaragoza.es/buscador/select , también contra el dataset de eventos de la ciudad

** La exactitud de los datos depende del Ayuntamiento, para consultas relativas a ellos contactar con <a href="mailto:webmunicipal@zaragoza.es">webmunicipal@zaragoza.es</a> o bien el teléfono 010. Para cualquier otra consulta o propuesta sobre la aplicación, puede escribir a <a href="mailto:info@laagendica.com">info@laAgendica.com</a>.

## Equipo:
- Héctor Rodríguez https://twitter.com/torhector2
- Javier Rubio https://twitter.com/jrubr

** Logo diseñado por [Fernándo Sánchez](http://www.conmisojos.com)

Para comentar noticias relacionadas con la App (y quizás eventos interesantes en Zaragoza), usamos esta cuenta de Twitter: https://twitter.com/laAgendica Además tenemos un vídeo promocional:

[![LaAgendica video promo](http://img.youtube.com/vi/ns5yrGtIQEk/0.jpg)](https://www.youtube.com/watch?v=ns5yrGtIQEk)
