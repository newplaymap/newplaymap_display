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




newPlayMap.onLoadDataMarkers = function(data, vars) {
  var vars = vars;

    // onLoadMarkers() gets a GeoJSON FeatureCollection:
    // http://geojson.org/geojson-spec.html#feature-collection-objects
    var features = data.features,
        len = features.length,
        locations = [];  

    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i],
            id = feature.properties[vars.id],
            marker = document.createElement("div");

        marker.feature = feature;
        marker.id = id;

        marker.setAttribute("class", "marker");
        // Link to the name of the data path @TODO test this
        marker.setAttribute("href", vars.dataPath);

/*
        // Embed extra data in the marker.
        for (var i = 0; i < embedData.length; i++) {

          marker.setAttribute(embedData[i]["key"], embedData[i]["value"]);

        }
*/
/*
        @TODO add popup tooltip here
        // give it a title
        marker.setAttribute("title", [
            feature.properties[vars.title], "at", feature.properties["related_theater"]
        ].join(" "));
        // add a class

       
        marker.setAttribute("event_id", feature.properties["event_id"]);
*/

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
        img.setAttribute("src", vars.icon);
        
        markers.addMarker(marker, feature);
        // add the marker's location to the extent list
        locations.push(marker.location);

        if (id in locationsByID) {
            locationsByID[id].push(marker.location);
        } else {
            locationsByID[id] = [marker.location];
        }

        // listen for mouseover & mouseout events
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // tell the map to fit all of the locations in the available space
    map.setExtent(locations);

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
            feature.properties["play_title"], "at", feature.properties["related_theater"]
        ].join(" "));
        // add a class
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", "data/events_300.json");        
        marker.setAttribute("event_id", feature.properties["event_id"]);

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
/*         img.setAttribute("src", "icons/" + type.replace(/ /g, "_") + ".png"); */
        img.setAttribute("src", "icons/event.png");
        
        markers.addMarker(marker, feature);
        // add the marker's location to the extent list
        locations.push(marker.location);

        if (type in locationsByID) {
            locationsByID[type].push(marker.location);
        } else {
            locationsByID[type] = [marker.location];
        }

        // listen for mouseover & mouseout events
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // tell the map to fit all of the locations in the available space
    map.setExtent(locations);
};

newPlayMap.onLoadArtistMarkers = function(collection) {
    data.artistData = collection;

    // onLoadMarkers() gets a GeoJSON FeatureCollection:
    // http://geojson.org/geojson-spec.html#feature-collection-objects
    var features = collection.features,
        len = features.length,
        locations = [];
    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i],
            type = feature.properties["artist_id"],
            marker = document.createElement("div");

        marker.feature = feature;
        marker.type = type;

        // give it a title
        marker.setAttribute("title", [
            feature.properties["play_title"], "at", feature.properties["related_theater"]
        ].join(" "));
        // add a class
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", "data/artists_300.json");
        
        marker.setAttribute("artist_id", feature.properties["artist_id"]);

/*         marker.setAttribute("href", "data/artists_300.json"); */

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
/*         img.setAttribute("src", "icons/" + type.replace(/ /g, "_") + ".png"); */
        img.setAttribute("src", "icons/artist.png");
        
        markers.addMarker(marker, feature);
        // add the marker's location to the extent list
        locations.push(marker.location);

        if (type in locationsByID) {
            locationsByID[type].push(marker.location);
        } else {
            locationsByID[type] = [marker.location];
        }

        // listen for mouseover & mouseout events
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // tell the map to fit all of the locations in the available space
    map.setExtent(locations);
};

newPlayMap.onLoadOrganizationMarkers = function(collection) {
    data.organizationData = collection;

    // onLoadMarkers() gets a GeoJSON FeatureCollection:
    // http://geojson.org/geojson-spec.html#feature-collection-objects
    var features = collection.features,
        len = features.length,
        locations = [];
        

    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i],
            id = feature.properties["organization_id"],
            marker = document.createElement("div");

        marker.feature = feature;
        marker.id = id;

        // give it a title
        marker.setAttribute("title", [
            feature.properties["play_title"], "at", feature.properties["related_theater"]
        ].join(" "));
        // add a class
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", "data/orgs_300.json");
        
        marker.setAttribute("organization_id", feature.properties["organization_id"]);

/*         marker.setAttribute("href", "data/orgs_300.json"); */

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
/*         img.setAttribute("src", "icons/" + type.replace(/ /g, "_") + ".png"); */
        img.setAttribute("src", "icons/organization.png");
        
        markers.addMarker(marker, feature);
        // add the marker's location to the extent list
        locations.push(marker.location);

        if (id in locationsByID) {
            locationsByID[id].push(marker.location);
        } else {
            locationsByID[id] = [marker.location];
        }

        // listen for mouseover & mouseout events
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // tell the map to fit all of the locations in the available space
    map.setExtent(locations);
};

