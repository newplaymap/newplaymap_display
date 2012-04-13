// Establish namespaces.
var newPlayMap = {};
var jsonData = {};
var panelMarkup = {};
var spotlight = {};
var markers,
    locationsByID = {};

// Estalbish namespace for map.
var mm = com.modestmaps;
var map = map || {};
var loaded = 0;

window.onload = function() {
  //@TODO load once?
  // Change basic layout of page.
  newPlayMap.alterHomepage();

  // @TODO: loadPageRouter needs jsonData set up which doesn't happen until loadData().
  //        Changing order of functions doesn't help. Probably waiting for json files to load.
  newPlayMap.loadPageRouter();

  // Load the map after all the data is loaded and available.
  newPlayMap.loadData();

  newPlayMap.loadMap();
};

newPlayMap.alterHomepage = function() {
  $('div#panel-container div#panel').hide();
};

newPlayMap.loadPageRouter = function() {
  newPlayMap.loadAddress();
};

newPlayMap.loadData = function() {
  newPlayMap.loadJSONFile({path: 'http://localhost/newplay/display/api/organizations.php'});
  newPlayMap.loadJSONFile({path: 'data/events_300.json'});
  newPlayMap.loadJSONFile({path: "data/artists_300.json"});
  newPlayMap.loadJSONFile({path: "data/plays/9344.json"});

  return false;
};

newPlayMap.loadMap = function(){
  // Load map tiles.
  newPlayMap.loadWax();
};

newPlayMap.loadWax = function() {
  // Syntax example. Seeing if Wax works.
  // Custom tiles
   var url = 'http://a.tiles.mapbox.com/v3/newplaymap.map-m3r2xeuk.jsonp' + '?cache=' + Math.floor(Math.random()*11);

// @BUG -- map tiles not loading upon page refresh
// @NOTE seems to need to refresh map so then can trigger loading the rest of the map info
//http://support.mapbox.com/discussions/general-questions/1175-wax-doesnt-load-my-maps-from-tilesmapboxcom-does-load-other-maps
// @TODO redownload wax

// @TODO using simpler map for debugging.

// These work:
/* var url = 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'; */
/* var url = 'http://api.tiles.mapbox.com/v3/mapbox.world-light.jsonp'; */
//var url = 'http://a.tiles.mapbox.com/v3/bclc-apec.map-rslgvy56.jsonp';

// This doesn't work:
/* var url = 'http://a.tiles.mapbox.com/v3/evand.blossoms.jsonp';  */

  // console.log(wax);
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

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);
/*   map.setCenterZoom(new com.modestmaps.Location(30, -90), 4); */

  // Load map marker layers.
  newPlayMap.loadMapLayers();

  newPlayMap.mapCustomizations(map, markers);  

  var jsonLength = Object.keys(jsonData).length
  if (jsonLength >= 4 && newPlayMap.routing.path !== undefined) {
    console.log("routing");
    newPlayMap.lookupRoute();
    newPlayMap.loadFeatureAction();
  };

};


newPlayMap.loadMapLayers = function() {
  newPlayMap.loadMapData();
};

newPlayMap.loadMapData = function() {
 if(jsonData.events !== undefined) {
    markers = new MM.MarkerLayer();
     markers.parent.id = "events-markers";
    map.addLayer(markers);
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
    markers = new MM.MarkerLayer();
     markers.parent.id = "organizations-markers";
    map.addLayer(markers);
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

  markers = new MM.MarkerLayer();
     markers.parent.id = "artists-markers";
  map.addLayer(markers);
  // Load Artist Markers
  var artistMarkerData = {
    type: "artist",
    id: "artist_id",
    label: "ensemble_collective",
    title: "artist_name",
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
    markers = new MM.MarkerLayer();
    markers.parent.id = "play-markers";
    map.addLayer(markers);
 
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
  newPlayMap.onLoadDataMarkers(relatedEventMarkerData);
  }

};
