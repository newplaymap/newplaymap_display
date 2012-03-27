var map,
    markers,
    spotlight,
    locationsByType = {};

$(document).ready(function(){
  initMap();
});

function initMap() {
    var provider = new MM.TemplatedLayer("http://ecn.t{S}.tiles.virtualearth.net/tiles/r{Q}?g=689&mkt=en-us&lbl=l0&stl=m", [0,1,2,3,4,5,6,7]);
    map = new MM.Map("map", provider);
    map.setCenterZoom(new MM.Location(36.9818, -121.9575), 10);

    spotlight = new SpotlightLayer();
    map.addLayer(spotlight);

    markers = new MM.MarkerLayer();
    map.addLayer(markers);

    loadEventMarkers();
}

// ghetto JSON-P
function loadEventMarkers() {
    var script = document.createElement("script");
    script.src = "data/events_300.json?cache=" + Math.floor(Math.random()*11);
    document.getElementsByTagName("head")[0].appendChild(script);
}

function onLoadEventMarkers(collection) {
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
        marker.setAttribute("class", "report");
        // set the href to link to crimespotting's crime page
        marker.setAttribute("href", "data/events_300.json");

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
        // originals: http://prag.ma/code/modestmaps-js/examples/geojson/icons/
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
        MM.addEvent(marker, "mouseover", onMarkerOver);
        MM.addEvent(marker, "mouseout", onMarkerOut);
    }

    // tell the map to fit all of the locations in the available space
    map.setExtent(locations);
}

function getMarker(target) {
    var marker = target;
    while (marker && marker.className != "report") {
        marker = marker.parentNode;
    }
    return marker;
}

function onMarkerOver(e) {
    var marker = getMarker(e.target);
    if (marker) {
        var type = marker.type;
        // console.log("over:", type);
        if (type in locationsByType) {
            spotlight.addLocations(locationsByType[type] || []);
            spotlight.parent.className = "active";
        } else {
            spotlight.parent.className = "inactive";
        }
    }
}

function onMarkerOut(e) {
    var marker = getMarker(e.target);
    if (marker) {
        var type = marker.type;
        // console.log("out:", type);
        spotlight.removeAllLocations();
        spotlight.parent.className = "inactive";
    }
}

function updatePanel(data) {
  var output = data;
  //$('#panel-container).html(data);
}
