// Establish namespaces.
var newPlayMap = {};
var jsonData = {};
var panelMarkup = {};
var spotlight = {};
var locationsByID = {};
// Estalbish namespace for map.
var mm = com.modestmaps;
var map = map || {};
var loaded = 0;
var markers;
newPlayMap.routing = {};
newPlayMap.routing.route = {};

window.onload = function() {
  newPlayMap.alterHomepage();   // Change basic layout of page.
  newPlayMap.loadPageRouter();  // Read address and store parsed address in an object.
  newPlayMap.loadData();        // Load up Data via JSON.
  newPlayMap.loadMap();         // Load map tiles.
  newPlayMap.loadMarkers();     // Load and insert map markers.
  newPlayMap.loadRouteInfo();   // Load route object.
  // newPlayMap.loadBehaviors();   // Load marker actions and events.
};

newPlayMap.alterHomepage = function() {
  $('div#panel-container div#panel').hide();
};

newPlayMap.loadPageRouter = function() {
  newPlayMap.buildRoutePath();

  // Address always loads on every page interaction.
/*
  $.address.change(function(event) {

    // Make sure data is loaded.
    // newPlayMap.loadAction(event);
    
    return false;
  });
*/

  // bind address to all a links.
//  $('a').address();
};

newPlayMap.loadData = function() {
  newPlayMap.loadJSONFile({path: 'data/organizations_300.json'});
  newPlayMap.loadJSONFile({path: 'data/events_300.json'});
  newPlayMap.loadJSONFile({path: "data/artists_300.json"});
  newPlayMap.loadJSONFile({path: "data/plays/9344.json"});

  return false;
};

newPlayMap.loadMap = function(){
  // Load map tiles.
  newPlayMap.loadWax();
  console.log("map");
  //newPlayMap.initMapSimple();
};

newPlayMap.loadMarkers = function() {
  newPlayMap.testDataLoaded(newPlayMap.testMapLoaded(newPlayMap.loadMapData));
};

newPlayMap.loadRouteInfo = function() {
  newPlayMap.testDataLoaded(newPlayMap.lookupRoute);
};

newPlayMap.loadBehaviors = function() {
  // Load functions / trigger behaviors.
//  newPlayMap.testDataLoaded(newPlayMap.testRouteLoaded(newPlayMap.testMapLoaded(newPlayMap.loadFeatureAction)));
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

  map.setCenterZoom(new MM.Location(28.811530, -122.2666097), 4);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);

  // Load map marker layers.
  newPlayMap.loadMapLayers();
};

newPlayMap.initMapSimple = function() {

  map = new MM.Map('map', new MM.TemplatedLayer("http://tile.openstreetmap.org/{Z}/{X}/{Y}.png"))
  map.setCenterZoom(new MM.Location(37.811530, -122.2666097), 4);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);

  // Load map marker layers.
  newPlayMap.loadMapLayers();
};

newPlayMap.loadMapLayers = function() {
  markers = new MM.MarkerLayer();
  map.addLayer(markers);
};

// Wait until Map is loaded
newPlayMap.testMapLoaded = function(callback) {

  (function wait() {
    if (map !== undefined) {
      console.log("Map is loaded");
      $(callback);
    } else {
      console.log("waiting for map");
        setTimeout( wait, 100 );
    }
  })();
};

newPlayMap.testMarkersLoaded = function(callback) {

  (function wait() {
    if (markers !== undefined) {
      console.log("Markers are loaded");
      $(callback);
    } else {
      console.log("waiting for markers");
        setTimeout( wait, 100 );
    }
  })();
};


// Wait until Data is loaded
newPlayMap.testDataLoaded = function(callback) {
  (function wait() {
    if (Object.keys(jsonData).length >= 4) {
      console.log("All data is loaded");
      $(callback);
    } else {
      console.log("waiting");
        setTimeout( wait, 100 );
    }
  })();
};

// Wait until Route is loaded (which might depend on data)
newPlayMap.testRouteLoaded = function(callback) {
  (function wait() {
    if (newPlayMap.routing.route.callback !== undefined && newPlayMap.routing.route.feature !== undefined) {
      console.log("Route is loaded.");
      $(callback);
    } else {
      console.log("Waiting for route");
      setTimeout( wait, 1000 );
    }
  })();
};

newPlayMap.loadMapData = function() {
 if(jsonData.events !== undefined) {
    // Load Event Markers
    var eventMarkerData = {
      type: "event",
      id: "event_id",
      label: "related_theater", // field which will be used in label
      title: "play_title",
      dataName: "events",
      dataPath: "data/events_300.json",
      icon: "icons/event.png",
      grouping_field: "event_id",
      path: ""
    };
    newPlayMap.testMapLoaded(newPlayMap.testMarkersLoaded(newPlayMap.onLoadDataMarkers(eventMarkerData)));
  }

 if(jsonData.organizations !== undefined) {
  // Load Organization Markers
  var organizationMarkerData = {
    type: "organization",
    label: "org_type",
    id: "organization_id",
    title: "name",
    dataName: "organizations",
    dataPath: "data/organizations_300.json",
    icon: "icons/organization.png",
    grouping_field: "organization_id"
  };
  newPlayMap.testMapLoaded(newPlayMap.testMarkersLoaded(newPlayMap.onLoadDataMarkers(organizationMarkerData)));
  }

 if(jsonData.artists !== undefined) {
  // Load Artist Markers
  var artistMarkerData = {
    type: "artist",
    id: "artist_id",
    label: "ensemble_collective",
    title: "generative_artist",
    dataName: "artists",
    dataPath: "data/artists_300.json",
    icon: "icons/artist.png",
    grouping_field: "artist_id"
  };
  newPlayMap.testMapLoaded(newPlayMap.testMarkersLoaded(newPlayMap.onLoadDataMarkers(artistMarkerData)));
  }

  // We treat related event as it's own separate type so there are no conflicts with identical events.
  // This information will be on its own special layer, and cross linking identical markers is too complex for what we are doing right now.
 if(jsonData.play !== undefined) {  
  // Load Related Play Markers
  var relatedEventMarkerData = {
    type: "play",
    id: "related_event_id",
    label: "related_theater",
    title: "play_title",
    dataName: "play", // @todo will change to be more dynamic hard coding for testing. play data is included in json ###prob needs play path###
    dataPath: "data/plays/9344.json",
    icon: "icons/play.png",
    grouping_field: "related_play_id"
  };
  newPlayMap.testMapLoaded(newPlayMap.testMarkersLoaded(newPlayMap.onLoadDataMarkers(relatedEventMarkerData)));
  }
};
