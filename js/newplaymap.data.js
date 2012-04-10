newPlayMap.loadJSONFile = function(vars) {
  var vars = vars;
  var contentData = vars.path + "?cache=" + Math.floor(Math.random()*11);
  var data = "";

  $.ajax({
    url:  contentData,
    dataType: 'json',
    data: data,
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
        // Unique hash marker id for link
        marker.id = "marker-" + vars.type + "-" + id;
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
        
        markers.addMarker(marker, feature);


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

        // add the marker's location to the extent list
        locations.push(marker.location);

        // Listen for mouseover & mouseout events.
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // Tell the map to fit all of the locations in the available space

    // @TODO this will run on the last loaded item, which may make behavior strange.
    map.setExtent(locations);
};
