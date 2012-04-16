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
var markers = {};
newPlayMap.routing = {};
newPlayMap.routing.route = {};
newPlayMap.browserEvents = [];

newPlayMap.status = {
  pageAltered: false,
  routerPathLoaded: false,
  routerRouteLoaded: false,
  dataLoaded: false,
  mapLoaded: false,
  markersLoaded: {},
};

window.onload = function() {
  newPlayMap.alterHomepage();   // Change basic layout of page.
  newPlayMap.loadPageRouter();  // Read address and store parsed address in an object.
  newPlayMap.loadData();        // Load up Data via JSON.
  newPlayMap.loadMap();         // Load map tiles.
  newPlayMap.testMapAndDataLoaded(newPlayMap.loadMapDataMarkers);     // Load and insert map markers.
  newPlayMap.testEverythingLoaded(newPlayMap.loadInteractivity);
};

newPlayMap.loadInteractivity = function() {
  newPlayMap.loadRouteInfo();     // Load route info (lookup route, get features).  
  newPlayMap.loadBehaviors() ;  // Load marker actions and events.
};

newPlayMap.alterHomepage = function() {
  $('div#panel-container div#panel').hide();
  newPlayMap.status.pageAltered = true;
  
  return false;
};

newPlayMap.loadPageRouter = function() {
    // Make sure data is loaded.
    newPlayMap.buildRoutePath();
    // Loading data on complete will load the lookup Route function.

    // bind address to all a links.
    $('a').address();

  // Address always loads on every page interaction.
  $.address.change(function(event) {
    console.log(event);
    // Reset status check variables. 
    newPlayMap.status.routerPathLoaded = false;
    newPlayMap.status.routerRouteLoaded = false;

    newPlayMap.browserEvents.push(event);
    
    // Make sure data is loaded.
    newPlayMap.buildRoutePath(event);
    newPlayMap.testPathLoaded(newPlayMap.lookupRoute);
    newPlayMap.testEverythingLoaded(newPlayMap.loadInteractivity);

    // bind address to all new links.
    $('a').address();
    console.log( newPlayMap.browserEvents);
    return false;
  });


  return false;
};

newPlayMap.loadData = function() {
  newPlayMap.loadJSONFile({path: 'data/organizations_300.json'});
  newPlayMap.loadJSONFile({path: 'data/events_300.json'});
  newPlayMap.loadJSONFile({path: "data/artists_300.json"});
  newPlayMap.loadJSONFile({path: "data/plays/9344.json"});
  newPlayMap.testDataLoaded(newPlayMap.status.dataLoaded = true);
  return false;
};

newPlayMap.loadMap = function(){
  // Load map tiles.
  newPlayMap.loadWax();
  console.log("map");
  // for map debugging: newPlayMap.initMapSimple();
};

newPlayMap.loadRouteInfo = function() {
  newPlayMap.lookupRoute();
};

newPlayMap.loadBehaviors = function() {
  // Load functions / trigger behaviors.
  newPlayMap.loadFeatureAction();
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

  if(markers !== undefined) {
    newPlayMap.status.mapLoaded = true;
  }
};

// Wait until Map is loaded
newPlayMap.testMapLoaded = function(callback) {

  (function waitMap() {
    if (map !== undefined && markers !== undefined) {
      console.log("Map & Marker Layer is loaded");
      $(callback);
    } else {
      console.log("waiting for map");
        setTimeout( waitMap, 100 );
    }
  })();
};

newPlayMap.testMarkersLoaded = function(callback) {

  (function waitMarkers() {
    if (markers !== undefined) {
      console.log("Markers are loaded");
      $(callback);
    } else {
      console.log("waiting for markers");
        setTimeout( waitMarkers, 100 );
    }
  })();
};


// Wait until Data is loaded
newPlayMap.testDataLoaded = function(callback) {
  (function waitData() {
    if (Object.keys(jsonData).length >= 4) {
      console.log("All data is loaded");
      $(callback);
    } else {
      console.log("waiting");
        setTimeout( waitData, 100 );
    }
  })();
};

// Wait until Path is loaded (which might depend on data)
newPlayMap.testPathLoaded = function(callback) {
  (function waitPath() {
    if (newPlayMap.status.routerPathLoaded !== false) {
      console.log("Path is loaded.");
      $(callback);
    } else {
      console.log("Waiting for path to load");
      setTimeout( waitPath, 100 );
    }
  })();
};

// Wait until Route is loaded (which might depend on data)
newPlayMap.testRouteLoaded = function(callback) {
  (function waitRoute() {
    if (newPlayMap.status.routerRouteLoaded !== false) {
      console.log("Routes are loaded.");
      $(callback);
    } else {
      console.log("Waiting for routes");
      setTimeout( waitRoute, 100 );
    }
  })();
};

// Wait until Route is loaded (which might depend on data)
newPlayMap.testMapAndDataLoaded = function(callback) {
  (function waitMapData() {
    if (newPlayMap.status.dataLoaded === true && newPlayMap.status.mapLoaded === true ) {
      console.log("Map & Data is loaded.");
      $(callback);
    } else {
      console.log("Waiting for map and data everything to load.");
      setTimeout( waitMapData, 100 );
    }
  })();
};


// Wait until Route is loaded (which might depend on data)
newPlayMap.testEverythingLoaded = function(callback) {
  (function waitEverything() {
    if (newPlayMap.status.routerPathLoaded === true && newPlayMap.status.routerRouteLoaded === true && newPlayMap.status.dataLoaded === true 
      && newPlayMap.status.mapLoaded === true) {
      
      // test each marker layer is loaded
      /// hackish but should work
     if (newPlayMap.status.markersLoaded.artist === true 
      && newPlayMap.status.markersLoaded.event === true
      && newPlayMap.status.markersLoaded.organization === true 
      && newPlayMap.status.markersLoaded.play === true 
      ) {
      
      console.log("Everything is loaded.");
      $(callback);
      }
    } else {
      console.log("Waiting for everything to load.");
      setTimeout( waitEverything, 1000 );
    }
  })();
};


newPlayMap.loadMapDataMarkers = function() {

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
    newPlayMap.onLoadDataMarkers(eventMarkerData);
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
  newPlayMap.onLoadDataMarkers(organizationMarkerData);
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
    newPlayMap.onLoadDataMarkers(artistMarkerData);
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
  console.log("in play");
  newPlayMap.onLoadDataMarkers(relatedEventMarkerData);
  }
};
