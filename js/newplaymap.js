// Establish namespaces.
var newPlayMap = {};
var jsonData = {};

var panelMarkup,
    markers,
    spotlight,
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
  
    newPlayMap.loadData();
    
    newPlayMap.loadMap();

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

  console.log(jsonData);
  return false;
};

newPlayMap.loadMap = function(){
  // Load map tiles.
  newPlayMap.loadWax();
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
 
/*
  newPlayMap.loadEventMarkers();
  newPlayMap.loadArtistMarkers();
  newPlayMap.loadOrganizationMarkers();
*/

  // Load Event Markers
  var eventMarkerData = {
    id: "related_play_id",
    title: "play_title",
    dataName: "events_300.json",
    dataPath: "data/events_300.json",
    icon: "icons/event.png"
    //  embedData : [{"key": "event_id", "value": feature.properties["event_id"]] 
  };
  newPlayMap.onLoadDataMarkers(eventMarkerData);

  // Load Organization Markers
  var organizationMarkerData = {
    id: "organization_id",
    title: "name",
    dataName: "organizations_300.json",
    dataPath: "data/organizations_300.json",
    icon: "icons/organization.png"
    //  embedData : [{"key": "event_id", "value": feature.properties["event_id"]] 
  };
  newPlayMap.onLoadDataMarkers(organizationMarkerData);

  // Load Artist Markers
  var artistMarkerData = {
    id: "artist_id",
    title: "name",
    dataName: "artists_300.json",
    dataPath: "data/artists_300.json",
    icon: "icons/artist.png"
    //  embedData : [{"key": "event_id", "value": feature.properties["event_id"]] 
  };
  newPlayMap.onLoadDataMarkers(artistMarkerData);

  // Load Related Play Markers
/*
  var organizationMarkerData = {
    id: "organization_id",
    title: "name",
    dataName: "organizations_300.json",
    dataPath: "data/organizations_300.json",
    icon: "icons/organization.png"
    //  embedData : [{"key": "event_id", "value": feature.properties["event_id"]] 
  };
  newPlayMap.onLoadDataMarkers(organizationMarkerData);
*/
};
