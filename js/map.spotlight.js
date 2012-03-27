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
  newPlayMap.initMap();
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

/*
    // Syntax example. Seeing if Wax works.
    wax.tilejson('http://a.tiles.mapbox.com/v3/mapbox.world-bright.jsonp',
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
            marker = document.createElement("a");

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

        newPlayMap.updatePanel(marker);

        var type = marker.type;
        // console.log("over:", type);
        if (type in locationsByType) {
            spotlight.addLocations(locationsByType[type] || []);
            spotlight.parent.className = "active";
        } else {
            spotlight.parent.className = "inactive";
        }
    }
};

newPlayMap.onMarkerOut = function(e) {
    var marker = newPlayMap.getMarker(e.target);
    if (marker) {
        var type = marker.type;
        // console.log("out:", type);
        spotlight.removeAllLocations();
        spotlight.parent.className = "inactive";
    }
};

newPlayMap.updatePanel = function(marker) {

  console.log(marker);
  var event_id = marker.getAttribute("event_id");
  feature = newPlayMap.loadDataObject(data.eventData, event_id);
  var panelData = document;

  console.log(feature);
  
/*   $('#panel-container').html(event_id); */
  
  
  newPlayMap.eventTemplate(feature, "event")
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

newPlayMap.eventTemplate = function(data, type) {
console.log(data);
  var type = type;
  var container = $('#panel-container .' + type);
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    panelMarkup[type] = container.html();
  }

  var content = {};
  
  container.empty();


  // http://api.jquery.com/jquery.tmpl/
  
  $.template( "eventTemplate", panelMarkup[type]);        

  $.tmpl("eventTemplate", data["properties"])
    .appendTo(container); 
    


/*   for (var i in data) { */
/*     for (key in almanac.content[i]) { */
/*       if(data.content[i][key].type == type) { */
/*        foodContent.key = key; */
      
/*         for (item in almanac.content[i][key]) { */
/*           if(item == "title") { */
/*             foodContent.title = almanac.content[i][key][item]; */
/*           } */
/*         } */
    /*
      $.tmpl("eventTemplate", data["properties"])
          .appendTo(container);
*/
/*       } */
/*     } */
/*   } */

}