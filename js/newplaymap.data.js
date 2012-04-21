newPlayMap.loadJSONFile = function(vars) {
  var vars = vars;
  var contentData = vars.path + "?cache=" + Math.floor(Math.random()*11);
  var data = "";

  var getData = $.ajax({
    url:  contentData,
    dataType: 'json',
    data: data,
    success: newPlayMap.setData,
    error: newPlayMap.loadDataError
  });
  getData.vars = vars;

};

newPlayMap.loadAPICall = function(vars) {
  var vars = vars;
  var contentData = vars.path + "?cache=" + Math.floor(Math.random()*11);

  var getData = $.ajax({
    url:  contentData,
    dataType: 'json',
    data: vars.data,
    success: newPlayMap.setData,
    error: newPlayMap.loadDataError
  });
  getData.vars = vars;

};

newPlayMap.setData = function(data, statusText, jqxhr) {
  jsonData[data.name] = data;
  jsonData[data.name]["vars"] = jqxhr.vars;
  console.log(data);
/*   console.log(jsonData); */
  var dataMarkers = newPlayMap.onLoadDataMarkers(jqxhr.vars);
  return false;
};

// General function for handling AJAX errors.
newPlayMap.loadDataError = function(data) {
  console.log(data);
  return false;
};

// onLoadMarkers() gets a GeoJSON FeatureCollection
//  http://geojson.org/geojson-spec.html#feature-collection-objects
newPlayMap.onLoadDataMarkers = function(vars) {
    var vars = vars;
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
        
        if(vars.related_play_id !== undefined) {
          marker.setAttribute("related_play_id", feature.properties[vars.related_play_id]);        
        }

        // Unique hash marker id for link
        marker.setAttribute("id", "marker-" + vars.type + "-" + id);
        marker.setAttribute("dataName", vars.dataName);
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", vars.dataPath);
        marker.setAttribute("type", vars.type);

        marker.setAttribute("parent", vars.layer);
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
        // if(vars.grouping_field !== undefined) {
        // 
          marker.setAttribute("grouping_field", vars.grouping_field);
          marker.setAttribute("grouping_value", feature.properties[vars.grouping_field]);
        
          if (feature.properties[vars.grouping_field] in locationsByID) {
            locationsByID[feature.properties[vars.grouping_field]].push(marker.location);
          } else {
            locationsByID[feature.properties[vars.grouping_field]] = [marker.location];
          }
        // }
        // else {
          // Add all of the locations to the array. making them unique for all layers
          if (feature.properties[vars.id] in locationsByID) {
            locationsByID[feature.properties[vars.id]].push(marker.location);
          } else {
            locationsByID[feature.properties[vars.id]] = [marker.location];
          }
        // }

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
    if(vars.zoomLevel === undefined) {
      map.setExtent(locations);
    }
    else {
      // Zoom for feature. By default was zooming in a lot because of set extent and the availability of location data.
      map.setCenterZoom(new MM.Location(locations[0]["lat"],locations[0]["lon"]), vars.zoomLevel);
    }
    // Apply behavior listener for layer type.
    if(vars.callback !== undefined) {
       $(vars.callback);
    }
};
