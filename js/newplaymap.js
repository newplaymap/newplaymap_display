// Establish namespaces.
var newPlayMap = {};
var jsonData = {};
var panelMarkup = {};
var spotlight = {};
var locationsByID = {};
var mm = com.modestmaps;
var map = map || {};
var loaded = 0;
/* var markers = {}; */
newPlayMap.routing = {};
newPlayMap.routing.route = {};
newPlayMap.browserEvents = [];

window.onload = function() {
  newPlayMap.alterHomepage();   // Change basic layout of page.
  
  // These three functions should be able to load independently.
  // newPlayMap.loadPageRouter();  // Read address and store parsed address in an object.
  newPlayMap.loadMap();         // Load map tiles.
/*   newPlayMap.loadMapDataMarkers(); */
  // newPlayMap.loadRouteInfo();     // Load route info (lookup route, get features).  
  // newPlayMap.loadBehaviors() ;  // Load marker actions and events.
};



newPlayMap.loadMap = function(callback){
  // Load map tiles.
  // newPlayMap.loadWax();
  // for map debugging: 
  newPlayMap.initMapSimple();
};


newPlayMap.alterHomepage = function() {
  $('div#panel-container div#panel').hide();
  return false;
};

newPlayMap.loadPageRouter = function() { 
  // Listen for address.
  $.address.change(function(event) {
    newPlayMap.browserEvents.push(event);

    // Do all of the map and data contingent functions only through this function (to make it simpler.)
    newPlayMap.buildRoutePath(event);
    newPlayMap.loadRouteInfo();     // Load route info (lookup route, get features).  
    newPlayMap.loadBehaviors() ;  // Load marker actions and events.
    return false;
  });

  // bind address to all a links (@TODO may also need divs)
  $('a').address();

  // Force address to update on page load.
  // Note: there are multiple conditions to test:
  // -- refresh,reload + home, play+event_id,play, and the page loading, and clicking first time, and subsequent clicks.
  $.address.update();
};

/*
newPlayMap.loadRouteInfo = function() {
  newPlayMap.lookupRoute();
};
*/

/*
newPlayMap.loadBehaviors = function() {
  // Load functions / trigger behaviors.
  newPlayMap.loadFeatureAction();
};
*/

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

  map.setCenterZoom(new MM.Location(28.811530, -122.2666097), 4);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);

  // Load map marker layers.
  newPlayMap.loadMapLayers();
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
  map.setCenterZoom(new MM.Location(37.811530, -122.2666097), 4);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);

  // Load map marker layers.
  var data = newPlayMap.loadMapData();

  // Run data layers closure.
  data();
};

newPlayMap.loadMapData = function() {
  return function () {
    newPlayMap.loadData();
  }
};


newPlayMap.loadData = function() {
    newPlayMap.loadJSONFile({
      path: 'data/organizations_300.json',
      type: "organization",
      template: "organization",
      label: "org_type",
      layer: "layer-organizations",
      id: "organization_id",
      title: "name",
      dataName: "organizations",
      dataPath: "data/organizations_300.json",
      icon: "icons/organization.png",
      grouping_field: "organization_id",
      callback: newPlayMap.loadOrganization 
    });
    newPlayMap.loadJSONFile({
      path: "data/artists_300.json",
      type: "artist",
      template: "artist",
      layer: "layer-artists",
      id: "artist_id",
      label: "ensemble_collective",
      title: "generative_artist",
      dataName: "artists",
      dataPath: "data/artists_300.json",
      icon: "icons/artist.png",
      grouping_field: "artist_id",
      callback: newPlayMap.loadArtist
    }
  );
  newPlayMap.loadJSONFile({
        path: 'data/events_300.json', 
        type: "event",
        template: "event",
        layer: "layer-events",
        id: "event_id",
        label: "related_theater", // field which will be used in label
        title: "play_title",
        dataName: "events",
        dataPath: "data/events_300.json",
        icon: "icons/event.png",
        grouping_field: "event_id",
        callback: newPlayMap.loadEvent
      }
    );
  newPlayMap.loadJSONFile({
      path: "data/plays/9344.json",
      type: "play",
      template: "layer-play",
      layer: "play",
      id: "related_event_id",
      label: "related_theater",
      alt_path: "play_path",
      title: "play_title",
      dataName: "play", // @todo will change to be more dynamic hard coding for testing. play data is included in json ###prob needs play path###
      dataPath: "data/plays/9344.json",
      icon: "icons/play.png",
      grouping_field: "related_play_id",
      callback: newPlayMap.loadRelatedEvents
    }
  );
};

