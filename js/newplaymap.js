// Establish namespaces.
var newPlayMap = {};
var jsonData = {};
var panelMarkup = {};
var spotlight = {};
var locationsByID = {};
var mm = com.modestmaps;
var map = map || {};
var loaded = 0;
var markers = {};
newPlayMap.routing = {};
newPlayMap.routing.route = {};
newPlayMap.browserEvents = [];

var po = org.polymaps;
var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 45, lon: -90.228})
    .zoom(3)
    .zoomRange([2, 7])
    .add(po.interact());


map.add(po.compass()
    .pan("none"));

  map.add(po.image()
      .url(po.url("http://{S}tile.cloudmade.com"
      + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
      + "/20760/256/{Z}/{X}/{Y}.png")
      .hosts(["a.", "b.", "c.", ""])));

 var events = {
        path: 'api/events.php', 
        type: "event",
        template: "event",
        layer: "layer-events",
        id: "event_id",
        label: "related_theater", // field which will be used in label
        title: "play_title",
        dataName: "events",
        dataPath: 'api/events.php', 
        icon: "icons/event.png",
        grouping_field: "event_id",
        related_play_id: "related_play_id",
        //callback: newPlayMap.loadEvent
      };

/*
map.add(po.geoJson()
    .url('api/organizations.php?page_items=300')
    .on("load", load)
    .clip(false)
    .zoom(3)
    .id("organizations"));

map.add(po.geoJson()
    .url('api/artists.php?page_items=300')
    .on("load", load)
    .clip(false)
    .zoom(3)
    .id("artists"));
*/



map.add(po.geoJson()
    .url('api/clusters.php?page_items=100')
    .on("load", load)
    .clip(false)
    .zoom(3)
    .id("clusters"));


function load(e) {

  var cluster = e.tile.cluster || (e.tile.cluster = kmeans()
      .iterations(16)
      .size(40));

  for (var i = 0; i < e.features.length; i++) {
    cluster.add(e.features[i].data.geometry.coordinates);
  }

  var tile = e.tile;
  var g = tile.element;
  console.log(g);
  while (g.lastChild) g.removeChild(g.lastChild);

  var means = cluster.means();

  means.sort(function(a, b) { return b.size - a.size; });



  for (var i = 0; i < means.length; i++) {
    var mean = means[i];

    var mean = means[i], point = g.appendChild(po.svg("circle"));
    point.setAttribute("cx", mean.x);
    point.setAttribute("cy", mean.y);
    point.setAttribute("r", Math.pow(2, tile.zoom - 11) * Math.sqrt(mean.size) * 1000);
  }

  };



window.onload = function() {
  newPlayMap.alterHomepage();   // Change basic layout of page.
  //newPlayMap.loadMap();         // Load map tiles & trigger data to load.
  //newPlayMap.processFilters();  // Add interaction to filters in sidebar panel

 /*  newPlayMap.cluster(); */
};









newPlayMap.loadMap = function(callback){
  // Load map tiles.
  //newPlayMap.loadWax();
  // for map debugging: 
  newPlayMap.initMapSimple();
};

newPlayMap.alterHomepage = function() {
  $('div#panel-container div#panel div.content').hide();
  return false;
};

newPlayMap.loadPageRouter = function() { 
  // Listen for address.
  $.address.change(function(event) {
    newPlayMap.browserEvents.push(event);

    // Do all of the map and data contingent functions only through this function (to make it simpler.)
    newPlayMap.buildRoutePath(event);
    //newPlayMap.loadRouteInfo();     // Load route info (lookup route, get features).  
    //newPlayMap.loadBehaviors() ;  // Load marker actions and events.
    return false;
  });

  // bind address to all a links (@TODO may also need divs)
  $('a').address();

  // Force address to update on page load.
  // Note: there are multiple conditions to test:
  // -- refresh,reload + home, play+event_id,play, and the page loading, and clicking first time, and subsequent clicks.
  $.address.update();
};

newPlayMap.loadWax = function() {
  // Custom tiles
  var url = 'http://a.tiles.mapbox.com/v3/newplaymap.map-m3r2xeuk.jsonp' + '?cache=' + Math.floor(Math.random()*11);

  wax.tilejson(url, function(tj) {
    newPlayMap.initMap(tj);
    }
  );
};

// Wax calls this and the map variable is relevant to what Wax loads
newPlayMap.initMap = function(tj) {
  map = new com.modestmaps.Map('map',
    new wax.mm.connector(tj), null, [
        new easey.DragHandler(),
        new easey.TouchHandler(),
        new easey.DoubleClickHandler(),
        new easey.MouseWheelHandler()
    ]);
  var zoomer = wax.mm.zoomer(map)
  zoomer.appendTo('map');
  
  //map.setCenterZoom(new MM.Location(37.811530, -110.2666097), 3);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);


  markers = new MM.MarkerLayer();
  map.addLayer(markers);
  markers.parent.setAttribute("id", "markers");

  // Load map marker layers.
  var data = newPlayMap.loadMapData();

  // Run data layers closure.
  data();
};

newPlayMap.initMapSimple = function() {
  map = new MM.Map('map', new MM.TemplatedLayer("http://tile.openstreetmap.org/{Z}/{X}/{Y}.png")/*
, null, [
        new easey.DragHandler(),
        new easey.TouchHandler(),
        new easey.DoubleClickHandler(),
        new easey.MouseWheelHandler()
    ]
*/);
  var zoomer = wax.mm.zoomer(map)
  zoomer.appendTo('map');

  map.setCenterZoom(new MM.Location(50.811530, -90.2666097), 3);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);


  markers = new MM.MarkerLayer();
  map.addLayer(markers);
  markers.parent.setAttribute("id", "markers");

  // Load map marker layers.
  var data = newPlayMap.loadMapData();

  // Run data layers closure.
  data();

newPlayMap.mapCustomizations();
};

newPlayMap.loadMapData = function() {
  return function () {
    newPlayMap.loadData();
  }
};

newPlayMap.processFilters = function() {
  newPlayMap.filters.setupFilters();

  $('#filter-container h4').css('cursor', 'pointer').click(function() {
    $(this).siblings('form').slideToggle();
  });
  

};

newPlayMap.loadData = function() {
    newPlayMap.loadJSONFile({
      path: 'api/organizations.php',
      type: "organization",
      template: "organization",
      label: "org_type",
      layer: "layer-organizations",
      id: "organization_id",
      title: "name",
      dataName: "organizations",
      dataPath: 'api/organizations.php',
      icon: "icons/organization.png",
      grouping_field: "organization_id",
      callback: newPlayMap.loadOrganization 
    });
    newPlayMap.loadJSONFile({
      path: 'api/artists.php',
      type: "artist",
      template: "artist",
      layer: "layer-artists",
      id: "artist_id",
      label: "ensemble_collective",
      title: "generative_artist",
      dataName: "artists",
      dataPath: 'api/artists.php',
      icon: "icons/artist.png",
      grouping_field: "artist_id",
      callback: newPlayMap.loadArtist
    }
  );
  newPlayMap.loadJSONFile({
        path: 'api/events.php', 
        type: "event",
        template: "event",
        layer: "layer-events",
        id: "event_id",
        label: "related_theater", // field which will be used in label
        title: "play_title",
        dataName: "events",
        dataPath: 'api/events.php', 
        icon: "icons/event.png",
        grouping_field: "event_id",
        related_play_id: "related_play_id",
        callback: newPlayMap.loadEvent
      }
    );
};
