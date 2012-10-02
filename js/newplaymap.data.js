var newPlayMap = newPlayMap || {};
newPlayMap.data = newPlayMap.data || {};
newPlayMap.loadingStack = newPlayMap.loadingStack || [];
newPlayMap.loadingStackCallbacks = newPlayMap.loadingStackCallbacks || $.Callbacks();

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

/*
 * Function to load content from an API file
 *
 * Sample options to pass in as the vars object:
 *   data: data,
 *   zoomLevel: newPlayMap.defaultZoom,
 *   clearLayer: true,
 *   clearLayers: true,
 *   loadProfile: loadProfile,
 *   template: "organization",
 *   layer: "layer-organization-filter",
 *   class: "inactive",
 *   template: "organization-template",
 *   type: "organization",
 *   label: "org_type",
 *   id: "organization_id",
 *   title: "name",
 *   resultsTitle: "What's on Today",
 *   dataName: "organizations_filter",
 *   path: 'api/organizations_filter.php?' + pathQuery,
 *   dataPath: "api/organizations_filter.php?" + pathQuery,
 *   icon: "icons/organization.png",
 *   callback: newPlayMap.loadOrganizationFilter
 */
newPlayMap.loadAPICall = function(vars) {
  var vars = vars;
  var contentData = vars.path + "&cache=" + Math.floor(Math.random()*11);
  var getData = $.ajax({
    url:  contentData,
    dataType: 'json',
    data: vars.data,
    beforeSend: newPlayMap.filters.loadingFeedback,
    success: newPlayMap.setData,
    error: newPlayMap.loadDataError
  });
  getData.vars = vars;

};

newPlayMap.setData = function(data, statusText, jqxhr) {
  jsonData[data.name] = data;
  jsonData[data.name]["vars"] = jqxhr.vars;

  if (data.name == 'plays_filter') {
    var data = newPlayMap.data.onLoadDataNoLocation(jqxhr.vars);
  }
  else {
    var dataMarkers = newPlayMap.onLoadDataMarkers(jqxhr.vars);
  }
  
  if (newPlayMap.filters.loadingCompleteFeedback) {
    newPlayMap.filters.loadingCompleteFeedback(data.name);
  }
  return false;
};

newPlayMap.toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// General function for handling AJAX errors.
newPlayMap.loadDataError = function(data) {
  // console.log(data);
  return false;
};

/*
 * Helper function to clear markers by layer
 */
newPlayMap.data.clearLayer = function(layerName) {
  // @TODO: I don't know why there was no variable in dataName. 
  // This was probably just never needed and unfinished.
  var layerName = layerName || '';
  // $('a.marker[dataName=' +   + ']').remove(); // Original
  $('a.marker[dataName=' + layerName + ']').remove();
}

/*
* Helper function to clear all layer
*/
newPlayMap.data.clearAllLayers = function() {
  $('div#play-journey').remove();
  $('a.marker[dataName=play]').remove();
  $('a.marker[dataName=artists_filter]').remove();
  $('a.marker[dataName=events_filter]').remove();
  $('a.marker[dataName=plays_filter]').remove();
  $('a.marker[dataName=organizations_filter]').remove();

  spotlight.parent.className = "inactive";
  spotlight.removeAllLocations();
  $('a.marker').css({ 'opacity' : 1 });
}


