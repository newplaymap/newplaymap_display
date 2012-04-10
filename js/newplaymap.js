// Establish namespaces.
var newPlayMap = {};
var jsonData = {};
var panelMarkup = {};
var spotlight = {};
var 
    markers,
    routing,
    locationsByID = {};

// Estalbish namespace for map.
var mm = com.modestmaps;
var map;
var loaded = 0;

window.onload = function() {
  //@TODO load once?
  // Change basic layout of page.
  newPlayMap.alterHomepage();
    
  newPlayMap.loadPageRouter();

  // Load the map after all the data is loaded and available.
  newPlayMap.loadData();
    
  newPlayMap.loadMap()
};

newPlayMap.alterHomepage = function() {
  $('div#panel-container div#panel').hide();
};

newPlayMap.loadPageRouter = function() {

};

newPlayMap.loadData = function() {
  newPlayMap.loadJSONFile({path: 'data/organizations_300.json'});
  newPlayMap.loadJSONFile({path: 'data/events_300.json'});
  newPlayMap.loadJSONFile({path: "data/artists_300.json"});
  newPlayMap.loadJSONFile({path: "data/related_events.json"});

  return false;
};

newPlayMap.loadMap = function(){
  // Load map tiles.
  newPlayMap.loadWax();
};

newPlayMap.loadWax = function() {
  // Syntax example. Seeing if Wax works.
  var url = 'http://a.tiles.mapbox.com/v3/newplaymap.map-m3r2xeuk.jsonp';
  wax.tilejson(url, function(tj) {newPlayMap.initMap(tj)});
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

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);
/*   map.setCenterZoom(new com.modestmaps.Location(30, -90), 4); */

  // Load map marker layers.
  newPlayMap.loadMapLayers();

  newPlayMap.mapCustomizations(map, markers);  
};


newPlayMap.loadMapLayers = function() {
  markers = new MM.MarkerLayer();
  map.addLayer(markers);
 
 
 if(jsonData.events !== undefined) {
    // Load Event Markers
    var eventMarkerData = {
      type: "event",
      id: "event_id",
      label: "related_theater", // field which will be used in label
      title: "play_title",
      dataName: "events",
      dataPath: "data/events_300.json",
      icon: "icons/event.png"
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
  };
  newPlayMap.onLoadDataMarkers(organizationMarkerData);
  }

 if(jsonData.artists !== undefined) {
  // Load Artist Markers
  var artistMarkerData = {
    type: "artist",
    id: "artist_id",
    label: "ensemble_collective",
    title: "artist_name",
    dataName: "artists",
    dataPath: "data/artists_300.json",
    icon: "icons/artist.png",
  };
  newPlayMap.onLoadDataMarkers(artistMarkerData);
  }

  // We treat related event as it's own separate type so there are no conflicts with identical events.
  // This information will be on its own special layer, and cross linking identical markers is too complex for what we are doing right now.
 if(jsonData.related_events !== undefined) {  
  // Load Related Play Markers
  var relatedEventMarkerData = {
    type: "related_event",
    id: "related_event_id",
    label: "related_theater",
    title: "play_title",
    dataName: "related_events",
    dataPath: "data/related_events.json",
    icon: "icons/play.png",
    grouping_field: "related_play_id"
  };
  newPlayMap.onLoadDataMarkers(relatedEventMarkerData);
  }
};
