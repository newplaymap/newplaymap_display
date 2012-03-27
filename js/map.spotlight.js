var map,
    markers,
    spotlight,
    locationsByType = {};

// originals: http://prag.ma/code/modestmaps-js/examples/geojson/icons/

var newPlayMap = {};
var mm = com.modestmaps;

var data = {};
var panelMarkup = {};

window.onload = function() {
  
  $('div#panel-container div#panel').hide();
  
  newPlayMap.initMap();
  newPlayMap.mapCustomizations();  
  newPlayMap.mapButtons();
};

newPlayMap.mapCustomizations = function () {
  map.setZoomRange(0, 7);
};

newPlayMap.initMap = function() {
    var provider = new MM.TemplatedLayer("http://ecn.t{S}.tiles.virtualearth.net/tiles/r{Q}?g=689&mkt=en-us&lbl=l0&stl=m", [0,1,2,3,4,5,6,7]);    
    map = new MM.Map("map", provider, null, [
                new easey.DragHandler(),
                new easey.TouchHandler(),
                new easey.DoubleClickHandler(),
                new easey.MouseWheelHandler()
            ]);
    map.setCenterZoom(new MM.Location(36.9818, -121.9575), 10);
    // 3000 views per month free mapbox account
 
/*
var url = 'http://a.tiles.mapbox.com/v3/newplaymap.map-m3r2xeuk.jsonp';

wax.tilejson(url, function(tilejson) {
  var m = new MM.Map('map',
    new wax.mm.connector(tilejson),
    new MM.Point(700,400));

  m.setCenterZoom(new MM.Location(tilejson.center[1],
    tilejson.center[0]),
    tilejson.center[2] - 3);

  wax.mm.zoomer(m).appendTo(m.parent);
  wax.mm.interaction(m);
});
*/
 
    
    // Syntax example. Seeing if Wax works.
/*
    wax.tilejson('http://a.tiles.mapbox.com/v3/newplaymap.map-m3r2xeuk.jsonp',
        function(tj) {
        map = new com.modestmaps.Map('map',
            new wax.mm.connector(tj), null, [
                new easey.DragHandler(),
                new easey.TouchHandler(),
                new easey.DoubleClickHandler(),
                new easey.MouseWheelHandler()
            ]);
       map.setCenterZoom(new com.modestmaps.Location(30, -90), 4);
    });
*/

    spotlight = new SpotlightLayer();
    map.addLayer(spotlight);

    markers = new MM.MarkerLayer();
    map.addLayer(markers);

    newPlayMap.loadEventMarkers();
};

// ghetto JSON-P
newPlayMap.loadEventMarkers = function() {
    var script = document.createElement("script");
    script.src = "data/events_300.json";
    document.getElementsByTagName("head")[0].appendChild(script);
};

newPlayMap.onLoadEventMarkers = function(collection) {
    data.eventData = collection;

    // onLoadMarkers() gets a GeoJSON FeatureCollection:
    // http://geojson.org/geojson-spec.html#feature-collection-objects
    var features = collection.features,
        len = features.length,
        locations = [];
    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i],
            type = feature.properties["related_play_id"],
            marker = document.createElement("div");

        marker.feature = feature;
        marker.type = type;

        // give it a title
        marker.setAttribute("title", [
            type, "on", feature.properties["Title"]
        ].join(" "));
        // add a class
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", "data/events_300.json");
        
        marker.setAttribute("event_id", feature.properties["event_id"]);

/*         marker.setAttribute("href", "data/events_300.json"); */

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
/*         img.setAttribute("src", "icons/" + type.replace(/ /g, "_") + ".png"); */
        img.setAttribute("src", "icons/event.png");
        
        markers.addMarker(marker, feature);
        // add the marker's location to the extent list
        locations.push(marker.location);

        if (type in locationsByType) {
            locationsByType[type].push(marker.location);
        } else {
            locationsByType[type] = [marker.location];
        }

        // listen for mouseover & mouseout events
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // tell the map to fit all of the locations in the available space
    map.setExtent(locations);
};

newPlayMap.getMarker = function(target) {
    var marker = target;
    while (marker && marker.className != "marker") {
        marker = marker.parentNode;
    }
    return marker;
};

newPlayMap.onMarkerOver = function(e) {
  var marker = newPlayMap.getMarker(e.target);

  if (marker) {
      var type = marker.type;

      if (type in locationsByType) {
          spotlight.addLocations(locationsByType[type] || []);
          spotlight.parent.className = "active";

          $('div#panel-container div#panel').show();
                      
          // Update the panel data.
          newPlayMap.updatePanel(marker, locationsByType[type]);

          
      } else {
          spotlight.parent.className = "inactive";
      }
  }
};

newPlayMap.onMarkerOut = function(e) {

  var marker = newPlayMap.getMarker(e.target);
  if (marker) {
      var type = marker.type;

      spotlight.removeAllLocations();
      
      $('div#panel-container div#panel').hide();
      
      spotlight.parent.className = "inactive";
  }

  return false;
};

newPlayMap.onMarkerClick = function(e) {
  // Address History
  // Set URL
  
  console.log("click");
    

  return false;
};

// @TODO This doesn't seem to connect to any modest map click functions.
// Maybe we do not need something like this. will think about it.
newPlayMap.onMarkerClickOut = function(e) {

  console.log("click out");

};

newPlayMap.updatePanel = function(marker, relatedData) {
console.log(relatedData);
  // @TOOD Right now this will just load events.
  var event_id = marker.getAttribute("event_id");
  feature = newPlayMap.loadDataObject(data.eventData, event_id);
  var panelData = document;
  
  // Load event data into the event template.
  newPlayMap.panelTemplate(feature, "event")
};

newPlayMap.loadDataObject = function(collection, id) {
  // @TODO only one result?
    var featureSet = [];
    var features = collection.features,
        len = features.length,
        locations = [];
    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i];
        if(feature.id == id) {
          return feature;
        }
    }


};

newPlayMap.panelTemplate = function(data, type) {
  var type = type;
  var container = $('#panel-container .' + type);
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    panelMarkup[type] = container.html();
  }

  var content = {};
  container.empty();
  // http://api.jquery.com/jquery.tmpl/

  // @TODO Data may need some escaping.
  $.template( type + "Template", panelMarkup[type]);        
  $.tmpl(type + "Template", data["properties"])
    .appendTo(container); 
}

newPlayMap.mapButtons = function() {
  $(".zoom-in").click(function() {
    map.zoomBy(1);
  });

  $(".zoom-out").click(function() {
    map.zoomBy(-2);
  });
};