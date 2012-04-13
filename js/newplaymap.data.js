newPlayMap.routing = newPlayMap.routing || {};

newPlayMap.loadJSONFile = function(vars) {
  var vars = vars;
  var contentData = vars.path + "?cache=" + Math.floor(Math.random()*11);
  var data = "";

  $.ajax({
    url:  contentData,
    dataType: 'json',
    data: data,
    complete: newPlayMap.loadDataComplete,
    success: newPlayMap.setData,
    error: newPlayMap.loadDataError
  });

};

newPlayMap.setData = function(data) {
  jsonData[data.name] = data;
  return false;
};

// General function for handling AJAX errors.
newPlayMap.loadDataError = function(data) {
  console.log(data);
  return false;
};

newPlayMap.loadDataComplete = function() {

};

newPlayMap.loadFeatureAction = function() {
/* console.log(newPlayMap.routing.route); */
  if(newPlayMap.routing.route !== undefined && newPlayMap.routing.route.callback !== undefined && newPlayMap.routing.route.feature !== undefined) {
    $(newPlayMap.routing.route.callback);
/*     console.log(newPlayMap.routing); */
  }
}

newPlayMap.onLoadDataMarkers = function(vars) {
    var vars = vars;
  
    // onLoadMarkers() gets a GeoJSON FeatureCollection:
    // http://geojson.org/geojson-spec.html#feature-collection-objects
    var features = jsonData[vars.dataName].features,
        len = features.length,
        locations = [];  
    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i],
            id = feature.properties[vars.id],
            marker = document.createElement("div");

        marker.feature = feature;
       
        markers.addMarker(marker, feature);

        // Unique hash marker id for link
/*         marker.id = "marker-" + vars.type + "-" + id; */
        marker.setAttribute("id", "marker-" + vars.type + "-" + id);
        marker.setAttribute("dataName", vars.dataName);
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", vars.dataPath);
        marker.setAttribute("type", vars.type);

        // Specially set value for loading data.
        marker.setAttribute("marker_id", id);

        // @TODO add popup tooltip here
        // give it a title
        marker.setAttribute("title", [
          feature.properties[vars.title]
        ]);

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
        img.setAttribute("src", vars.icon);
 

        // Determine placement of highlighting by geocoordinates.
        if(vars.grouping_field !== undefined) {

          marker.setAttribute("grouping_field", vars.grouping_field);
          marker.setAttribute("grouping_value", feature.properties[vars.grouping_field]);

          if (feature.properties[vars.grouping_field] in locationsByID) {
            locationsByID[feature.properties[vars.grouping_field]].push(marker.location);
          } else {
            locationsByID[feature.properties[vars.grouping_field]] = [marker.location];
          }
        }
        else {
          // Add all of the locations to the array. making them unique for all layers
          if (feature.properties[vars.id] in locationsByID) {
            locationsByID[feature.properties[vars.id]].push(marker.location);
          } else {
            locationsByID[feature.properties[vars.id]] = [marker.location];
          }
        }


        // add the marker's location to the extent list
        locations.push(marker.location);

        // Listen for mouseover & mouseout events.
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // Tell the map to fit all of the locations in the available space
    
    // @TODO this will run on the last loaded item, which may make behavior strange.
    // Actually no it is probably fine so long as locations is global.
    map.setExtent(locations);
};