// onLoadMarkers() gets a GeoJSON FeatureCollection
//  http://geojson.org/geojson-spec.html#feature-collection-objects
newPlayMap.onLoadDataMarkers = function(vars) {
  var vars = vars;
  // console.log(vars);
  // Clean out featuresByLocation.
  featuresByLocation = {};
  var features = jsonData[vars.dataName].features,
      len = features.length,
      locations = [];

  // Remove divs if they exist and API function requests that they be cleared.
  if(vars.clearLayer === true) {
    newPlayMap.data.clearLayer();
  }
  
  // @TODO: Write a new attribute, something like appendAndRemove that handles the "stack"

  // Remove new layers
  if(vars.clearLayers === true) {
    newPlayMap.data.clearAllLayers();
  }
  


  // for each feature in the collection, create a marker and add it
  // to the markers layer
  // Only if it has a location
  // @TODO: Refactor with newPlayMap.data.onLoadDataNoLocation if this function can handle features without locations
  for (var i = 0; i < len; i++) {
      var feature = features[i],
          id = feature.properties[vars.id],
          marker = document.createElement("a");
      if(typeof feature.geometry != 'undefined') {
        marker.feature = feature;
        var latlon = feature.properties.latitude + "," + feature.properties.longitude;

        markers.addMarker(marker, feature);

        if(vars.related_play_id !== undefined) {
          marker.setAttribute("related_play_id", feature.properties[vars.related_play_id]);        
        }

        // Unique hash marker id for link
        marker.setAttribute("id", "marker-" + vars.type + "-" + id);
        marker.setAttribute("dataName", vars.dataName);
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", feature.properties.path);
        marker.setAttribute("type", vars.type);
        marker.setAttribute("latlon", latlon);

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

          marker.setAttribute("grouping_field", vars.grouping_field);
          marker.setAttribute("grouping_value", feature.properties[vars.grouping_field]);

          // Push to array of items on same latlon.
          if (latlon in featuresByLocation) {
            featuresByLocation[latlon].push(feature);
          } else {
            featuresByLocation[latlon] = [feature];
          }

          // Make sure marker has a location before adding it
          if (marker.location.lat != 0 && marker.location.lon != 0) {
             if (feature.properties[vars.grouping_field] in locationsByID) {
                locationsByID[feature.properties[vars.grouping_field]].push(marker.location);
              } else {
                locationsByID[feature.properties[vars.grouping_field]] = [marker.location];
              }

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
  }

  // Load result data for this set of features.
  newPlayMap.loadResults(features, vars);


  // Load profiles if called for
  // -- @TODO: Load this based on the features (or the jsonData object) instead of a marker. That way it will work with conent that doesn't have a pin.
  if (vars.loadProfile == true) {
    // Get the last marker
    var markerLength = markers.markers.length - 1;
    var thisMarker = markers.markers[markerLength];
    
    newPlayMap.updatePanel(thisMarker);
    // Set address
    window.location.hash = '#' + thisMarker.feature.properties.path
  }

  // Tell the map to fit all of the locations in the available space
  
  // @TODO this will run on the last loaded item, which may make behavior strange.
  // Actually no it is probably fine so long as locations is global.
  if(vars.zoomLevel === undefined) {
    //map.setExtent(locations);
  //map.setCenterZoom(new MM.Location(locations[0]["lat"],locations[0]["lon"]), 4);
  }
  else {
    // Zoom for feature. By default was zooming in a lot because of set extent and the availability of location data.
    // map.setCenterZoom(new MM.Location(locations[0]["lat"],locations[0]["lon"]), vars.zoomLevel);
  }
  // Apply behavior listener for layer type.
  if(vars.callback !== undefined) {
     $(vars.callback);
  }
};


/**
 * Function to load data that doesn't have geo location data
 *
 * gets a GeoJSON FeatureCollection
 * -- http://geojson.org/geojson-spec.html#feature-collection-objects
 */
// @TODO: Think about refactoring this in with newPlayMap.onLoadDataMarkers and just have that check whether there is a marker or not. That would maybe handle data that should have a marker but doesn't have a location.
newPlayMap.data.onLoadDataNoLocation = function(vars) {
  var vars = vars;

  var features = jsonData[vars.dataName].features,
      len = features.length

  // Load result data for this set of features.
  newPlayMap.loadResults(features, vars);

  // Apply behavior listener for layer type.
  if(vars.callback !== undefined) {
     $(vars.callback);
  }
};